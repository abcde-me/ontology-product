import { createStore, combineReducers } from 'redux';
import rootReducer from './index';
export const StoreName = 'consolePluginAibuilder';
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
    window.__REDUX_DEVTOOLS_EXTENSION__(),
);
