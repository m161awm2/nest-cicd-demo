const serverTimeElement = document.querySelector('#server-time');
const timezoneElement = document.querySelector('#server-timezone');

async function loadServerTime() {
  try {
    const response = await fetch('/api/time');

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    serverTimeElement.textContent = data.serverTime;
    timezoneElement.textContent = `Timezone: ${data.timezone}`;
  } catch (error) {
    serverTimeElement.textContent = '서버 시간을 불러오지 못했습니다.';
    timezoneElement.textContent = 'NestJS 서버와 /api/time API를 확인하세요.';
    console.error(error);
  }
}

loadServerTime();
setInterval(loadServerTime, 5000);
