const fs = require('fs');

const env = fs.readFileSync('.env', 'utf-8');
const BOT_TOKEN = env.split('\n').find((line) => line.startsWith('BOT_TOKEN='))?.split('=')[1];

if (!BOT_TOKEN) {
    console.error('BOT_TOKEN не найден в .env');
    process.exit(1);
}

const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;
let offset = 0;

async function main() {
    console.log('Бот запущен. Напишите ему сообщение в Telegram — оно появится здесь.');

    while (true) {
        const res = await fetch(`${API_URL}/getUpdates?timeout=25&offset=${offset}`);
        const data = await res.json();

        for (const update of data.result ?? []) {
            offset = update.update_id + 1;

            const text = update.message?.text;
            if (text) {
                console.log(`Вы написали: ${text}`);
            }
        }
    }
}

main();
