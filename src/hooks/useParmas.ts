import { useEffect, useState, useCallback } from 'react';

/**
 * 自定义 Hook：获取 URL 查询参数
 * @param paramName 要获取的参数名
 * @returns 参数值（字符串或 null）
 */
export function useParams(paramName: string): string | null {
  const getParamValue = useCallback(() => {
    if (typeof window === 'undefined') return null; // SSR 兼容
    return new URLSearchParams(window.location.search).get(paramName);
  }, [paramName]);

  const [paramValue, setParamValue] = useState<string | null>(getParamValue);

  useEffect(() => {
    const handlePopState = () => {
      setParamValue(getParamValue());
    };

    // 初始化时获取一次
    setParamValue(getParamValue());

    // 监听 URL 变化
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, [getParamValue]);

  return paramValue;
}
