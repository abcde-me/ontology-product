const fs = require('fs');
const path = require('path');
const process = require('child_process');

function modifyImport(dir, filename, pkgName) {
  let dirPath = path.resolve(__dirname, dir);
  let files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    let filePath = dirPath + '/' + file;
    const stats = fs.statSync(filePath);
    if (stats.isFile()) {
      // ts文件内容替换
      if (file.includes('.ts') || file.includes('.js')) {
        const data = fs.readFileSync(path.resolve(filePath), 'utf8');
        let newFileContent = data.replace(
          "import useLocale from '@/utils/useLocale';",
          "import { useTranslation } from 'react-i18next';",
        );
        newFileContent = data.replace(
          "import useLocale from '../../utils/useLocale';",
          "import { useTranslation } from 'react-i18next';",
        );
        newFileContent = data.replace(
          "import useLocale from './utils/useLocale';",
          "import { useTranslation } from 'react-i18next';",
        );

        newFileContent = newFileContent.replace(
          "import locale from './locale';",
          '',
        );

        newFileContent = newFileContent.replace(
          'const t = useLocale(locale);',
          `const {t} = useTranslation('plugin__${pkgName}')`,
        );
        newFileContent = newFileContent.replace(
          'const t = useLocale();',
          `const {t} = useTranslation('plugin__${pkgName}')`,
        );
        newFileContent = newFileContent.replace(
          'const locale = useLocale();',
          `const {t: locale} = useTranslation('plugin__${pkgName}')`,
        );
        fs.writeFileSync(path.resolve(filePath), newFileContent);
      }
    } else if (fs.statSync(filePath).isDirectory()) {
      modifyImport(filePath, filename, pkgName);
    }
  });
}

function emitI18nImport(options) {
  const defaultOptions = {
    dirName: '../src',
    fileName: '',
  };
  const { dirName, fileName, pkgName } = Object.assign(defaultOptions, options);
  modifyImport(dirName, fileName, pkgName);
  // 删除useLocal
  process.execSync(
    `rm -rf ${path.resolve(__dirname, '../src/utils/useLocale.ts')}`,
  );
  console.log('import导入完成>>>');
  console.log('请手动对照diff处理t[]和locale[]为t()、locale()');
}
// ## 步骤2： t变量的引入import改造
module.exports = emitI18nImport;
