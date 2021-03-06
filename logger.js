const winston = require('winston');
// const store = require('./store');
// const moment = require('moment');
const root = require('app-root-path');
require('winston-daily-rotate-file');

const transportCombined = new winston.transports.DailyRotateFile({
  filename: `${root}/logs/combined-%DATE%.log`,
  datePattern: 'YYYY-MM-DD-HH',
  maxSize: '10m',
  maxFiles: '14d'
});

const transportError = new winston.transports.File({filename: `${root}/logs/error.log`, level: 'error'});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [transportError, transportCombined],
});

const logify = (data, metaMessage, level = 'info') => {
  // let message;
  // if (data && data instanceof Error) {
  //   message = data.stack;
  // } else if (data) {
  //   const {figi} = data;
  //   if (figi) {
  //     const asset = store.activeStocksByFigi[figi];
  //     if (asset) data.ticker = asset.meta.ticker;
  //   }
  //   message = JSON.stringify(data);
  // }
  // const meta = JSON.stringify({
  //   i: metaMessage,
  //   date: moment().toISOString()
  // })
  // logger.log({level, message, meta});
}

module.exports = {logify}
