const {toScreen, handleError, saveDataToFile} = require('../utils');
require('dotenv').config();
import axios from 'axios';
import store from './store';

const OAUTH_URL = 'https://oauth.alor.ru';
export const API_URL = 'https://api.alor.ru';
const API_WS_URL = 'wss://api.alor.ru/ws';


export const getAccessToken = async (): Promise<string | null> => {
  toScreen({mesOrData: 'Запрашивается Access Token...'});
  const accessToken = (await axios.post(`${OAUTH_URL}/refresh?token=${process.env.ALOR_REFRESH_TOKEN}`)).data.AccessToken;
  if (accessToken) {
    toScreen({mesOrData: 'Access Token получен'});
    return accessToken;
  }
  toScreen({mesOrData: 'Ошибка при получении Access Token', level: 'e'});
  return null;
}

export const getPortfolios = async () => {
  if (!store.accessToken) return;
  toScreen({mesOrData: 'Получение списка портфелей...'});
  const {data} = await axios(`${API_URL}/client/v1.0/users/${process.env.ALOR_USERNAME}/portfolios`, {
    headers: {
      Authorization: store.accessToken
    }
  });
  toScreen({mesOrData: 'Список портфелей получен'});
  return data;
}
