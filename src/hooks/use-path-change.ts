import { useCallback, useMemo } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { baseRoute } from '@/config/base';

type Actions = {
  push: (path: string, state?) => void;
  replace: (path: string, state?) => void;
  new: (path: string, state?) => void;
};
/**
 * 处理路径 - 加上产品前缀
 * @param url - 以/开头的路径
 * @returns
 */
export function handlePathName(url: string): string {
  return `${baseRoute}${url}`;
}
/**
 * 层级替换函数
 */
export type ReplaceLayer = (layer: number, relativePath: string) => string;

/**
 * 自定义path处理函数
 */
export type CustomPath = (
  matchedPath: string,
  replaceLayer: ReplaceLayer
) => string;

/**
 * 替换当前路径的最后一级为newPath，不含含query和hash
 * @param currentPath
 * @param newPath
 * @returns
 */
export const changePathTail = (currentPath: string, newPath: string) =>
  currentPath.replace(/\/[^/]+\/?$/, `/${newPath}`);

/**
 * 路径相加，兼容path1结尾有/或者path2开头有/的情况
 * @param path1
 * @param path2
 * @returns
 */
export const addPath = (path1: string, path2: string) =>
  path1.replace(/\/$/, '') + '/' + path2.replace(/^\//, '');

/**
 * 处理绝对路径，相对路径和自定义算法的情况
 * @param path
 * @param matchedPath
 * @returns
 */
export function getPath(
  path: string | CustomPath,
  matchedPath: string,
  action: string
): string {
  if (typeof path === 'function') {
    return path(matchedPath, (layer: number, relativePath: string) =>
      addPath(
        matchedPath.replace(new RegExp(`(\/[^/]+){${layer}}$`), ''),
        relativePath
      )
    );
  }

  if (path.startsWith('./')) {
    return addPath(matchedPath, path.replace(/^\./, ''));
  }

  if (path.startsWith('/') || action === 'new') {
    return path;
  }

  return changePathTail(matchedPath, path);
}

export function usePathChange() {
  const history = useHistory();
  const match = useRouteMatch();

  const goPathFunction: Actions = useMemo(
    () => ({
      push: history.push,
      replace: history.replace,
      new: (path, state = ['_blank']) => {
        if (Array.isArray(state)) {
          window.open(path, ...state);
        } else {
          window.open(path);
        }
      }
    }),
    [history.push, history.replace]
  );

  const goPath = useCallback(
    (action: keyof Actions) =>
      /**
       * 路由跳转
       * @param path 类型为string：以/开头，会跳转到绝对路径；以./开头，路径拼接在当前路径之后; 非/开头，跳转同级的相对路径； 类型为函数则跳转到返回的路径，参数为 当前路径(useRouteMatch().path), 层级替换函数 (layer: number, relativePath: string) => string
       */
      (path: string | CustomPath, state?) => {
        goPathFunction[action](getPath(path, match.path, action), state);
      },
    [goPathFunction, match.path]
  );

  return {
    pushPath: useMemo(() => goPath('push'), [goPath]),
    replacePath: useMemo(() => goPath('replace'), [goPath]),
    openNew: useMemo(() => goPath('new'), [goPath]),
    goBack: history.goBack,
    match,
    history
  };
}
