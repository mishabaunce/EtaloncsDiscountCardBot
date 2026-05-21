const tg = window.Telegram.WebApp;

tg.expand();

// Telegram user
const user = tg.initDataUnsafe.user;

// SUPABASE
const SUPABASE_URL = "https://fgzsqkeyehopplhazyet.supabase.co";

const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnenNxa2V5ZWhvcHBsaGF6eWV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNzA2MjksImV4cCI6MjA5NDg0NjYyOX0.LKXyNzw50KQNcYxgfVCKbfPrDoZu3KAS1reGpDEOPVU";

// загрузка клиента
async function loadClient() {

  try {

    // ищем клиента в базе
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/clients?telegram_id=eq.${user.id}`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    const data = await response.json();

    let client;

    // если клиента нет — создаём
    if (data.length === 0) {

      const newClient = {
        telegram_id: user.id,
        name: user.first_name,
        purchases: 0,
        discount: 0
      };

      await fetch(
        `${SUPABASE_URL}/rest/v1/clients`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`
          },
          body: JSON.stringify(newClient)
        }
      );

      client = newClient;

    } else {

      client = data[0];

    }

    // имя клиента
    document.getElementById("name").innerText =
      client.name;

    // скидка
    document.querySelector(".discount").innerText =
      `Скидка ${client.discount}%`;

    // QR код
    QRCode.toCanvas(
      document.getElementById("qrcode"),
      `client_${user.id}`,
      function (error) {
        if (error) console.error(error);
      }
    );

  } catch (error) {

    console.error("Ошибка:", error);

  }

}

loadClient();