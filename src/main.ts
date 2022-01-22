require('dotenv').config();
const {toScreen, debug, handleError, saveDataToFile} = require('../utils');
import axios from 'axios';
import WebSocket from 'ws';

import Instrument from './models/instruments';
import InstrumentType, {addInstrumentType} from './models/instrument_types';

const OAUTH_URL = 'https://oauth.alor.ru';
const API_URL = 'https://api.alor.ru';
const API_WS_URL = 'wss://api.alor.ru/ws';

const addInstrumentTypes = async () => {
  await Promise.all([
    addInstrumentType(1, 'Фьючерсный контракт'),
    addInstrumentType(2, 'Календарный спред'),
    addInstrumentType(3, 'Опцион'),
    addInstrumentType(4, 'Недельный опцион'),
    addInstrumentType(9, 'Тип не определен')
  ])
}

const syncDB = async (): Promise<void> => {
  await Promise.all([
    Instrument.sync({alter: true}),
    InstrumentType.sync({alter: true})
  ]);
  await Promise.all([
    addInstrumentTypes()
  ])
}

const getAccessToken = async (): Promise<string | null> => {
  toScreen({mesOrData: 'Запрашивается Access Token...'});
  const accessToken = (await axios.post(`${OAUTH_URL}/refresh?token=${process.env.ALOR_REFRESH_TOKEN}`)).data.AccessToken;
  if (accessToken) {
    toScreen({mesOrData: 'Access Token получен'});
    return accessToken;
  }
  toScreen({mesOrData: 'Ошибка при получении Access Token', level: 'e'});
  return null;
}

const getAndHandleInstrumentsFORTS = async () => {
  toScreen({mesOrData: 'Запрашивается список инструментов FORTS...'});
  const instruments = (await axios(`${API_URL}/md/v2/Securities?sector=FORTS&limit=1000000`)).data;
  if (instruments) {
    toScreen({mesOrData: `Список инструментов FORTS получен (${instruments.length} инструментов)`});
    await saveDataToFile({data: instruments, filename: 'instruments_forts.json'});
    const promises = []
    for (let i = 0; i < instruments.length; i++) {
      const inst = instruments[i];
      const row = {
        symbol: inst.symbol,
        shortname: inst.shortname,
        type: inst.type,
        type_code: 9,
        lotsize: inst.lotsize,
        facevalue: inst.facevalue,
        cfi_code: inst.cfiCode,
        cancellation: inst.cancellation,
        minstep: inst.minstep,
        rating: inst.rating,
        marginbuy: inst.marginbuy,
        marginsell: inst.marginsell,
        marginrate: inst.marginrate,
        pricestep: inst.pricestep,
        price_max: inst.priceMax,
        price_min: inst.priceMin,
        theor_price: inst.theorPrice,
        theor_price_limit: inst.theorPriceLimit,
        volatility: inst.volatility,
        currency: inst.currency,
        isin: inst.ISIN,
        yield: inst.yield,
        primary_board: inst.primary_board,
        trading_status: inst.tradingStatus,
        trading_status_info: inst.tradingStatusInfo,
        complex_product_category: inst.complexProductCategory
      }
      if (inst.type.includes('Нед. марж.')) {
        row.type_code = 4;
      } else if (inst.type.includes('Марж. амер.')) {
        row.type_code = 3;
      } else if (inst.type.includes('Календарный')) {
        row.type_code = 2;
      } else if (inst.type.includes('Фьючерсный')) {
        row.type_code = 1;
      }
      promises.push(Instrument.create(row));
    }
    await Promise.all(promises);
    return instruments;
  }
  toScreen({mesOrData: 'Ошибка при получении списка инструментов FORTS', level: 'e'});
  return null;
}

const run = async () => {
  try {
    await syncDB();
    const accessToken = await getAccessToken();
    if (!accessToken) process.exit(1);
    const instrumentsFORTS = await getAndHandleInstrumentsFORTS();
  } catch (e) {
    toScreen({mesOrData: e});
    handleError(e);
  }
}

run();
