import { useEffect, useRef } from 'react';
import { useProject } from '@/context/ProjectContext';

/**
 * 监听项目变化的Hook
 * 当项目ID发生变化时，执行回调函数
 *
 * @param callback 项目变化时的回调函数
 * @param deps 依赖数组，当依赖变化时也会执行回调
 */
export const useProjectChange = (
  callback: (projectId: string[]) => void,
  deps: any[] = []
) => {
  const { projectId } = useProject();
  const prevProjectIdRef = useRef<string[]>([]);
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    // 第一次渲染时直接执行回调
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      if (projectId && projectId.length === 2) {
        callback(projectId);
        prevProjectIdRef.current = projectId;
      }
      return;
    }

    // 检查项目ID是否发生变化
    const hasProjectChanged =
      projectId.length === 2 &&
      (prevProjectIdRef.current.length !== 2 ||
        prevProjectIdRef.current[1] !== projectId[1]);

    if (hasProjectChanged) {
      console.log('项目ID发生变化:', prevProjectIdRef.current, '->', projectId);
      callback(projectId);
      prevProjectIdRef.current = projectId;
    }
  }, [projectId, ...deps]);
};

/**
 * 页面数据刷新Hook
 * 专门用于页面组件监听项目变化并重新加载数据
 *
 * @param loadData 数据加载函数
 * @param deps 额外的依赖数组
 */
export const usePageRefresh = (
  loadData: () => void | Promise<void>,
  deps: any[] = []
) => {
  useProjectChange((projectId) => {
    console.log('项目变化，重新加载页面数据:', projectId);
    loadData();
  }, deps);
};

export default useProjectChange;
