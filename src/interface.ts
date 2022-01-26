const {toScreen, handleError, pause} = require('../utils');
import inquirer from 'inquirer';
import store from './store';
import {hasOptions} from './configure';
// import moment from 'moment';

const handleAction = async (answer: string) => {
  switch (answer) {
    case 'stats':
      await askStats();
      break;
    case 'configure':
      await askConfigure();
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

const handleConfigureAction = async (answer: string) => {
  switch (answer) {
    case 'trade_option':
      await handleConfigureOptionTrading();
      await askConfigure();
      break;
    case 'back':
      await ask();
      break;
  }
}

const handleConfigureOptionTrading = async () => {
  toScreen({mesOrData: 'Введите тикер или пустое значение для возврата в предыдущее меню...', level: 'w'});
  const ticker = await askTicker();
  if (ticker === '') return;
  if (!hasOptions(ticker)) {
    toScreen({mesOrData: `Для тикера ${ticker} нет доступных опционов, выберите другой тикер...`, level: 'w'});
    await handleConfigureOptionTrading();
    return;
  }
  const strategyAnswer = await askOptionStrategy();
  if (strategyAnswer === 'to_start') {
    await handleConfigureOptionTrading();
    return;
  }
  const directionAnswer = await askDirection();
  if (directionAnswer === 'to_start') {
    await handleConfigureOptionTrading();
    return;
  }
  if (directionAnswer === 'sell') {
    toScreen({mesOrData: 'Внимание! Непокрытые продажи не предусмотрены алгоритмом робота. Проверьте наличие открытых длинных позиций по выбранному опциону.', level: 'w'});
  }
  const cancellationDate = await askOptionsDate(ticker);
  if (directionAnswer === 'to_start') {
    await handleConfigureOptionTrading();
    return;
  }
  const strike = await askOptionsStrike(ticker, cancellationDate);
  if (strike === 'to_start') {
    await handleConfigureOptionTrading();
    return;
  }
  console.log(strike);
  const instrument = store.instrumentsDataByTickers[ticker].optionsByCancellationDate[cancellationDate].byStrikes[strike]
  console.log(instrument);
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

const handleStatsOneTicker = async () => {
  toScreen({mesOrData: 'Введите тикер для продолжения или пустое значение для возврата в предыдущее меню...', level: 'w'});
  const ticker = await askTicker();
  if (ticker === '') return;
  const action = await askTickerAction(ticker);
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

const askOptionStrategy = async () => {
  const actions = {
    type: 'list',
    name: 'answer',
    message: 'Какую стратегию использовать? (Подробнее о стратегиях в README.md)',
    choices: [
      {
        name: 'Покупка/продажа ордером с равномерным периодическим изменением цены',
        value: 'option_fisherman'
      },
      {
        name: 'В начало',
        value: 'to_start'
      }
    ],
  }
  const questions = [actions];
  const {answer} = await inquirer.prompt(questions);
  return answer;
}

const askOptionsDate = async (ticker: string) => {
  const choices: any = [];
  const actions = {
    type: 'list',
    name: 'answer',
    message: 'Дата погашения опциона?',
    choices
  }
  const tickerInstruments = store.instrumentsDataByTickers[ticker];
  tickerInstruments.optionsDatesList.forEach(one => choices.push(one));
  choices.push({
    name: 'В начало',
    value: 'to_start'
  });
  const questions = [actions];
  const {answer} = await inquirer.prompt(questions);
  return answer;
}

const askOptionsStrike = async (ticker: string, date: string) => {
  const choices: any = [];
  const actions = {
    type: 'list',
    name: 'answer',
    message: 'Страйк опциона?',
    choices
  }
  const tickerInstruments = store.instrumentsDataByTickers[ticker].optionsByCancellationDate[date];
  const strikes = tickerInstruments.strikesList;
  strikes.sort(function(a, b) {
    return a - b;
  });
  strikes.forEach(one => choices.push(one));
  choices.push({
    name: 'В начало',
    value: 'to_start'
  });
  const questions = [actions];
  const {answer} = await inquirer.prompt(questions);
  return answer;
}

const askDirection = async () => {
  const actions = {
    type: 'list',
    name: 'answer',
    message: 'Какое направление сделки',
    choices: [
      {
        name: 'Покупка',
        value: 'buy'
      },
      {
        name: 'Продажа',
        value: 'sell'
      },
      {
        name: 'В начало',
        value: 'to_start'
      }
    ],
  }
  const questions = [actions];
  const {answer} = await inquirer.prompt(questions);
  return answer;
}

const askTickerAction = async (ticker: string) => {
  const actions = {
    type: 'list',
    name: 'action',
    message: `Какую информацию по тикеру ${ticker} показать?`,
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

export const ask = async () => {
  const actions = {
    type: 'list',
    name: 'action',
    message: 'Что сделать?',
    choices: [
      {
        name: 'Показать статистику и данные',
        value: 'stats'
      },
      {
        name: 'Настроить торговые операции',
        value: 'configure'
      },
      {
        name: 'Запустить скрипт',
        value: 'run'
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

export const askConfigure = async () => {
  const actions = {
    type: 'list',
    name: 'action',
    message: 'Настройка торговых операций, что сделать?',
    choices: [
      {
        name: 'Добавить сделку с опционом',
        value: 'trade_option'
      },
      {
        name: 'Назад',
        value: 'back'
      }
    ]
  }
  const questions = [actions];
  try {
    const answers = await inquirer.prompt(questions);
    await handleConfigureAction(answers.action);
  } catch (e: any) {
    handleError(e);
  }
}

export default ask;
