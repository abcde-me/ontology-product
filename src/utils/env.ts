import {
  setLocalStorage,
  removeLocalStorage,
  getLocalStorage
} from '@/utils/storage';

export const isInCCloud = !!(window as any).SERVER_FLAGS?.basePath;

export const isSingleApp = !(window as any).SERVER_FLAGS?.basePath;

export const isInFrame = window.self !== window.top;

export const logout = (basePath = '') => {
  if (isSingleApp) {
    window.location.href = `/login?redirect_uri=${encodeURIComponent(window.location.href)}`;
  } else {
    window.location.href = `${basePath}?redirect_uri=${encodeURIComponent(window.location.href)}`;
  }
};

export const setLoginToken = (token: string) => {
  setLocalStorage('loginToken', token);
};
export const getLoginToken = () => {
  return getLocalStorage('loginToken') as string;
};
export const removeLoginToken = () => {
  removeLocalStorage('loginToken');
  removeLocalStorage('console_token');
};
