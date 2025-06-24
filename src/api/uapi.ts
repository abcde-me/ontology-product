import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  Method
} from 'axios';
import {
  ActionEndpoints,
  ResourceEndpoints,
  ResourceEndpointsV2,
  ModaForgeResourceEndpoints
} from './endpoints';
import { getLocalStorage } from '@/utils/storage';

const uapiAxios: AxiosInstance = axios.create(); // 创建一个独立的axios实例

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head';

type AxiosConfigFunction = (config: Partial<AxiosRequestConfig>) => UAPIChain;
type InRegionFunction = (regionInfo?: {
  id?: string;
  az?: string;
  cell?: string;
  host?: string;
}) => Omit<UAPIChain, 'inRegion' | 'withConfig'>;
type SetModuleFunction = (
  moduleId: string
) => Omit<UAPIChain, 'setModule' | 'withConfig'>;

// 使用 keyof 和 typeof 获取 端点 的键
type RESEndpointKeys =
  | keyof typeof ResourceEndpoints
  | keyof typeof ResourceEndpointsV2
  | keyof typeof ModaForgeResourceEndpoints;
type ACTEndpointKeys = keyof typeof ActionEndpoints;

type RequestFulfilledFunction = (
  config: AxiosRequestConfig
) => AxiosRequestConfig | Promise<AxiosRequestConfig>;
type RequestRejectedFunction = (error: any) => any;

type ResponseFulfilledFunction = (
  response: AxiosResponse
) => AxiosResponse | Promise<AxiosResponse>;
type ResponseRejectedFunction = (error: any) => any;

type CustomInRegionFunction = (
  regionInfo?: Parameters<InRegionFunction>[0],
  axiosConfig?: AxiosRequestConfig
) => AxiosRequestConfig;

type CustomSetModuleFunction = (
  moduleId?: Parameters<SetModuleFunction>[0],
  axiosConfig?: AxiosRequestConfig
) => AxiosRequestConfig;

interface UAPIConfigType {
  // 获取UAPI实例
  createInstance: () => UAPIType;
  // 设置默认UAPI配置
  setDefaultConfig: (config: AxiosRequestConfig) => void;
  // 设置UAPI请求拦截器(可设置多个)
  addRequestInterceptor: (
    onFulfilled: RequestFulfilledFunction,
    onRejected?: RequestRejectedFunction
  ) => number;
  // 设置UAPI响应拦截器(可设置多个)
  addResponseInterceptor: (
    onFulfilled: ResponseFulfilledFunction,
    onRejected?: ResponseRejectedFunction
  ) => number;
  // 取消某个UAPI请求拦截器(ID来自于设置时返回值)
  ejectRequestInterceptor: (interceptorId: number) => void;
  // 取消某个UAPI响应拦截器(ID来自于设置时返回值)
  ejectResponseInterceptor: (interceptorId: number) => void;
  // 覆盖inRegion函数
  inRegionFunction: CustomInRegionFunction;
  setModuleFunction: CustomSetModuleFunction;
}

interface UAPIChain {
  withConfig: AxiosConfigFunction;
  inRegion: InRegionFunction;
  setModule: SetModuleFunction;
  do: (options?: DoOptions) => Promise<any>;
}

type BaseResourceLocator = {
  id?: string | number;
};

type HTTPMethodFunction<T = Record<string | number, any> | Array<any>> = (
  data?: T // 提供给HTTP方法的参数，可以不传、传对象、传数组，不可传入数字、字符串，也可用户自定义传入
) => UAPIChain;

type RESEndpointsFunction<T = Record<string, string | number>> = (
  params: T & BaseResourceLocator
) => {
  [Method in HttpMethod]: HTTPMethodFunction;
};

type ACTEndpointsFunction = (data?: any) => UAPIChain;

// 定义 API 接口
interface UAPIType {
  RES: Record<RESEndpointKeys, RESEndpointsFunction>;
  ACT: Record<ACTEndpointKeys, ACTEndpointsFunction>;
}

type Endpoint = string;

let defaultConfig: Partial<AxiosRequestConfig> = {};

// 目前是固定引入端点
const resEndpoints = ResourceEndpoints;
const resEndpointsV2 = ResourceEndpointsV2;
const modaForgeResEndpoints = ModaForgeResourceEndpoints;
const actEndpoints = ActionEndpoints;

const replaceUriParams = (uri: string, params: Record<string, any>) => {
  let result = uri;
  let hasId = false;

  // id在uapi中是特殊uri参数，特指定位资源某个实例使用
  // 对应地，id作为一个可选传入参数，如果传入，那么uri将表示定位到该id对应的该资源
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      if (key === 'id') {
        hasId = true;
      } else {
        result = result.replace(`{${key}}`, params[key]);
      }
    }
  }

  // 为确保兼容uri书写在尾部省略'/'的写法，此处如果检测尾部没有'/'将会自动加上'/'
  if (hasId) {
    result = result.endsWith('/') ? result : result + '/';
    result += params['id'];
  }

  return result;
};

const UAPI_CONFIG: UAPIConfigType = {
  setDefaultConfig: (config: AxiosRequestConfig) => {
    defaultConfig = Object.assign(defaultConfig, config);
  },
  addRequestInterceptor: (onFulfilled, onRejected) => {
    return uapiAxios.interceptors.request.use(onFulfilled, onRejected);
  },
  addResponseInterceptor: (onFulfilled, onRejected) => {
    return uapiAxios.interceptors.response.use(onFulfilled, onRejected);
  },
  ejectRequestInterceptor: (interceptorId: number) => {
    uapiAxios.interceptors.request.eject(interceptorId);
  },
  ejectResponseInterceptor: (interceptorId: number) => {
    uapiAxios.interceptors.response.eject(interceptorId);
  },
  inRegionFunction: (
    regionInfo?: Parameters<InRegionFunction>[0],
    axiosConfig?: AxiosRequestConfig
  ) => {
    if (!regionInfo || !regionInfo.id) {
      // 如果没有regionInfo，那就用当前的
      const parts = /\/(region\/(.*)\/)?console\/(.*)\//.exec(
        window.location.href
      );
      const currentRegionId = parts?.[2] ?? 'region1';

      currentRegionId &&
        (axiosConfig.headers = Object.assign(axiosConfig.headers ?? {}, {
          'x-regionid': currentRegionId
        }));

      return axiosConfig || {};
    }

    // 指定策略，用regionInfo的
    const { id } = regionInfo;

    axiosConfig.headers = Object.assign(axiosConfig.headers ?? {}, {
      'x-regionid': id
    });

    regionInfo.host &&
      (axiosConfig.baseURL =
        '//' +
        `${regionInfo.host}/${axiosConfig.baseURL}`.replace(/\/{2,}/, '/'));

    return axiosConfig || {};
  },
  setModuleFunction: (
    moduleId: Parameters<SetModuleFunction>[0],
    axiosConfig?: AxiosRequestConfig
  ) => {
    moduleId &&
      (axiosConfig.headers = Object.assign(axiosConfig.headers ?? {}, {
        'x-request-from': `webapi/${moduleId}`
      }));

    return axiosConfig || {};
  },
  createInstance: () => {
    return UAPI;
  }
};

// 实现 UAPI
const UAPI: UAPIType = {
  RES: {} as any,
  ACT: {} as any
};

type DoOptions = {
  getAbortController?: (controller) => void;
  //是否主动检查返回值的status状态
  preCheck?: boolean;
  headers?: any;
};

const createUAPIChain = (
  method: Method,
  uri: string,
  dataOrParams: any,
  isData: boolean,
  axiosConfig?: Partial<AxiosRequestConfig>
): UAPIChain => {
  const innerConfig: AxiosRequestConfig = {
    ...Object.assign({}, defaultConfig, axiosConfig),
    method,
    url: uri
  };

  if (dataOrParams) {
    if (isData) {
      innerConfig.data = dataOrParams;
    } else {
      innerConfig.params = dataOrParams;
    }
  }

  return {
    withConfig: (config: Partial<AxiosRequestConfig>): UAPIChain => {
      const newConfig = { ...innerConfig, ...config };
      return createUAPIChain(method, uri, dataOrParams, isData, newConfig);
    },
    // 不调用这个函数，就默认往中心region发送请求
    inRegion: (regionInfo?: Parameters<InRegionFunction>[0]): UAPIChain => {
      const newConfig = UAPI_CONFIG.inRegionFunction(regionInfo, innerConfig);
      return createUAPIChain(method, uri, dataOrParams, isData, newConfig);
    },
    setModule: (moduleId: string): UAPIChain => {
      const newConfig = UAPI_CONFIG.setModuleFunction(moduleId, innerConfig);
      return createUAPIChain(method, uri, dataOrParams, isData, newConfig);
    },
    do: (options: DoOptions = {}) => {
      const { getAbortController, preCheck = true, headers = {} } = options;
      const extraConfig: any = {};
      if (getAbortController) {
        const controller = new AbortController();
        getAbortController(controller);
        extraConfig.signal = controller;
      }
      extraConfig.preCheck = preCheck;
      // do sth in feature...
      return uapiAxios({
        ...innerConfig,
        ...extraConfig,

        headers: { ...innerConfig.headers, ...headers }
      });
    }
  };
};

// 通过一种方法，ActionEndpoints 里每一个 key，将成为 API.ACT 内对象的的 key
for (const key in actEndpoints) {
  UAPI.ACT[key] = (data: any) => {
    const replacedUri = actEndpoints[key] as Endpoint;
    return createUAPIChain('post', replacedUri, data, true);
  };
}

// 通过一种方法，ResourceEndpoints 里每一个 key，将成为 API.RES 内对象的的 key
for (const key in resEndpoints) {
  const resourceEndpointFunction: RESEndpointsFunction = (
    params: Record<string, string | number>
  ) => {
    const replacedUri = replaceUriParams(
      resEndpoints[key] as Endpoint,
      params || {}
    );
    return {
      get: (params?: any) => createUAPIChain('get', replacedUri, params, false),
      post: (data?: any) => createUAPIChain('post', replacedUri, data, true),
      put: (data?: any) => createUAPIChain('put', replacedUri, data, true),
      patch: (data?: any) => createUAPIChain('patch', replacedUri, data, true),
      head: (params?: any) =>
        createUAPIChain('head', replacedUri, params, false),
      delete: (data?: any) =>
        createUAPIChain(
          'delete',
          replacedUri,
          data,
          data instanceof Array || data instanceof Object
        )
    } as {
      [Method in HttpMethod]: () => UAPIChain;
    };
  };
  UAPI.RES[key] = resourceEndpointFunction;
}

// 通过一种方法，ResourceEndpointsV2 里每一个 key，将成为 API.RES 内对象的的 key
for (const key in resEndpointsV2) {
  const resourceEndpointFunctionV2: RESEndpointsFunction = (
    params: Record<string, string | number>
  ) => {
    const replacedUri = replaceUriParams(
      resEndpointsV2[key] as Endpoint,
      params || {}
    );
    return {
      get: (params?: any) => createUAPIChain('get', replacedUri, params, false),
      post: (data?: any) => createUAPIChain('post', replacedUri, data, true),
      put: (data?: any) => createUAPIChain('put', replacedUri, data, true),
      patch: (data?: any) => createUAPIChain('patch', replacedUri, data, true),
      head: (params?: any) =>
        createUAPIChain('head', replacedUri, params, false),
      delete: (data?: any) =>
        createUAPIChain(
          'delete',
          replacedUri,
          data,
          data instanceof Array || data instanceof Object
        )
    } as {
      [Method in HttpMethod]: () => UAPIChain;
    };
  };
  UAPI.RES[key] = resourceEndpointFunctionV2;
}

// 通过一种方法，ResourceEndpointsV2 里每一个 key，将成为 API.RES 内对象的的 key
for (const key in modaForgeResEndpoints) {
  const resourceEndpointFunction: RESEndpointsFunction = (
    params: Record<string, string | number>
  ) => {
    const replacedUri = replaceUriParams(
      modaForgeResEndpoints[key] as Endpoint,
      params || {}
    );
    return {
      get: (params?: any) => createUAPIChain('get', replacedUri, params, false),
      post: (data?: any) => createUAPIChain('post', replacedUri, data, true),
      put: (data?: any) => createUAPIChain('put', replacedUri, data, true),
      patch: (data?: any) => createUAPIChain('patch', replacedUri, data, true),
      head: (params?: any) =>
        createUAPIChain('head', replacedUri, params, false),
      delete: (data?: any) =>
        createUAPIChain(
          'delete',
          replacedUri,
          data,
          data instanceof Array || data instanceof Object
        )
    } as {
      [Method in HttpMethod]: () => UAPIChain;
    };
  };
  UAPI.RES[key] = resourceEndpointFunction;
}
UAPI_CONFIG.addRequestInterceptor((config) => {
  // 严格校验逻辑
  const rawToken = getLocalStorage<string>('loginToken');
  // console.log('cleanToken', rawToken);

  // 1. 类型检查
  if (typeof rawToken !== 'string') return config;

  // 2. 清理无效字符（包括引号和空白）
  const cleanToken = rawToken.replace(/['"]/g, '').trim();

  // 3. JWT 格式验证（严格正则）
  const isValidJWT =
    /^([A-Za-z0-9-_]{4,})\.([A-Za-z0-9-_]{4,})\.([A-Za-z0-9-_]{4,})$/.test(
      cleanToken
    );

  // 移除旧的授权头(如果存在)，确保不会有重复或冲突
  if (config.headers) {
    delete config.headers.authorization;
    delete config.headers.Authorization;
  }

  if (isValidJWT) {
    // 强制覆盖而非追加
    config.headers = {
      ...config.headers,
      Authorization: `${cleanToken}` // 直接使用清理后的令牌
    };
  } else {
    console.error('检测到无效令牌，已清除:', cleanToken);
    localStorage.removeItem('loginToken');
  }

  return config;
});

export default UAPI_CONFIG;
