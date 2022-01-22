require('dotenv').config();
const chalk = require('chalk');
const {logify} = require('./logger');
const fs = require('fs');
const root = require('app-root-path');
const moment = require('moment');

const DEFAULT_DATA_DIR = `${root}/data/`;
const errMes = 'Ошибка при операции';

// level: 'w' | 'e' | 's'
const toScreen = ({mesOrData, level, prefix, time, raw}) => {
  let timeStr;
  if (time) {
    timeStr = moment().toISOString();
  }
  if (raw || mesOrData instanceof Error) {
    if (time) console.log(timeStr)
    console.log(mesOrData);
    return;
  }
  const warning = chalk.bold.bgYellow.black;
  const error = chalk.bold.bgRed.white;
  const success = chalk.bold.bgGreen.white;
  let mes = ` ${mesOrData} `;
  if (prefix) mes = ` [${prefix}]${mes}`;
  if (level === 'w') mes = `${warning(mes)}`;
  if (level === 'e') mes = `${error(mes)}`;
  if (level === 's') mes = `${success(mes)}`;
  if (time) {
    mes = `${timeStr} | ${mes}`
  }
  console.log(mes);
}

const debug = (any) => {
  if (process.env.DEBUG === '1') {
    console.log('[DEBUG]');
    console.log(any);
  }
}

// level: c - critical
const handleError = (error, level) => {
  console.log('TODO ERR HANDLER!')
  // logify(error, 'error!', 'error');
  // if (level === 'c') process.exit(1);
}

const saveFile = async (path, data, silent = false) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, (e) => {
      if (e) {
        reject(e);
        return;
      }
      if (!silent) toScreen({mesOrData: `Данные сохранены в файл ${path}`});
      resolve();
    });
  })
}

const saveDataToFile = async ({data, filename, postfix, dir, silent}) => {
  try {
    let directory = dir ? dir : DEFAULT_DATA_DIR;
    const str = JSON.stringify(data, null, 2);
    let name = filename;
    if (postfix) {
      let parts = filename.split('.');
      if (parts.length !== 2) throw 'Ошибка в имени файла.';
      const ext = parts[parts.length - 1];
      name = `${parts[0]}_${postfix}.${ext}`;
    }
    if (str) await saveFile(`${directory}${name}`, str, silent);
  } catch (e) {
    toScreen({mesOrData: errMes, level: 'e'});
    debug(e);
  }
}

const readFile = (path) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (e, data) => {
      if (e) {
        reject(e);
        return;
      }
      resolve(data);
    });
  })
}

module.exports = {
  debug,
  toScreen,
  saveFile,
  saveDataToFile,
  handleError,
  readFile
}
