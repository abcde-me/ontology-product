import {
  setLocalStorage,
  removeLocalStorage,
  getLocalStorage
} from '@/utils/storage';
import { MDPPrefix } from './const';

export const isInCCloud = !!(window as any).SERVER_FLAGS?.basePath;

export const isSingleApp = !(window as any).SERVER_FLAGS?.basePath;

export const isInFrame = window.self !== window.top;

export const isWujie = !!(window as any).$wujie;

export const embedAppName = () => (window as any).$wujie?.props?.appName;

// 单产品集成
export const embedBySingleApp = () =>
  (window as any).$wujie?.props?.embedBySingleApp;

// 兼容 embedBySingleApp 透传失败时的兜底判断
export const isEmbeddedBySingleApp = () => {
  const appName = embedAppName();
  if (!!embedBySingleApp() || appName === 'modaforge') {
    return true;
  }

  const search = window.location.search || '';
  if (search) {
    const params = new URLSearchParams(search);
    if (
      params.get('embedBySingleApp') === '1' ||
      params.get('hideLayout') === '1'
    ) {
      return true;
    }
  }

  try {
    const parentLocation = window.parent?.location;
    if (!parentLocation) {
      return false;
    }

    const parentPath = parentLocation.pathname || '';
    const parentSearch = parentLocation.search || '';
    const hasEmbeddedRoute = parentPath.includes(
      '/modaforge/tenant/compute/modaforge/ontoCenter'
    );
    const hasEmbeddedFlag = new URLSearchParams(parentSearch).has('mdp_onto');
    return hasEmbeddedRoute || hasEmbeddedFlag;
  } catch (error) {
    return false;
  }
};

export const getUrlSearchName = () =>
  (window as any).$wujie?.props?.urlSearchName;

export const onRouterChange = (path: string, menuPath: string) => {
  (window as any).$wujie?.props?.onRouterChange?.(path, menuPath);
};

export const logout = (basePath = '') => {
  if (isWujie) {
    (window as any).$wujie?.props?.logout();
  } else {
    if (isSingleApp) {
      window.location.href = `/onto/login?redirect_uri=${encodeURIComponent(window.location.href)}`;
    } else {
      window.location.href = `${basePath}?redirect_uri=${encodeURIComponent(window.location.href)}`;
    }
  }
};

export const setLoginToken = (token: string) => {
  // 使用 cookie+session 方式，不需要手动管理 token
  // 直接使用 localStorage
  setLocalStorage('loginToken', token);
  setLocalStorage('console_token', token);
};

export const getLoginToken = () => {
  // 使用 cookie+session 方式，不需要从 wujie props 获取
  // 直接从 localStorage 读取
  return (
    (getLocalStorage('console_token') as string) ||
    (getLocalStorage('loginToken') as string)
  );
};

export const removeLoginToken = () => {
  // 使用 cookie+session 方式，直接清除 localStorage
  removeLocalStorage('loginToken');
  removeLocalStorage('console_token');
  removeLocalStorage('customizeOptions');
};
export const openNewPage = (page: string) => {
  if (isWujie) {
    (window as any).$wujie?.props?.openNewPage(page);
  } else {
    window.open(page, '_blank');
  }
};

export const OpenNewPageForOperationCenter = (page: string) => {
  if (isWujie) {
    (window as any).$wujie?.props?.openNewPage(page);
  } else {
    window.open(
      MDPPrefix +
        '/tenant/compute/onto/operationCenter?url=' +
        encodeURIComponent(page),
      '_blank'
    );
  }
};
