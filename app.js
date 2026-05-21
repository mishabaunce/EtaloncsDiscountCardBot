import { Telegraf } from "telegraf";
import fetch from "node-fetch";
import crypto from "crypto";

// 🔑 мои ДАННЫЕ
const BOT_TOKEN = "8676933243:AAGt94ax1l_hnsC5eO5KmTHEd7jxPkSJ2E8";
const SUPABASE_URL = "https://fgzsqkeyehopplhazyet.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnenNxa2V5ZWhvcHBsaGF6eWV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNzA2MjksImV4cCI6MjA5NDg0NjYyOX0.LKXyNzw50KQNcYxgfVCKbfPrDoZu3KAS1reGpDEOPVU";

const bot = new Telegraf(BOT_TOKEN);

// helper для Supabase REST
async function sb(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
  });

  return res.json();
}

// 🚀 START
bot.start(async (ctx) => {
  const user = ctx.from;
  const payload = ctx.startPayload;

  let client = null;

  // 1. если пришли по ссылке / QR
  if (payload) {
    const data = await sb(`clients?card_code=eq.${payload}`);
    client = data?.[0];
  }

  // 2. иначе ищем по telegram_id
  if (!client) {
    const data = await sb(`clients?telegram_id=eq.${user.id}`);
    client = data?.[0];
  }

  // 3. если клиента нет — создаём
  if (!client) {
    const newClient = {
      telegram_id: user.id,
      name: user.first_name || "Клиент",
      discount: 10,
      tier: "GOLD",
      purchases: 0,
      card_code: crypto.randomUUID().slice(0, 8),
    };

    const created = await sb("clients", {
      method: "POST",
      body: JSON.stringify(newClient),
    });

    client = created?.[0] || newClient;
  }

  // 📲 WebApp кнопка
  ctx.reply("Ваша скидочная карта готова 👇", {
    reply_markup: {
      keyboard: [
        [
          {
            text: "📇 Открыть карту",
            web_app: {
              url: "https://etaloncs-discount-card-bot.vercel.app/",
            },
          },
        ],
      ],
      resize_keyboard: true,
    },
  });
});

// ▶️ запуск
bot.launch();

console.log("Bot started...");
