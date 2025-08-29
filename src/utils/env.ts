import {
  setLocalStorage,
  removeLocalStorage,
  getLocalStorage
} from '@/utils/storage';

export const isInCCloud = !!(window as any).SERVER_FLAGS?.basePath;

export const isSingleApp = !(window as any).SERVER_FLAGS?.basePath;

export const isInFrame = window.self !== window.top;

export const isWujie = !!(window as any).$wujie;

export const logout = (basePath = '') => {
  if (isWujie) {
    (window as any).$wujie?.props?.logout();
  } else {
    if (isSingleApp) {
      window.location.href = `/modaforge/login?redirect_uri=${encodeURIComponent(window.location.href)}`;
    } else {
      window.location.href = `${basePath}?redirect_uri=${encodeURIComponent(window.location.href)}`;
    }
  }
};

export const setLoginToken = (token: string) => {
  if (isWujie) {
    (window as any).$wujie?.props?.setLoginToken(token);
  } else {
    setLocalStorage('loginToken', token);
  }
};
export const getLoginToken = () => {
  if (isWujie) {
    return (window as any).$wujie?.props?.getLoginToken() as string;
  } else {
    return getLocalStorage('loginToken') as string;
  }
};
export const removeLoginToken = () => {
  if (isWujie) {
    (window as any).$wujie?.props?.removeLoginToken();
  } else {
    removeLocalStorage('loginToken');
    removeLocalStorage('console_token');
  }
};
export const openNewPage = (page: string) => {
  if (isWujie) {
    (window as any).$wujie?.props?.openNewPage(page);
  } else {
    window.open(page, '_blank');
  }
};
