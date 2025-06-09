import * as _ from 'lodash';
import { getLocalStorage } from '@/utils/storage';

async function handleError(res) {
  try {
    const result = await res.json();
    return result.message || '服务端错误';
  } catch (err) {
    return '服务端错误';
  }
}

export type IOtherOptions = {
  getAbortController?: (abortController: AbortController) => void;
};

export const getToken = () => {
  const consolePluginToken = localStorage.getItem('console_token');
  const loginToken = getLocalStorage<string>('loginToken');
  const token = consolePluginToken ? `Bearer ${localStorage.getItem('console_token')}` : (loginToken ? `${loginToken.replace(/['"]/g, '').trim()}` : '')
  return token ? { authorization: token } : {}
}

async function baseRequest(
  url,
  init: RequestInit,
  otherOptions: IOtherOptions = {}
) {
  const abortController = new AbortController();
  otherOptions.getAbortController?.(abortController);

  const defaultInit = {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      ...getToken()
    },
    signal: abortController.signal
  };
  const newInit = _.merge(defaultInit, init);
  const res = await fetch(url, newInit);
  if (!res.ok) {
    const msg = await handleError(res);
    throw new Error(msg);
  }
  try {
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      return json;
    } catch (err) {
      throw err;
    }
  } catch (err) {
    throw err;
  }
}

export async function Get(
  url,
  params = {},
  headers = {},
  otherOptions: IOtherOptions = {}
) {
  const init: RequestInit = {
    headers
  };
  const query = Object.entries(params).reduce(
    (acc, cur) => acc + '&' + cur[0] + '=' + cur[1],
    ''
  );
  return baseRequest(url + (query ? '?' + query : ''), init, otherOptions);
}

export async function Delete(
  url,
  headers = {},
  otherOptions: IOtherOptions = {}
) {
  const init: RequestInit = {
    headers,
    method: 'DELETE'
  };
  return baseRequest(url, init, otherOptions);
}

export async function Post(
  url,
  data,
  headers = {},
  otherOptions: IOtherOptions = {}
) {
  const init: RequestInit = {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  };
  return baseRequest(url, init, otherOptions);
}

export async function Patch(
  url,
  data,
  headers = {},
  otherOptions: IOtherOptions = {}
) {
  const init: RequestInit = {
    method: 'PATCH',
    headers,
    body: JSON.stringify(data)
  };
  return baseRequest(url, init, otherOptions);
}
