import UAPI_CONFIG from './uapi';
import { logout, isSingleApp, getLoginToken } from '@/utils/env';
import { Message, Notification } from '@arco-design/web-react';
import { useUserInfoStore } from '@/store/userInfoStore';
import {
  isDevBypassEnabled,
  isDevFallbackProjectId,
  isOntologyManagerApiUrl,
  DEV_CEAI_USER_ID
} from '@/utils/devFallback';

const isNil = (o) => o === undefined || o === null;

// 二进制内容类型列表
const BinaryContentTypes = [
  'application/octet-stream',
  'application/pdf',
  'image/',
  'video/',
  'audio/',
  'application/zip',
  'application/x-zip-compressed'
];

const excludeUrl = [
  '/ceai/user-space/api/v1/GetUser',
  '/ceai/user-space/api/v1/GetProjOrg',
  '/ceai/user-space/api/v1/Login',
  '/ceai/user-space/api/v1/GetLoginCaptcha',
  '/ceai/user-space/api/v1/GetScanLoginQrCode',
  '/ceai/user-space/api/v1/CheckScanLoginStatus',
  '/ceai/user-space/api/v1/GetUserInfo',
  '/ceai/user-space/api/v1/Logout',
  '/ceai/aimdp-manager/api/v1/UploadOntologyActionDataFile'
];

const silentDevErrorUrls = [
  '/ceai/auth-center/api/v1/GetResourcePermissionActions',
  '/ceai/user-space/api/v1/GetProjOrg',
  '/ceai/user-space/api/v1/GetUser',
  '/ceai/ontology-manager/api/v1/CreateOntologyModel',
  '/ceai/ontology-manager/api/v1/DeleteOntologyModel',
  '/ceai/ontology-manager/api/v1/ListOntologyModel',
  '/ceai/ontology-manager/api/v1/GetOntologyModelDetail',
  '/ceai/ontology-manager/api/v1/ListOntologyObjectType',
  '/ceai/ontology-manager/api/v1/CreateOntologyObjectType',
  '/ceai/ontology-manager/api/v1/BindOntologyObjectType',
  '/ceai/ontology-manager/api/v1/UpdateOntologyObjectType',
  '/ceai/ontology-manager/api/v1/DeleteOntologyObjectType',
  '/ceai/ontology-manager/api/v1/GetOntologyObjectType',
  '/ceai/ontology-manager/api/v1/GetRuntimeOntologyObjectTypeMetadata',
  '/ceai/ontology-manager/api/v1/RegisterOntologyObjectTypeMetadata',
  '/ceai/ontology-manager/api/v1/ListTiDBTypes',
  '/ceai/ontology-manager/api/v1/GetTemplateFile',
  '/ceai/ontology-manager/api/v1/UploadOntologyEntityDataFile',
  '/ceai/ontology-manager/api/v1/GetOntologyTopology',
  '/ceai/ontology-manager/api/v1/ListOntologyPhysicalProperties',
  '/ceai/ontology-manager/api/v1/ListOntologyObjectTypeData',
  '/ceai/ontology-manager/api/v1/VectorSearchOntologyObjectTypeData',
  '/ceai/ontology-manager/api/v1/SemanticSearchOntologyObjectTypeData',
  '/ceai/ontology-manager/api/v1/ListOntologyLinkType',
  '/ceai/ontology-manager/api/v1/GetOntologyLinkType',
  '/ceai/ontology-manager/api/v1/CreateOntologyLinkType',
  '/ceai/ontology-manager/api/v1/UpdateOntologyLinkType',
  '/ceai/ontology-manager/api/v1/DeleteOntologyLinkType',
  '/ceai/ontology-manager/api/v1/ListOntologyLinkTypeColumn',
  '/ceai/ontology-manager/api/v1/ListOntologyLinkTypeData',
  '/ceai/ontology-manager/api/v1/CreateOntologyAgent',
  '/ceai/appforge/api/v1/ListConversation',
  '/ceai/appforge/api/v1/ListMessage',
  '/ceai/appforge/api/v1/CreateMessage',
  '/ceai/appforge/api/v1/DeleteConversation',
  '/ceai/appforge/api/v1/UpdateConversation',
  '/ceai/appforge/api/v1/GetApp'
];

const isDevGatewayError = (errorMsg?: string) =>
  !!errorMsg &&
  (errorMsg.includes('status code 504') ||
    errorMsg.includes('status code 502') ||
    errorMsg.includes('status code 503') ||
    errorMsg.includes('Gateway Timeout') ||
    errorMsg.includes('Network Error'));

const shouldSuppressDevApiError = (requestUrl: string, errorMsg?: string) => {
  if (!isDevBypassEnabled()) {
    return false;
  }

  if (errorMsg?.includes('权限') || errorMsg?.includes('项目')) {
    return true;
  }

  if (isDevGatewayError(errorMsg)) {
    return true;
  }

  return silentDevErrorUrls.some((url) => requestUrl.includes(url));
};

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
    // 尝试获取 token（如果有的话）
    const consolePluginToken = getLoginToken();
    const projectId = useUserInfoStore.getState().projectId;

    // 开发环境添加测试用户 header（支持 localhost / 局域网 IP 访问）
    if (isDevBypassEnabled()) {
      if (config.headers) {
        config.headers['X-Ceai-User-Id'] = DEV_CEAI_USER_ID;
      }
    }

    // config.headers['Access-Control-Allow-Origin'] = '*';
    //配置自定义请求头
    if (config.headers && !config.headers?.['x-auth-validate'])
      config.headers['x-auth-validate'] = JSON.stringify(true);
    // 只有在 token 存在时才设置 Authorization header
    if (consolePluginToken && config.headers)
      config.headers['authorization'] = `Bearer ${consolePluginToken}`;
    config.headers && (config.headers['Content-Type'] = 'application/json');
    const shouldExclude = config.url && excludeUrl.includes(config.url);

    // 统一添加的公共参数（例如：设备信息、用户 Token 等）
    const rawProjectId = projectId?.[1];
    const hasValidProjectId =
      projectId &&
      projectId.length > 1 &&
      rawProjectId &&
      !isDevFallbackProjectId(projectId);
    const commonParams = {
      projectID: !shouldExclude && hasValidProjectId ? rawProjectId : undefined
    };
    // console.log('commonParams', commonParams);

    // 对于 POST/PUT/PATCH 请求，参数在 request body 中
    if (
      config.method &&
      ['post', 'put', 'patch'].includes(config.method.toLowerCase())
    ) {
      // 合并原有参数和公共参数
      if (config.data) {
        // 如果已有请求体，合并参数
        config.data = { ...commonParams, ...config.data };
      } else {
        // 如果没有请求体，直接赋值
        config.data = commonParams;
      }
    }

    // 对于 GET 请求，参数在 query string 中
    if (
      config.method?.toLowerCase() === 'get' &&
      hasValidProjectId &&
      !shouldExclude
    ) {
      config.params = config.params || {};
      config.params.projectID = rawProjectId;
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
      // 【新增】检查是否需要返回header数据
      if (response.config?.headers?.['need-header-data'] === 'true') {
        return response;
      }
      // 【新增】检查是否是二进制流响应
      const contentType = response.headers['content-type'] || '';
      const isBinaryResponse = BinaryContentTypes.some((type) =>
        contentType.includes(type)
      );

      // 如果是二进制响应，直接返回，避免进入错误处理逻辑
      if (isBinaryResponse) {
        const respType = (response.config as any).responseType;

        // axios 已经按 blob/arraybuffer 返回，直接透传即可
        if (respType === 'blob' || respType === 'arraybuffer') {
          console.log('✅ 二进制响应处理:', {
            contentType,
            responseType: respType,
            dataType: typeof res,
            isArrayBuffer: res instanceof ArrayBuffer,
            isBlob: res instanceof Blob,
            size: res?.byteLength || res?.size || 0
          });
          return res;
        }

        const isBlob = typeof Blob !== 'undefined' && res instanceof Blob;
        if (isBlob) return res;

        // 如果是 ArrayBuffer
        if (res instanceof ArrayBuffer) {
          return res;
        }

        // 其它情况直接返回，不再强制包装，避免体积膨胀
        return res;
      }

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
            const contentTypeHeader = response.headers?.['content-type'] ?? '';
            const isBlobResponse = response.config?.responseType === 'blob';

            if (isBlobResponse) {
              const blobData =
                response.data instanceof Blob
                  ? response.data
                  : new Blob([response.data], {
                      type: contentTypeHeader || 'application/octet-stream'
                    });
              return isBlobResponse ? response : blobData;
            }

            return JSON.parse(res);
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
        const requestUrl = response.config?.url || '';
        if (errorMsg && !shouldSuppressDevApiError(requestUrl, errorMsg)) {
          Message.error({ id: 'api-error-msg', content: errorMsg });
          console.error('api error message', errorMsg);
        }
        if (res?.statusCode === 100401) {
          logout(res?.data?.content);
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
      if (error.toString().indexOf('timeout') !== -1) {
        const requestUrl =
          error.config?.url || error.response?.config?.url || '';
        const suppressTimeoutNotice =
          isDevBypassEnabled() && isOntologyManagerApiUrl(requestUrl);

        if (!suppressTimeoutNotice) {
          Notification.error({
            title: '网络请求超时',
            content: '',
            duration: 5000
          });
        }
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
        const errorMsg = error?.response?.data?.message;
        const requestUrl = error.response?.config?.url || '';
        if (!shouldSuppressDevApiError(requestUrl, errorMsg)) {
          Message.error(errorMsg ?? '只读管理员无权限操作此内容！');
        }
      } else {
        console.log('code 500: ', code);
        const errorMsg = error.response.data.message || error.message;
        const requestUrl = error.response?.config?.url || '';
        if (errorMsg && !shouldSuppressDevApiError(requestUrl, errorMsg)) {
          Message.error(errorMsg);
          console.error(errorMsg);
        }
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
