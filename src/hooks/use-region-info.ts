import { useCallback, useEffect, useMemo } from 'react';
import useSafeSelector from './use-safe-selector';

const SPLIT_REGEXP = /\/(region\/(.*)\/)?console\/(.*)\//;

/**
 * 通过window.location.href，获取当前的region信息
 */
export const queryCurrentRegionInfo = () => {
  const groups = SPLIT_REGEXP.exec(window.location.href);

  return {
    module: groups?.[3], // module, tenant/om/portal/...
    regionId: groups?.[2] ?? 'region1',
  };
};

/**
 * 获取当前的region信息和regionHosts
 */
export default function useRegionInfo(
  options?: Partial<{
    useRegionList: boolean;
  }>,
) {
  const { useRegionList } = { useRegionList: false, ...(options ?? {}) };
  const current = queryCurrentRegionInfo();
  const regionList = useSafeSelector('consolePluginTopbar.regionList', []) as ({
    regionId: string;
    baseUrl: string;
  } & Record<string, string>)[];

  const regionHosts = useMemo(
    () =>
      useRegionList
        ? regionList.reduce((map, curr) => {
            map[curr.regionId] = curr.baseUrl.replace('//', '');
            return map;
          }, {})
        : null,
    [regionList, useRegionList],
  );

  return {
    current,
    regionHosts,
    // 如果不需要regionList，那就直接ready，不等待
    ready: !useRegionList || !!Object.keys(regionList).length,
  };
}

/**
 * 搭配region信息的useEffect
 */
export function useRegionEffect(
  effectFn: (
    regionInfo: ReturnType<typeof useRegionInfo>,
  ) => (() => void) | void,
  deps: any[],
  options?: Partial<{
    useRegionList: boolean;
  }>,
) {
  const regionInfo = useRegionInfo(options);

  useEffect(() => {
    if (!regionInfo.ready) {
      return;
    }

    return effectFn(regionInfo);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectFn, regionInfo, regionInfo.regionHosts, regionInfo.ready, deps].filter(Boolean).flat(Infinity));
}

/**
 * 搭配region信息的useCallback
 */
export function useRegionCallback(
  effectFn: (
    regionInfo: ReturnType<typeof useRegionInfo>,
  ) => void | Promise<void>,
  deps?: any[],
  options?: Partial<{
    useRegionList: boolean;
  }>,
) {
  const regionInfo = useRegionInfo(options);

  return useCallback(async () => {
    regionInfo.ready && (await effectFn(regionInfo));
    // effectFn不作为依赖，否则外部effectFn不做memo，会死循环
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionInfo.ready, deps].filter(Boolean).flat(Infinity));
}
