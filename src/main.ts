require('dotenv').config();
const {toScreen, handleError, saveDataToFile} = require('../utils');
import cron from 'node-cron';
import axios from 'axios';
import moment from 'moment';
import store from './store';
import ask from './interface';
import {API_URL, getAccessToken, getPortfolios} from './alor';
import WebSocket from 'ws';

import Instrument, {addOrUpdateInstrument, IInstrument, getAllInstruments} from './models/instruments';
import InstrumentType, {addInstrumentType} from './models/instrument_types';
import Setting, {addSetting, getSettingRowByParam, updateSettingVal} from './models/settings';

const toSync = false;

const scheduleDaily9am = '0 9 * * *';

const task = cron.schedule(scheduleDaily9am, async () =>  {
  await getAndHandleInstrumentsFORTS();
  await fillStore();
}, {
  scheduled: false,
  timezone: 'UTC'
});

const aggregateTickers = () => {
  const result: any = {}
  store.symbolsList.forEach((symbol, i) => {
    if (!result[symbol]) {
      result[symbol] = {
        optionsFar: [],
        optionsNear: [],
        futures: [],
        futureDatesList: new Set(),
        optionsDatesList: new Set()
      }
    }
  })
  store.fortsInstrumentsRaw.forEach(item => {
    if (item.base_symbol) {
      if (item.type_code === 1) {
        result[item.base_symbol].futures.push(item);
        const date = moment(item.cancellation).format('DD-MM-YYYY');
        result[item.base_symbol].futureDatesList.add(date);
      }
      if (item.type_code === 3) {
        result[item.base_symbol].optionsFar.push(item);
        const date = moment(item.cancellation).format('DD-MM-YYYY');
        result[item.base_symbol].optionsDatesList.add(date);
      }
      if (item.type_code === 4) {
        result[item.base_symbol].optionsNear.push(item);
        const date = moment(item.cancellation).format('DD-MM-YYYY');
        result[item.base_symbol].optionsDatesList.add(date);
      }
    }
  })
  store.instrumentsDataByTickers = result;
}

const fillStore = async () => {
  store.fortsInstrumentsRaw = await getAllInstruments(true);
  const symbolsSet = new Set();
  store.fortsInstrumentsRaw.forEach(item => {
    if (item.base_symbol) symbolsSet.add(item.base_symbol);
  })
  store.symbolsList = Array.from(symbolsSet) as string[];
  aggregateTickers();
}

const addBaseInstrumentTypes = async () => {
  await Promise.all([
    addInstrumentType(1, 'Фьючерсный контракт'),
    addInstrumentType(2, 'Календарный спред'),
    addInstrumentType(3, 'Опцион'),
    addInstrumentType(4, 'Недельный опцион'),
    addInstrumentType(9, 'Тип не определен')
  ])
}

const addBaseSettings = async () => {
  await Promise.all([
    addSetting('forts_instruments_list_update_date', null, null)
  ])
}

const syncDB = async (): Promise<void> => {
  await Promise.all([
    Instrument.sync({alter: true}),
    InstrumentType.sync({alter: true}),
    Setting.sync({alter: true})
  ]);
  await Promise.all([
    addBaseInstrumentTypes(),
    addBaseSettings()
  ])
}

// returns instruments list
const checkAndUpdateIfNeededInstrumentsFORTS = async () => {
  toScreen({mesOrData: 'Проверка необходимости обновления списка инструментов FORTS...'});
  const fortsUpdateRow = await getSettingRowByParam('forts_instruments_list_update_date');
  if (fortsUpdateRow && fortsUpdateRow.value) {
    const fortsInstrumentsUpdateDate = moment(fortsUpdateRow.value);
    const areDatesTheSame = moment().isSame(fortsInstrumentsUpdateDate, 'day');
    if (!areDatesTheSame) {
      toScreen({mesOrData: 'Список инструментов FORTS НЕ актуальный, запрашивается актуальный список...'});
      await getAndHandleInstrumentsFORTS();
    } else {
      toScreen({mesOrData: 'Список инструментов FORTS актуальный, обновление не требуется'});
    }
  } else {
    await getAndHandleInstrumentsFORTS();
  }
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
      const row: IInstrument = {
        symbol: inst.symbol,
        shortname: inst.shortname,
        type: inst.type,
        type_code: 9,
        base_symbol: null,
        base_asset: null,
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
        const base = row.symbol.split('-')[0];
        row.base_symbol = base;
        row.base_asset = base;
      }
      if (row.type_code === 3 || row.type_code === 4) {
        const parts = row.symbol.split('-');
        const base = parts[0];
        const tail = parts[1];
        const baseAssetDate = tail.split('M')[0];
        row.base_symbol = base;
        row.base_asset = `${base}-${baseAssetDate}`;
      }
      promises.push(addOrUpdateInstrument(row));
    }
    await Promise.all(promises);
    await updateSettingVal('forts_instruments_list_update_date', moment().toISOString());
    return instruments;
  }
  toScreen({mesOrData: 'Ошибка при получении списка инструментов FORTS', level: 'e'});
  return null;
}

const getAndHandlePortfoliosList = async () => {
  const portfolios = await getPortfolios();
  await saveDataToFile({data: portfolios, filename: 'portfolios_list.json'});
}

const run = async () => {
  try {
    if (toSync) await syncDB();
    const accessToken = await getAccessToken();
    if (!accessToken) {
      process.exit(1);
    } else {
      store.accessToken = `Bearer ${accessToken}`;
    }
    await checkAndUpdateIfNeededInstrumentsFORTS();
    await getAndHandlePortfoliosList();
    await fillStore();
    task.start();
    // await ask();
  } catch (e) {
    toScreen({mesOrData: e});
    handleError(e);
  }
}

run();
