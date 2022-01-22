import './src';

/*
import axios from 'axios';
import WebSocket from 'ws';

const API_URL = 'https://api.alor.ru';

const TO_OPEN_WS = false;

(async () => {
  try {
    const res = await axios.post('https://oauth.alor.ru/refresh?token=??');
    const accessToken = res.data.AccessToken;
    const res2 = await axios(`${API_URL}/client/v1.0/users/P071849/portfolios`, {
      headers: {
        Authorization: 'Bearer ' + accessToken
      }
    });
    console.log(res2.data);
    const res3 = await axios(`${API_URL}/md/v2/Securities?sector=FORTS&limit=100000`);
    console.log(res3.data);
    if (TO_OPEN_WS) {
      const connection = new WebSocket('wss://api.alor.ru/ws')
      connection.onopen = () => {
        console.log('open');
        connection.send(JSON.stringify({
          "opcode": "OrderBookGetAndSubscribe",
          "code": "SBER",
          "exchange": "MOEX",
          "depth": 10,
          "format": "Simple",
          "guid": "f35a2373-612c-4518-54af-72025384f59b",
          "token": accessToken
        }))
      }
      connection.onmessage = (e) => {
        console.log(JSON.parse(e.data as string));
      }
    }
  } catch (e) {
    console.log(e);
  }
})()
 */
