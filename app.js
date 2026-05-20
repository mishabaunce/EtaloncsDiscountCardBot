const tg = window.Telegram.WebApp;

tg.expand();

const user = tg.initDataUnsafe.user;

document.getElementById("name").innerText =
  user?.first_name || "Клиент";

QRCode.toCanvas(
  document.getElementById('qrcode'),
  `client_${user?.id}`,
  function (error) {
    if (error) console.error(error);
  }
);