import UAPI_CONFIG from './uapi';
import { logout, isSingleApp } from '@/utils/env';
import { Message, Notification } from '@arco-design/web-react';

const isNil = (o) => o === undefined || o === null;

// UAPI默认配置(配置项和Axios配置项兼容)（示例）
UAPI_CONFIG.setDefaultConfig({
  withCredentials: true,
  baseURL: `/`,
  timeout: 30000 // request timeout
});

/**
 * UAPI请求拦截器（示例）
 */
UAPI_CONFIG.addRequestInterceptor(
  (config) => {
    const consolePluginToken = localStorage.getItem('console_token');
    // config.headers['Access-Control-Allow-Origin'] = '*';
    //配置自定义请求头
    if (config.headers && !config.headers?.['x-auth-validate'])
      config.headers['x-auth-validate'] = JSON.stringify(true);
    if (consolePluginToken && config.headers)
      config.headers['authorization'] = `Bearer ${consolePluginToken}`;
    config.headers && (config.headers['Content-Type'] = 'application/json');
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

/**
 * UAPI响应拦截器（示例）
 */
UAPI_CONFIG.addResponseInterceptor(
  (response) => {
    const res = response.data;

    if (response.status == 401) {
      logout(res.data.content);
    } else if (response.status >= 200 && response.status <= 299) {
      // 兼容没有code和message的接口
      if (
        ((isNil(res.code) || isNaN(res.code)) &&
          isNil(res.status) &&
          isNil(res.message)) ||
        !(response.config as any).preCheck
      ) {
        //这里判断下是否是json格式，如果不是先按错误论处，需要等后端规范化他们的接口
        try {
          if (res && typeof res === 'string') {
            if (
              response.headers['content-type'] &&
              response.headers['content-type'].includes('application/pdf')
            ) {
              const blob = new Blob([res], {
                type: 'application/pdf'
              });
              return blob;
            } else {
              return JSON.parse(res);
            }
          }
        } catch (err) {
          throw err;
        }
        return res;
      }
      const successCode = [
        'Success',
        0,
        'SUCCESS',
        'success',
        200,
        'AIAP.DraftWorkflowNotFound',
        'AIMDP.WorkflowDraftNotFound'
      ];
      if (
        successCode.includes(res.code) ||
        successCode.includes(res.status) ||
        successCode.includes(res.message)
      ) {
        if (res.data === undefined) {
          return res;
        }
        return res;
      } else {
        const errorMsg = res.message;
        if (errorMsg) {
          Message.error(errorMsg);
          console.error(errorMsg);
        }
        // return Promise.reject(errorMsg);
        return res;
      }
    }
  },
  (error) => {
    console.log('error: ', error);
    let code = 0;
    try {
      code = error.response.data.status
        ? error.response.data.status
        : error.response.status;
    } catch (e) {
      if (error.toString().indexOf('Error: timeout') !== -1) {
        Notification.error({
          title: '网络请求超时',
          content: '',
          duration: 5000
        });
        return Promise.reject(error);
      }
    }
    console.log('code: ', code);
    if (code === 404 && isSingleApp) {
      return Promise.reject(error);
    }
    if (code) {
      if (code === 401 || code === 402) {
        logout(error.response.data?.data?.content);
      } else if (code === 403) {
        // 临时在这里全局加一下，实际需要按业务捕获
        Message.error(
          error?.response?.data?.message ?? '只读管理员无权限操作此内容！'
        );
      } else {
        console.log('code 500: ', code);
        const errorMsg = error.response.data.message || error.message;
        errorMsg && Message.error(errorMsg) && console.error(errorMsg);
        return Promise.resolve(error);
        // return Promise.reject(error);
      }
    } else if (!(code === 0 && error?.message === 'canceled')) {
      Message.error({
        content: '接口请求失败',
        duration: 5000
      });
    }
    return Promise.resolve(error);
    // return Promise.reject(error);
  }
);

// 获得UAPI实例（必须）
const UAPI = UAPI_CONFIG.createInstance();

export default UAPI;
