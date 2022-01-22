const path = './package.json';
const pj = require(path);
const {toScreen, saveFile, readFile} = require('./utils');
const {version} = pj;
const option = process.argv[2];
const moment = require('moment');

(async () => {
  const parts = version.split('.');
  let newVer;
  let isUpdated = false;
  if (option === 'patch') {
    parts[2] = (Number(parts[2]) + 1).toFixed(0);
    newVer = parts.join('.');
    pj.version = newVer;
    isUpdated = true;
  }
  if (option === 'minor') {
    parts[1] = (Number(parts[1]) + 1).toFixed(0);
    parts[2] = '0';
    newVer = parts.join('.');
    pj.version = newVer;
    isUpdated = true;
  }
  if (isUpdated) {
    await saveFile(path, JSON.stringify(pj, null, 2));
    const rdmPath = './README.md';
    const rdm = await readFile(rdmPath);
    const updated = rdm.replace(version, pj.version);
    await saveFile(rdmPath, updated);
    const changelogPath = './CHANGELOG.md';
    const changelog = await readFile(changelogPath);
    if (!changelog.includes(pj.version)) {
      const date = moment().format('DD-MM-YYYY');
      let newContent = `## [${pj.version}] - ${date}\n\n### Added\n\n- ...\n\n${changelog}`;
      await saveFile(changelogPath, newContent);
    }
    toScreen({mesOrData: `Версия обновлена. ${version} > ${newVer}`, level: 's'});
  } else {
    toScreen({mesOrData: `Версия не обновлена.`});
  }
})();




