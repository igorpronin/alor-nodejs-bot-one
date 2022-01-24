const {toScreen, handleError, pause} = require('../utils');
import inquirer from 'inquirer';
import store from './store';
// import moment from 'moment';

const handleAction = async (answer: string) => {
  switch (answer) {
    case 'stats':
      await askStats();
      break;
    case 'close':
      toScreen({mesOrData: 'Завершено!'});
      process.exit();
      break;
  }
}

const handleStatsAction = async (answer: string) => {
  switch (answer) {
    case 'tickers':
      handleStatsAllTickers();
      await pause();
      await askStats();
      break;
    case 'one_ticker':
      await handleStatsOneTicker();
      await askStats();
      break;
    case 'back':
      await ask();
      break;
  }
}

const handleStatsAllTickers = () => {
  let counter = 0;
  for (let key in store.instrumentsDataByTickers) {
    counter++;
    const tickerGroup = store.instrumentsDataByTickers[key];
    let mes = '';
    mes += `${counter}. ${key}, `;
    mes += `количество фьючерсов: ${tickerGroup.futures.length}, `;
    mes += `количество дальних опционов: ${tickerGroup.optionsFar.length}, `;
    mes += `количество ближних опционов: ${tickerGroup.optionsNear.length}\n`;
    const extraSpace = counter < 10 ? '' : ' ';
    mes += `    ${extraSpace}даты опционов: ${tickerGroup.optionsDatesList.size}, `;
    mes += `даты фьючерсов: ${tickerGroup.futureDatesList.size}`;
    toScreen({mesOrData: mes});
  }
}

const showTickerOptions = (ticker: string) => {
  const instrument = store.instrumentsDataByTickers[ticker];
  const options = [...instrument.optionsFar, ...instrument.optionsNear];
  options.forEach(one => {
    console.log(one);
  })
}

const showTickerFutures = (ticker: string) => {
  const futures = store.instrumentsDataByTickers[ticker].futures;
  futures.forEach(one => {
    console.log(one);
  })
}

const showTickerOptionsDates = (ticker: string) => {
  const instrument = store.instrumentsDataByTickers[ticker];
  instrument.optionsDatesList.forEach(one => {
    console.log(one);
  })
}

const showTickerFuturesDates = (ticker: string) => {
  const instrument = store.instrumentsDataByTickers[ticker];
  instrument.futureDatesList.forEach(one => {
    console.log(one);
  })
}

const askTicker = async () => {
  const q1 = [
    {
      type: 'input',
      name: 'ticker',
      message: 'Тикер?'
    }
  ]
  let {ticker} = await inquirer.prompt(q1);
  ticker = ticker.toUpperCase();
  if (!(store.symbolsList.includes(ticker) || ticker === '')) {
    toScreen({mesOrData: `Тикера ${ticker} нет в списке доступных для операций. Укажите другой.`, level: 'w'});
    ticker = await askTicker();
  }
  return ticker;
}

const askTickerAction = async () => {
  const actions = {
    type: 'list',
    name: 'action',
    message: 'Информация по тикеру',
    choices: [
      {
        name: 'Список опционов по тикеру',
        value: 'ticker_options'
      },
      {
        name: 'Список фьючерсов по тикеру',
        value: 'ticker_futures'
      },
      {
        name: 'Список дат по опционам',
        value: 'options_dates'
      },
      {
        name: 'Список дат по фьючерсам',
        value: 'futures_dates'
      }
    ],
  }
  const questions = [actions];
  const {action} = await inquirer.prompt(questions);
  return action;
}

export const handleStatsOneTicker = async () => {
  toScreen({mesOrData: 'Введите тикер или пустое значение для возврата в предыдущее меню...', level: 'w'});
  const ticker = await askTicker();
  if (ticker === '') return;
  const action = await askTickerAction();
  switch (action) {
    case 'ticker_options':
      showTickerOptions(ticker);
      break;
    case 'ticker_futures':
      showTickerFutures(ticker);
      break;
    case 'options_dates':
      showTickerOptionsDates(ticker);
      break;
    case 'futures_dates':
      showTickerFuturesDates(ticker);
      break;
  }
}

export const ask = async () => {
  const actions = {
    type: 'list',
    name: 'action',
    message: 'Что сделать?',
    choices: [
      {
        name: 'Статистика и данные',
        value: 'stats'
      },
      {
        name: 'Запустить скрипт',
        value: 'run_main'
      },
      {
        name: 'Завершить',
        value: 'close'
      }
    ],
  }
  const questions = [actions];
  try {
    const answers = await inquirer.prompt(questions);
    await handleAction(answers.action);
  } catch (e: any) {
    handleError(e);
    if (e.isTtyError) {
      toScreen({
        mesOrData: 'Скрипт не может быть запущен в этой среде (на этом компьютере).',
        level: 'e'
      });
    }
  }
}

export const askStats = async () => {
  const actions = {
    type: 'list',
    name: 'action',
    message: 'Статистика и данные, что сделать?',
    choices: [
      {
        name: 'Все тикеры',
        value: 'tickers'
      },
      {
        name: 'Подробно по тикеру',
        value: 'one_ticker'
      },
      {
        name: 'Назад',
        value: 'back'
      }
    ],
  }
  const questions = [actions];
  try {
    const answers = await inquirer.prompt(questions);
    await handleStatsAction(answers.action);
  } catch (e: any) {
    handleError(e);
  }
}

export default ask;
