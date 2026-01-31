import { supabase, checkDailyLimit, logActivity } from '@/lib/auth';
import { headers } from 'next/headers';
import { authenticateRequest } from '@/lib/middleware/auth';

// Mapping of module IDs to Breach.rip endpoints and configurations
const MODULE_CONFIG: Record<string, { endpoint: string, method: string, paramType?: string, apiType?: 'cat' | 'dog' }> = {
  // OSINT Tools
  'email-osint': { endpoint: '/osintcat/email-osint', method: 'GET' },
  'username-search': { endpoint: '/osintcat/username', method: 'GET' },
  'twitter-osint': { endpoint: '/osintcat/username', method: 'GET' }, // Fallback
  'phone-lookup': { endpoint: '/osintcat/phone-osint', method: 'GET' },
  'github-osint': { endpoint: '/osintcat/github-osint', method: 'GET' },
  'us-npd': { endpoint: '/osintcat/npd', method: 'GET' },
  'ip-lookup': { endpoint: '/osintcat/ip', method: 'GET' },
  'dns-resolver': { endpoint: '/osintcat/domain', method: 'GET' },
  'breach-lookup': { endpoint: '/osintcat/breach', method: 'GET' },
  'reddit-lookup': { endpoint: '/osintcat/reddit', method: 'GET' },
  'datahound': { endpoint: '/osintdog/search', method: 'POST', paramType: 'universal' },
  'vin-lookup': { endpoint: '/osintdog/search', method: 'POST', paramType: 'universal' }, // Fallback
  
  // Gaming & Social
  'discord-lookup': { endpoint: '/osintcat/discord', method: 'GET' },
  'discord-monitor': { endpoint: '/osintcat/discord-stalker', method: 'GET' },
  'discord-roblox': { endpoint: '/osintcat/discord-to-roblox', method: 'GET' },
  'roblox-lookup': { endpoint: '/osintcat/roblox', method: 'GET' },
  'minecraft-lookup': { endpoint: '/osintcat/minecraft', method: 'GET' },
  'crowsint': { endpoint: '/osintdog/search', method: 'POST', paramType: 'universal' },
  
  // Breach Data
  'stealer-logs': { endpoint: '/osintdog/snusbase', method: 'POST', paramType: 'snusbase' },
  'email-breach': { endpoint: '/osintdog/leakcheck', method: 'POST', paramType: 'leakcheck', apiType: 'dog' },
  'username-breach': { endpoint: '/osintdog/leakcheck', method: 'POST', paramType: 'leakcheck', apiType: 'dog' },
  'phone-breach': { endpoint: '/osintdog/leakcheck', method: 'POST', paramType: 'leakcheck', apiType: 'dog' },
  'hackcheck': { endpoint: '/osintdog/hackcheck', method: 'POST', paramType: 'hackcheck' },
  'breachbase': { endpoint: '/osintdog/breachbase', method: 'POST', paramType: 'breachbase' },
  'intelvault': { endpoint: '/osintdog/intelvault', method: 'POST', paramType: 'universal' },
  'shodan-host': { endpoint: '/osintdog/shodan-host', method: 'POST', paramType: 'shodan' },
  'leakosint': { endpoint: '/leakosint-api', method: 'POST', paramType: 'leakosint' },
  'intelx-file': { endpoint: '/osintdog/search', method: 'POST', paramType: 'universal' }, // Fallback
  'intelx-id': { endpoint: '/osintdog/search', method: 'POST', paramType: 'universal' }, // Fallback
  'subdomain': { endpoint: '/osintcat/domain', method: 'GET' },
  'shodan': { endpoint: '/osintcat/ip', method: 'GET' } // Fallback
};

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for') || '';
    const ip = forwardedFor.split(',')[0].trim() || headersList.get('x-real-ip') || 'unknown';
    const userAgent = headersList.get('user-agent') || '';

    // 1. Authenticate User
    const auth = await authenticateRequest(request as any);
    if (!auth.authenticated || !auth.user) {
      return Response.json({ message: auth.error || 'Unauthorized' }, { status: 401 });
    }
    const userId = auth.user.userId;

    // 2. Parse Request
    const body = await request.json();
    const { module, query } = body;

    if (!module || !query) {
      return Response.json({ message: 'Module and query are required' }, { status: 400 });
    }

    // 3. Check Daily Limit
    const hasLimit = await checkDailyLimit(userId);
    if (!hasLimit) {
      await logActivity(userId, 'SEARCH_LIMIT_EXCEEDED', { ip, userAgent, metadata: { module, query } });
      return Response.json({ message: 'Daily search limit exceeded' }, { status: 429 });
    }

    // 4. Get API Key from Config
    const { data: apiConfigs } = await supabase
      .from('api_config')
      .select('*')
      .eq('is_active', true);

    // Prioritize specific module key, then general breach_rip key, then any active key
    const config = apiConfigs?.find(c => c.api_name === module) || apiConfigs?.find(c => c.api_name === 'breach_rip') || apiConfigs?.[0];
    const apiKey = config?.api_key || process.env.BREACH_RIP_API_KEY;

    if (!apiKey) {
      console.warn('No active API configuration found.');
       return Response.json({ success: false, message: 'Service temporarily unavailable (Config Error)' }, { status: 503 });
    }

    // 5. Construct API Request
    const moduleConfig = MODULE_CONFIG[module];
    if (!moduleConfig) {
      return Response.json({ message: 'Invalid module' }, { status: 400 });
    }

    const baseUrl = 'https://www.breach.rip/api';
    let url = `${baseUrl}${moduleConfig.endpoint}`;
    let method = moduleConfig.method;
    let apiBody = undefined;

    // Handle GET Parameters
    if (method === 'GET') {
      const params = new URLSearchParams();
      if (module === 'us-npd') {
        // NPD requires first_name and last_name.
        // Input query is expected to be "FirstName LastName"
        const parts = query.trim().split(/\s+/);
        if (parts.length >= 2) {
          const firstName = parts[0];
          const lastName = parts.slice(1).join(' ');
          url += `?first_name=${encodeURIComponent(firstName)}&last_name=${encodeURIComponent(lastName)}`;
        } else {
           // Fallback if user only entered one name
           url += `?first_name=${encodeURIComponent(query)}&last_name=`;
        }
      } else if (module === 'minecraft-lookup') {
          url += `?query=${encodeURIComponent(query)}&type=username`; // Default type
      } else {
          // Standard query param
          url += `?query=${encodeURIComponent(query)}`;
      }
    } 
    // Handle POST Body
    else if (method === 'POST') {
        const paramType = moduleConfig.paramType;
        
        if (paramType === 'universal') {
            // Universal Search (Datahound, Crowsint)
            // Need to guess search_field based on query input
            let searchField = 'username';
            if (query.includes('@')) searchField = 'email';
            else if (query.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) searchField = 'ip';
            else if (query.match(/^[0-9]+$/) && query.length > 7) searchField = 'phone';
            else if (query.includes('.')) searchField = 'domain';

            apiBody = JSON.stringify({
                search_field: searchField,
                search_value: query
            });
        } else if (paramType === 'snusbase') {
            // Snusbase (Stealer Logs)
             apiBody = JSON.stringify({
                terms: [query],
                types: ["email", "username", "lastip", "hash", "password"],
                wildcard: true
            });
        } else if (paramType === 'leakcheck') {
             // LeakCheck (Breach modules)
             let searchType = 'auto';
             if (module === 'email-breach') searchType = 'email';
             if (module === 'username-breach') searchType = 'username';
             if (module === 'phone-breach') searchType = 'phone';
             
             apiBody = JSON.stringify({
                 term: query,
                 search_type: searchType
             });
        } else if (paramType === 'breachbase') {
             // BreachBase
             apiBody = JSON.stringify({
                 term: query,
                 search_type: 'email' // Default to email, could be smarter
             });
        } else if (paramType === 'shodan') {
             // Shodan Host
             apiBody = JSON.stringify({
                 ip: query
             });
        } else if (paramType === 'leakosint') {
             // LeakOsint
             apiBody = JSON.stringify({
                 request: query,
                 limit: 100,
                 lang: 'en'
             });
        }
    }

    console.log(`[Proxy] Requesting ${method} ${url}`);

    const apiResponse = await fetch(url, {
      method,
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: apiBody
    });

    const data = await apiResponse.json();

    // 7. Log Activity
    await logActivity(userId, 'SEARCH_PERFORMED', {
      ip,
      userAgent,
      metadata: { module, query, status: apiResponse.status }
    });

    return Response.json(data);

  } catch (error) {
    console.error('[OSINT API] Error:', error);
    return Response.json({ message: 'Internal server error' }, { status: 500 });
  }
}
