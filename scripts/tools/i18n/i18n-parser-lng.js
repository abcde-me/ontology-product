const fs = require('fs');
const path = require('path');
const process = require('child_process');

const langRes = {
  zh: {},
  en: {},
};
const todoDeleteDirArr = [];
/**
 * 找到locale的目录，
 *   -> index.ts
 *      -> 所有的key
 *        -> 追加到locales
 *         -> 删除所有的源文件
 */

//合并写入
function appendNewContentToJSON(dir, lang = 'zh', pkgName, appendJSONObj) {
  // 读取根目录下 源语言文件
  let dirPath = path.resolve(__dirname, dir);
  const dirLocalesFile = path.resolve(
    dirPath,
    `.././locales/${lang}/plugin__${pkgName}.json`,
  );
  const data = fs.readFileSync(dirLocalesFile, 'utf8');
  let obj = JSON.parse(data);
  obj = Object.assign({}, obj, appendJSONObj);
  // 追加、写文件
  fs.writeFileSync(dirLocalesFile, JSON.stringify(obj, null, '\t'));
}

function emitLocalLngsInProject(dir, filename, pkgName) {
  let dirPath = path.resolve(__dirname, dir);
  let files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    let filePath = dirPath + '/' + file; // 当前文件 | 文件夹的路径

    // 满足查询条件文件
    if (file === filename) {
      // 继续深搜文件夹
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        todoDeleteDirArr.push(filePath);
        // 读index.ts源文件
        const data = fs.readFileSync(
          path.resolve(filePath, './index.ts'),
          'utf8',
        );
        const newFileContent = data.replace(
          'export default i18n;',
          'module.exports=i18n;',
        );
        // 修改引入方式后 写入_tmp_index.js文件
        fs.writeFileSync(
          path.resolve(filePath, './_tmp_index.js'),
          newFileContent,
        );
        const res = require(path.resolve(filePath, './_tmp_index.js'));
        const enLng = res['en-US'];
        const zhLng = res['zh-CN'];
        langRes.zh = Object.assign({}, langRes.zh, zhLng);
        langRes.en = Object.assign({}, langRes.en, enLng);
      }
    }
    if (fs.statSync(filePath).isDirectory()) {
      emitLocalLngsInProject(filePath, filename, pkgName);
    }
  });
}

// 获取所有的locale 提取语言包 写入locales
function emitLocaleFiles(options) {
  const defaultOptions = {
    dirName: '../src',
    fileName: 'locale',
  };
  const { dirName, fileName, pkgName } = Object.assign(defaultOptions, options);
  // 提取语言包到langRes对象
  emitLocalLngsInProject(dirName, fileName, pkgName);
  // 提取出的语言包追加到全局最外层文件
  appendNewContentToJSON(defaultOptions.dirName, 'zh', pkgName, langRes.zh);
  appendNewContentToJSON(defaultOptions.dirName, 'en', pkgName, langRes.en);
  // 删除多余文件
  todoDeleteDirArr.forEach((filePath) => {
    process.execSync(`rm -rf ${filePath}`);
  });
  console.log('语言包提取完成>>>');
}
// ## 步骤1：语言包改造
module.exports = emitLocaleFiles;
