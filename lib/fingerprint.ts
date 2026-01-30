import { createHash } from 'crypto';
import { supabase } from './auth';

export interface DeviceFingerprint {
  fingerprintHash: string;
  browserInfo: {
    userAgent: string;
    language: string;
    cookiesEnabled: boolean;
    doNotTrack: boolean;
  };
  screenInfo: {
    width: number;
    height: number;
    colorDepth: number;
    pixelRatio: number;
  };
  hardwareInfo: {
    cpuCores: number;
    memory: number;
    platform: string;
  };
  timezone: string;
  platform: string;
}

export interface ThreatAnalysis {
  isVPN: boolean;
  isProxy: boolean;
  isTor: boolean;
  isDatacenter: boolean;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  threatScore: number;
  riskFactors: string[];
}

export function generateFingerprintHash(data: Partial<DeviceFingerprint>): string {
  const fingerprint = [
    data.browserInfo?.userAgent || '',
    data.browserInfo?.language || '',
    data.screenInfo?.width || 0,
    data.screenInfo?.height || 0,
    data.screenInfo?.colorDepth || 0,
    data.hardwareInfo?.cpuCores || 0,
    data.hardwareInfo?.platform || '',
    data.timezone || '',
  ].join('|');

  return createHash('sha256').update(fingerprint).digest('hex');
}

export async function storeDeviceFingerprint(
  userId: string,
  fingerprint: Partial<DeviceFingerprint>
): Promise<void> {
  const fingerprintHash = fingerprint.fingerprintHash || generateFingerprintHash(fingerprint);

  const { data: existing } = await supabase
    .from('device_fingerprints')
    .select('id, user_id, total_uses')
    .eq('fingerprint_hash', fingerprintHash)
    .single();

  if (existing) {
    const isSuspicious = existing.user_id !== userId;
    
    await supabase
      .from('device_fingerprints')
      .update({
        last_seen_at: new Date().toISOString(),
        total_uses: (existing.total_uses || 0) + 1,
        is_suspicious: isSuspicious,
      })
      .eq('id', existing.id);

    if (isSuspicious) {
      await supabase.from('multi_account_links').upsert({
        primary_user_id: existing.user_id,
        linked_user_id: userId,
        link_type: 'same_device',
        confidence_score: 80,
        evidence: [{
          type: 'fingerprint_match',
          fingerprint_hash: fingerprintHash,
          detected_at: new Date().toISOString(),
        }],
      }, {
        onConflict: 'primary_user_id,linked_user_id',
      });
    }
  } else {
    await supabase.from('device_fingerprints').insert({
      fingerprint_hash: fingerprintHash,
      user_id: userId,
      browser_info: fingerprint.browserInfo || {},
      screen_info: fingerprint.screenInfo || {},
      hardware_info: fingerprint.hardwareInfo || {},
      timezone: fingerprint.timezone,
      platform: fingerprint.platform,
    });
  }
}

export async function analyzeIP(ipAddress: string): Promise<ThreatAnalysis> {
  const { data: cached } = await supabase
    .from('ip_intelligence')
    .select('*')
    .eq('ip_address', ipAddress)
    .single();

  if (cached) {
    await supabase
      .from('ip_intelligence')
      .update({
        last_seen_at: new Date().toISOString(),
        total_requests: (cached.total_requests || 0) + 1,
      })
      .eq('id', cached.id);

    return {
      isVPN: cached.is_vpn || false,
      isProxy: cached.is_proxy || false,
      isTor: cached.is_tor || false,
      isDatacenter: cached.is_datacenter || false,
      threatLevel: cached.threat_level || 'low',
      threatScore: cached.threat_score || 0,
      riskFactors: [],
    };
  }

  const analysis: ThreatAnalysis = {
    isVPN: false,
    isProxy: false,
    isTor: false,
    isDatacenter: false,
    threatLevel: 'low',
    threatScore: 0,
    riskFactors: [],
  };

  const knownBadRanges = [
    '10.',
    '192.168.',
    '172.16.',
  ];

  for (const range of knownBadRanges) {
    if (ipAddress.startsWith(range)) {
      analysis.threatScore += 10;
      analysis.riskFactors.push('private_ip_range');
    }
  }

  if (analysis.threatScore >= 70) {
    analysis.threatLevel = 'critical';
  } else if (analysis.threatScore >= 50) {
    analysis.threatLevel = 'high';
  } else if (analysis.threatScore >= 30) {
    analysis.threatLevel = 'medium';
  }

  await supabase.from('ip_intelligence').insert({
    ip_address: ipAddress,
    is_vpn: analysis.isVPN,
    is_proxy: analysis.isProxy,
    is_tor: analysis.isTor,
    is_datacenter: analysis.isDatacenter,
    threat_level: analysis.threatLevel,
    threat_score: analysis.threatScore,
  });

  return analysis;
}

export async function detectMultiAccount(
  userId: string,
  ipAddress: string,
  fingerprintHash?: string
): Promise<{ isMultiAccount: boolean; linkedAccounts: string[]; confidence: number }> {
  const linkedAccounts: string[] = [];
  let maxConfidence = 0;

  const { data: ipMatches } = await supabase
    .from('sessions')
    .select('user_id')
    .eq('ip_address', ipAddress)
    .neq('user_id', userId)
    .eq('is_active', true);

  if (ipMatches) {
    for (const match of ipMatches) {
      if (!linkedAccounts.includes(match.user_id)) {
        linkedAccounts.push(match.user_id);
        maxConfidence = Math.max(maxConfidence, 60);
      }
    }
  }

  if (fingerprintHash) {
    const { data: fpMatches } = await supabase
      .from('device_fingerprints')
      .select('user_id')
      .eq('fingerprint_hash', fingerprintHash)
      .neq('user_id', userId);

    if (fpMatches) {
      for (const match of fpMatches) {
        if (!linkedAccounts.includes(match.user_id)) {
          linkedAccounts.push(match.user_id);
          maxConfidence = Math.max(maxConfidence, 80);
        }
      }
    }
  }

  return {
    isMultiAccount: linkedAccounts.length > 0,
    linkedAccounts,
    confidence: maxConfidence,
  };
}

export async function flagSuspiciousActivity(
  userId: string,
  activityType: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  description: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await supabase.from('suspicious_activity').insert({
    user_id: userId,
    activity_type: activityType,
    severity,
    description,
    metadata: metadata || {},
  });
}
