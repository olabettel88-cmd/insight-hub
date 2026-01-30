import { supabase } from './auth';

export interface Badge {
  type: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  requirements: {
    field: string;
    operator: 'gte' | 'lte' | 'eq' | 'gt' | 'lt';
    value: number | string | boolean;
  }[];
}

export const BADGE_DEFINITIONS: Badge[] = [
  {
    type: 'newcomer',
    name: 'Newcomer',
    description: 'Welcome to the platform',
    icon: '🌟',
    color: '#64748b',
    requirements: [],
  },
  {
    type: 'verified',
    name: 'Verified',
    description: 'Email and Telegram verified',
    icon: '✓',
    color: '#22c55e',
    requirements: [
      { field: 'telegram_id', operator: 'gt', value: 0 },
    ],
  },
  {
    type: 'subscriber',
    name: 'Subscriber',
    description: 'Active subscription holder',
    icon: '💎',
    color: '#3b82f6',
    requirements: [
      { field: 'subscription_plan', operator: 'gt', value: 'free' },
    ],
  },
  {
    type: 'power_user',
    name: 'Power User',
    description: 'Completed 100+ searches',
    icon: '⚡',
    color: '#f59e0b',
    requirements: [],
  },
  {
    type: 'veteran',
    name: 'Veteran',
    description: 'Member for over 6 months',
    icon: '🏆',
    color: '#8b5cf6',
    requirements: [],
  },
  {
    type: 'elite',
    name: 'Elite',
    description: 'Lifetime subscription holder',
    icon: '👑',
    color: '#eab308',
    requirements: [
      { field: 'subscription_plan', operator: 'eq', value: 'lifetime' },
    ],
  },
  {
    type: 'referrer',
    name: 'Referrer',
    description: 'Referred 5+ users',
    icon: '🤝',
    color: '#ec4899',
    requirements: [
      { field: 'total_referrals', operator: 'gte', value: 5 },
    ],
  },
  {
    type: 'top_referrer',
    name: 'Top Referrer',
    description: 'Referred 25+ users',
    icon: '🌟',
    color: '#f43f5e',
    requirements: [
      { field: 'total_referrals', operator: 'gte', value: 25 },
    ],
  },
  {
    type: 'trusted',
    name: 'Trusted',
    description: 'Low risk score, verified identity',
    icon: '🛡️',
    color: '#14b8a6',
    requirements: [
      { field: 'risk_score', operator: 'lte', value: 10 },
    ],
  },
  {
    type: 'early_adopter',
    name: 'Early Adopter',
    description: 'Among the first 100 users',
    icon: '🚀',
    color: '#6366f1',
    requirements: [],
  },
];

export const BADGE_LEVELS: Record<string, number> = {
  'newcomer': 0,
  'verified': 1,
  'subscriber': 2,
  'power_user': 3,
  'veteran': 4,
  'elite': 5,
  'referrer': 3,
  'top_referrer': 5,
  'trusted': 4,
  'early_adopter': 3,
};

export function getBadgeDefinition(type: string): Badge | undefined {
  return BADGE_DEFINITIONS.find(b => b.type === type);
}

export async function getUserBadges(userId: string): Promise<Badge[]> {
  const { data: userBadges } = await supabase
    .from('user_badges')
    .select('badge_type')
    .eq('user_id', userId);

  if (!userBadges) return [];

  return userBadges
    .map(ub => getBadgeDefinition(ub.badge_type))
    .filter((b): b is Badge => b !== undefined);
}

export async function awardBadge(userId: string, badgeType: string): Promise<boolean> {
  const badge = getBadgeDefinition(badgeType);
  if (!badge) return false;

  const { error } = await supabase
    .from('user_badges')
    .upsert({
      user_id: userId,
      badge_type: badgeType,
      badge_name: badge.name,
      badge_description: badge.description,
    }, {
      onConflict: 'user_id,badge_type',
    });

  return !error;
}

export async function checkAndAwardBadges(userId: string): Promise<string[]> {
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (!user) return [];

  const awarded: string[] = [];

  await awardBadge(userId, 'newcomer');
  awarded.push('newcomer');

  if (user.telegram_id) {
    await awardBadge(userId, 'verified');
    awarded.push('verified');
  }

  if (user.subscription_plan && user.subscription_plan !== 'free') {
    await awardBadge(userId, 'subscriber');
    awarded.push('subscriber');

    if (user.subscription_plan === 'lifetime') {
      await awardBadge(userId, 'elite');
      awarded.push('elite');
    }
  }

  if (user.total_referrals >= 5) {
    await awardBadge(userId, 'referrer');
    awarded.push('referrer');
  }

  if (user.total_referrals >= 25) {
    await awardBadge(userId, 'top_referrer');
    awarded.push('top_referrer');
  }

  if (user.risk_score <= 10) {
    await awardBadge(userId, 'trusted');
    awarded.push('trusted');
  }

  const { count } = await supabase
    .from('search_history')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (count && count >= 100) {
    await awardBadge(userId, 'power_user');
    awarded.push('power_user');
  }

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  if (new Date(user.created_at) < sixMonthsAgo) {
    await awardBadge(userId, 'veteran');
    awarded.push('veteran');
  }

  const highestBadge = awarded
    .sort((a, b) => (BADGE_LEVELS[b] || 0) - (BADGE_LEVELS[a] || 0))[0];

  if (highestBadge && user.badge_level !== highestBadge) {
    await supabase
      .from('users')
      .update({ badge_level: highestBadge })
      .eq('id', userId);
  }

  return awarded;
}

export function getBadgeDisplayInfo(badgeType: string): { icon: string; color: string; name: string } {
  const badge = getBadgeDefinition(badgeType);
  return {
    icon: badge?.icon || '🌟',
    color: badge?.color || '#64748b',
    name: badge?.name || 'Unknown',
  };
}
