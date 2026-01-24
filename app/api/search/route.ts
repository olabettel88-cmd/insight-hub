import { supabase, checkDailyLimit, logActivity } from '@/lib/auth';
import { headers } from 'next/headers';

// This would integrate with breach.rip or other configured API
async function performSearch(query: string, type: string, apiConfig: string) {
  try {
    // This is a placeholder. In production, call the actual breach.rip API
    // or whatever API is configured in the admin panel
    const response = await fetch(`https://api.breach.rip/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiConfig}`,
      },
      body: JSON.stringify({
        query,
        type,
      }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('[v0] Search API error:', error);
    // Return mock data for demo
    return {
      query,
      type,
      resultsCount: 0,
      data: [],
    };
  }
}

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
    const userAgent = headersList.get('user-agent') || '';

    if (!authHeader) {
      return Response.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Extract user ID from token (in production, use JWT verification)
    const token = authHeader.replace('Bearer ', '');
    let userId: string;

    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      userId = decoded.userId;
    } catch {
      return Response.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { query, type } = body;

    if (!query || !type) {
      return Response.json(
        { message: 'Query and type are required' },
        { status: 400 }
      );
    }

    // Check daily limit
    const hasLimit = await checkDailyLimit(userId);
    if (!hasLimit) {
      await logActivity(userId, 'SEARCH_LIMIT_EXCEEDED', {
        ip,
        userAgent,
        metadata: { query, type },
      });
      return Response.json(
        { message: 'Daily search limit exceeded' },
        { status: 429 }
      );
    }

    // Get API configuration
    const { data: apiConfigs } = await supabase
      .from('api_config')
      .select('*')
      .eq('is_active', true)
      .limit(1);

    if (!apiConfigs || apiConfigs.length === 0) {
      return Response.json(
        { message: 'Search service temporarily unavailable' },
        { status: 503 }
      );
    }

    // Perform search
    const startTime = Date.now();
    const searchResults = await performSearch(query, type, apiConfigs[0].api_key || '');
    const searchDuration = Date.now() - startTime;

    // Store search history
    const { data: searchRecord } = await supabase
      .from('search_history')
      .insert({
        user_id: userId,
        query_type: type,
        query_value: query,
        api_used: apiConfigs[0].api_name,
        results_count: searchResults.resultsCount || 0,
        found_data: searchResults,
        search_duration_ms: searchDuration,
        ip_address: ip,
        user_agent: userAgent,
      })
      .select()
      .single();

    // Log activity
    await logActivity(userId, 'SEARCH_EXECUTED', {
      ip,
      userAgent,
      endpoint: '/api/search',
      responseStatus: 200,
      responseTimeMs: searchDuration,
      metadata: {
        query,
        type,
        resultsCount: searchResults.resultsCount || 0,
      },
    });

    return Response.json({
      id: searchRecord?.id,
      query,
      type,
      results: searchResults,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[v0] Search endpoint error:', error);
    return Response.json(
      { message: 'An error occurred during search' },
      { status: 500 }
    );
  }
}
