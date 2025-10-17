import UAPI_CONFIG from './uapi';
import { logout, isSingleApp } from '@/utils/env';
import { Message, Notification } from '@arco-design/web-react';
import { getCurrentProjectId } from '@/context/ProjectContext';

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
  (config: any) => {
    const consolePluginToken = localStorage.getItem('console_token');
    //配置自定义请求头
    if (!config.headers['x-auth-validate'])
      config.headers['x-auth-validate'] = JSON.stringify(true);
    if (consolePluginToken)
      config.headers['authorization'] = `Bearer ${consolePluginToken}`;
    config.headers['Content-Type'] = 'application/json';

    // todo 临时调试
    // if (process.env.NODE_ENV === 'development') {
    // config.headers['x-ceai-user-id'] = 'user-gqj121nu';
    // config.headers['x-ceai-user-organization-id'] = 'org-1urn9m93';
    // }
    // 自动为所有请求加上项目id参数
    const projectId = getCurrentProjectId();

    // 跳过项目相关的API请求（避免循环依赖）
    const skipUrls = ['/api/project/org', '/api/auth/', '/login', '/logout'];
    const shouldSkip = skipUrls.some((url) => config.url?.includes(url));

    if (!shouldSkip && projectId && projectId.length > 0) {
      console.log(
        'API拦截器为请求添加项目ID:',
        projectId[projectId.length - 1],
        'URL:',
        config.url
      );
      if (config.data && typeof config.data === 'object') {
        config.data = {
          ...config.data,
          projectID: projectId[projectId.length - 1]
        };
      } else if (config.method?.toLowerCase() === 'get' && config.params) {
        // 对于GET请求，将项目ID添加到params中
        config.params = {
          ...config.params,
          projectID: projectId[projectId.length - 1]
        };
      }
    } else {
      console.log(
        '跳过添加项目ID参数 - URL:',
        config.url,
        'projectId:',
        projectId
      );
    }
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
    if (response.status == 401 || res?.status == 401) {
      console.error('API返回401错误:', response.config?.url, res);
      logout(res?.data?.content);
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
        'AIAP.DraftWorkflowNotFound'
      ];
      if (
        successCode.includes(res.code) ||
        successCode.includes(res.status) ||
        successCode.includes(res.statusCode) ||
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
        return Promise.reject(errorMsg);
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
        console.error(
          'API错误401/402:',
          error.response?.config?.url,
          error.response?.data
        );
        // 临时注释，用于调试
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
        return Promise.reject(error);
      }
    } else if (!(code === 0 && error?.message === 'canceled')) {
      Message.error({
        content: '接口请求失败',
        duration: 5000
      });
    }
    return Promise.reject(error);
  }
);

// 获得UAPI实例（必须）
const UAPI = UAPI_CONFIG.createInstance();

export default UAPI;
