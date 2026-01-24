/**
 * OSINT Platform Telegram Bot Setup Script
 * 
 * This script sets up the Telegram bot webhook and initializes the bot.
 * 
 * Usage:
 * node scripts/telegram-bot-setup.js <BOT_TOKEN> <WEBHOOK_URL>
 * 
 * Example:
 * node scripts/telegram-bot-setup.js "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11" "https://yourdomain.com/api/telegram/webhook"
 */

const https = require('https');

const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Usage: node telegram-bot-setup.js <BOT_TOKEN> <WEBHOOK_URL>');
  console.error('Example: node telegram-bot-setup.js "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11" "https://yourdomain.com/api/telegram/webhook"');
  process.exit(1);
}

const BOT_TOKEN = args[0];
const WEBHOOK_URL = args[1];

console.log('🤖 OSINT Platform Telegram Bot Setup\n');
console.log(`Bot Token: ${BOT_TOKEN.substring(0, 10)}...`);
console.log(`Webhook URL: ${WEBHOOK_URL}\n`);

// Function to make Telegram API request
function telegramRequest(method, params) {
  return new Promise((resolve, reject) => {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/${method}`;
    const postData = JSON.stringify(params);

    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${BOT_TOKEN}/${method}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function setupBot() {
  try {
    // Set webhook
    console.log('📡 Setting webhook...');
    const webhookResponse = await telegramRequest('setWebhook', {
      url: WEBHOOK_URL,
      allowed_updates: ['message', 'callback_query'],
    });

    if (!webhookResponse.ok) {
      throw new Error(`Failed to set webhook: ${webhookResponse.description}`);
    }

    console.log('✅ Webhook set successfully!\n');

    // Get bot info
    console.log('ℹ️  Getting bot information...');
    const infoResponse = await telegramRequest('getMe', {});

    if (!infoResponse.ok) {
      throw new Error('Failed to get bot info');
    }

    const bot = infoResponse.result;
    console.log(`Bot Username: @${bot.username}`);
    console.log(`Bot ID: ${bot.id}`);
    console.log(`Bot Name: ${bot.first_name}\n`);

    // Set commands
    console.log('⚙️  Setting bot commands...');
    const commandsResponse = await telegramRequest('setMyCommands', {
      commands: [
        { command: 'start', description: 'Start the bot' },
        { command: 'link', description: 'Link your OSINT account' },
        { command: 'search', description: 'Perform a search' },
        { command: 'status', description: 'Check account status' },
        { command: 'help', description: 'Show help' },
      ],
    });

    if (!commandsResponse.ok) {
      throw new Error('Failed to set commands');
    }

    console.log('✅ Bot commands configured!\n');

    // Summary
    console.log('═'.repeat(50));
    console.log('✅ Telegram Bot Setup Complete!\n');
    console.log('📝 Next steps:');
    console.log(`1. Share this link with users: t.me/${bot.username}`);
    console.log('2. Users can now link their accounts using: /link CODE');
    console.log('3. Ensure your webhook server is running');
    console.log('4. Set environment variable: TELEGRAM_BOT_TOKEN=' + BOT_TOKEN);
    console.log('\n🔗 Webhook URL: ' + WEBHOOK_URL);
    console.log('═'.repeat(50));
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupBot();
