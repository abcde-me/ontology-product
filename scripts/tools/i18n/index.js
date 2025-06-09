/**
 * @desc 用于对arco pro 初始化出来的项目的语言包转化
 */
const lngDeal = require('./i18n-parser-lng');

const importDeal = require('./i18n-parser-import');
const pkgName = require('../../../package.json');
if (!pkgName.consolePlugin.name) {
  throw new Error('package.json请输入插件名称!');
  return;
}
lngDeal({
  dirName: '../../../src',
  pkgName: pkgName.consolePlugin.name,
});

importDeal({
  dirName: '../../../src',
  pkgName: pkgName.consolePlugin.name,
});
