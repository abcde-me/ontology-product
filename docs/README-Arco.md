# 基于 arco pro 而来的动态插件

脚手架的来源：基于 arco pro 的简单版本做了一些改动。支持以动态插件方式运行、独立项目运行两种方式。

## 一、 语言包处理——locales

---

### 约定

> 暂无特殊约定，没有历史包袱那就直接拉下脚手架按照 console 原有的方式使用即可。

若有历史包袱，请阅读本文末尾《拓展阅读 - 语言包处理》。

## 二、状态管理

---

### 约定：

> 1. 为了兼容独立项目运行，我们约定，独立项目运行时，store 的数据也只能放在插件相同的 scope 下。
> 2. 对于接口请求：每一个页面开发过程中，需要保持独立：
>
> - 接口请求，每进入页面都要发起
> - mockjs 最好每个页面单独引入

### 1、redux

```
 {
    "type": "console.redux-reducer", // 插件的type类型定义
    "properties": {
      "scope": "consolePluginTemplate", // reducer的scope，推荐以动态插件名字为名
      "reducer": { "$codeRef": "reduxReducer" }
    }
  }
```

在 console 里，作为插件集成的 redux 状态，最终展示的数据在：
![image.png](./1.png)

因此，为了同时兼容，独立应用运行时也约定以下写法

```
// store/createStore.ts
import { createStore, combineReducers } from 'redux';
import rootReducer from './index';
export const StoreName = 'consolePluginTemplate'; // 只需改动这个scope命名即可
// https://github.com/reduxjs/redux-devtools/tree/main/extension#installation
// 此文件仅独立运行用到
export const store = createStore(
  combineReducers({
    plugins: combineReducers({
      [StoreName]: rootReducer,
    }),
  }),
  process.env.NODE_ENV !== 'production' &&
    window.__REDUX_DEVTOOLS_EXTENSION__ &&
    window.__REDUX_DEVTOOLS_EXTENSION__()
);

```

### 2、 context-provider

对应"type": "console.context-provider"来做公共状态的管理。使用方式请自行参考 console 的已有代码。已有用法，此处不作重点说明。
或者自定义。

## 三、样式：组件库

---

### 约定：

> 插件内的 npm 版本需要与 console 保持版本一致。

```
  "@arco-design/web-react": "2.36.1",
  "@arco-themes/react-ocean-design": "0.0.51",
```

## 四、页面路由

---

### 约定：

> 每在 arco pro 里加一个路由，那么需要再 console-extensions.json 里增加对应的入口。

## 五. webpack 配置兼容

---

脚手架内的 webpack 配置由 arco pro 的 cra 工具通过 npm run eject 而来。所有自定义配置均在`config/config.addition.js`文件。
eject 而来的脚本在以下目录：

```
config
scripts
```

#### 约定：

> 后续引入的改动也基于 config/config.addition.js 扩展。其中

```
// custom overrides
class Cfg {
  ...
  // 两种方式都需要的loaders
  commonLoaders = [...];
  // 两种方式都需要的plugins
  commonPlugins = [...];
  // 作为console的plugin需要的特有配置
  overrideConsolePlugin() {...}
   // 作为独立应用需要的特有配置
  overrideApp() {...}
}

```

# 拓展阅读

## 语言包处理

若有历史包袱、可阅读以下描述：

引入 i18n、react-i18next、i18next-browser-languagedetector 等 npm 包，参考脚手架内 i18n.js 的初始化文件

### 1. 通过命令行工具，自动完成语言包提取和初始化代码替换。

如果原本项目已经引入了 arco pro 的 i18n 逻辑和用法，那么可以通过运行

```
yarn run i18n-parse
```

这个工具做了以下几件事：

#### 1. 语言包提取

```
1. 将原项目下**/*/locale/index.ts
        的语言：['en-US'] ['zh-CN']
        提取至=> 根目录/locales/(en|zh)/plugin_{插件名}.json
2. 删除原文件**/*/locale/index.ts
```

#### 2. 引入代码替换

```
将原项目下
import useLocale from '@/utils/useLocale';
import locale from './locale';
// component内
const t = useLocale(locale);


     替换为=>
import { useTranslation } from 'react-i18next';
// component内
const {t} = useTranslation("plugin__console-plugin-template")

直接文本替换处理
兼容const locale = useLocale();
```

#### 3. 删除 src/utils/useLocale.ts

### 2. 手动完成语法修改

#### 1. 对 key 的引用

```
原文件：
    -> t['workplace.column.pv']
    -> locale['']

修改为==>
    -> t(key) 例如：{t("This is a very basic and simple page")}
    -> locale(key)
```

#### 2. 替换所有的'en-US'->'en' 'zh-CN'->'zh'
