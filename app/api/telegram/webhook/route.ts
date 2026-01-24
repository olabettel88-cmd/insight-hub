import { supabase } from '@/lib/auth';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

async function sendTelegramMessage(chatId: string, text: string, parseMode: string = 'HTML') {
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('[v0] Telegram message error:', error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = body.message;

    if (!message || !message.text) {
      return Response.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text.trim();
    const userId = message.from.id;
    const username = message.from.username || 'unknown';

    // Handle /start command
    if (text === '/start') {
      const welcomeMessage = `
Welcome to <b>OSINT Platform Bot</b>! 🔍

To connect your account, send your connection code.

<b>Commands:</b>
/link - Link your account with a code
/search - Search for information
/status - Check your account status
/help - Show available commands
      `;

      await sendTelegramMessage(chatId, welcomeMessage);
      return Response.json({ ok: true });
    }

    // Handle /help command
    if (text === '/help') {
      const helpMessage = `
<b>Available Commands:</b>

<code>/link CODE</code> - Connect your account
<b>Example:</b> <code>/link ABC123</code>

<code>/search TYPE QUERY</code> - Perform a search
<b>Example:</b> <code>/search email user@example.com</code>

<code>/status</code> - View your account status

<code>/searches</code> - Check remaining daily searches

<b>Search Types:</b>
• email
• domain
• username
• phone
      `;

      await sendTelegramMessage(chatId, helpMessage);
      return Response.json({ ok: true });
    }

    // Handle /link command
    if (text.startsWith('/link ')) {
      const code = text.replace('/link ', '').trim().toUpperCase();

      if (!code || code.length < 6) {
        await sendTelegramMessage(
          chatId,
          '❌ Invalid code format. Code must be at least 6 characters.'
        );
        return Response.json({ ok: true });
      }

      // Find user with this code
      const { data: user, error } = await supabase
        .from('users')
        .select('id, username, telegram_connected_at')
        .eq('telegram_code', code)
        .single();

      if (error || !user) {
        await sendTelegramMessage(
          chatId,
          '❌ Invalid code. Please check and try again.'
        );
        return Response.json({ ok: true });
      }

      if (user.telegram_connected_at) {
        await sendTelegramMessage(
          chatId,
          '⚠️ This account is already connected to Telegram.'
        );
        return Response.json({ ok: true });
      }

      // Link the accounts
      await supabase
        .from('users')
        .update({
          telegram_id: userId.toString(),
          telegram_connected_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      await sendTelegramMessage(
        chatId,
        `✅ <b>Account Linked!</b>\n\nYour OSINT platform account <code>${user.username}</code> is now connected.\n\nYou can now use commands to perform searches directly from Telegram!`
      );

      return Response.json({ ok: true });
    }

    // Handle /status command
    if (text === '/status') {
      const { data: user } = await supabase
        .from('users')
        .select('username, subscription_plan, daily_searches_used, daily_search_limit')
        .eq('telegram_id', userId.toString())
        .single();

      if (!user) {
        await sendTelegramMessage(
          chatId,
          '⚠️ Your Telegram account is not linked. Use <code>/link CODE</code> to connect.'
        );
        return Response.json({ ok: true });
      }

      const statusMessage = `
<b>Account Status</b>

<b>Username:</b> ${user.username}
<b>Plan:</b> ${user.subscription_plan}
<b>Daily Searches:</b> ${user.daily_searches_used}/${user.daily_search_limit}
      `;

      await sendTelegramMessage(chatId, statusMessage);
      return Response.json({ ok: true });
    }

    // Handle /search command
    if (text.startsWith('/search ')) {
      const { data: user } = await supabase
        .from('users')
        .select('id, daily_searches_used, daily_search_limit')
        .eq('telegram_id', userId.toString())
        .single();

      if (!user) {
        await sendTelegramMessage(
          chatId,
          '⚠️ Your Telegram account is not linked. Use <code>/link CODE</code> to connect.'
        );
        return Response.json({ ok: true });
      }

      if (user.daily_searches_used >= user.daily_search_limit) {
        await sendTelegramMessage(
          chatId,
          '❌ Daily search limit reached. Upgrade your plan for more searches.'
        );
        return Response.json({ ok: true });
      }

      const searchQuery = text.replace('/search ', '').trim();
      const [searchType, ...queryParts] = searchQuery.split(' ');
      const query = queryParts.join(' ');

      if (!searchType || !query) {
        await sendTelegramMessage(
          chatId,
          '❌ Invalid search format.\n\n<code>/search TYPE QUERY</code>\n<b>Example:</b> <code>/search email user@example.com</code>'
        );
        return Response.json({ ok: true });
      }

      // Perform search (simplified)
      await sendTelegramMessage(
        chatId,
        `🔍 Searching for <code>${query}</code> (type: ${searchType})...\n\nThis may take a moment...`
      );

      // Here you would call your search API
      // For now, just mock it
      setTimeout(async () => {
        await sendTelegramMessage(
          chatId,
          `✅ Search completed!\n\n<b>Query:</b> ${query}\n<b>Type:</b> ${searchType}\n<b>Results:</b> Processing...`
        );
      }, 2000);

      return Response.json({ ok: true });
    }

    // Default message
    await sendTelegramMessage(
      chatId,
      'ℹ️ Use /help to see available commands.'
    );

    return Response.json({ ok: true });
  } catch (error) {
    console.error('[v0] Telegram webhook error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
