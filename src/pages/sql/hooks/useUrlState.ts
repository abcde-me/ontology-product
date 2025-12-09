import { useState, useEffect, useCallback, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

interface UrlState {
  folderId?: string;
  fileId?: string;
  search?: string;
  activeTab?: string;
  activeDevelopScriptId?: string;
}

export const useUrlState = () => {
  const history = useHistory();
  const location = useLocation();
  const isUpdatingRef = useRef(false);

  // 从URL解析初始状态
  const parseUrlState = useCallback((): UrlState => {
    const searchParams = new URLSearchParams(location.search);
    return {
      folderId: searchParams.get('folderId') || undefined,
      fileId: searchParams.get('fileId') || undefined,
      search: searchParams.get('search') || undefined,
      activeTab: searchParams.get('activeTab') || undefined,
      activeDevelopScriptId:
        searchParams.get('activeDevelopScriptId') || undefined
    };
  }, [location.search]);

  const [urlState, setUrlState] = useState<UrlState>(() => parseUrlState());

  // 更新URL状态
  const updateUrlState = useCallback(
    (
      newState: Partial<UrlState>,
      options?: { method?: 'replace' | 'push' }
    ) => {
      // 防止重复更新
      if (isUpdatingRef.current) return;

      isUpdatingRef.current = true;

      const updatedState = { ...urlState, ...newState };

      // 从当前URL创建searchParams，保留所有现有查询参数
      const searchParams = new URLSearchParams(location.search);

      // 只更新需要更新的参数
      if (updatedState.folderId !== undefined) {
        if (updatedState.folderId) {
          searchParams.set('folderId', updatedState.folderId);
        } else {
          searchParams.delete('folderId');
        }
      }
      if (updatedState.fileId !== undefined) {
        if (updatedState.fileId) {
          searchParams.set('fileId', updatedState.fileId);
        } else {
          searchParams.delete('fileId');
        }
      }
      if (updatedState.search !== undefined) {
        if (updatedState.search) {
          searchParams.set('search', updatedState.search);
        } else {
          searchParams.delete('search');
        }
      }
      if (updatedState.activeTab !== undefined) {
        if (updatedState.activeTab) {
          searchParams.set('activeTab', updatedState.activeTab);
        } else {
          searchParams.delete('activeTab');
        }
      }
      if (updatedState.activeDevelopScriptId !== undefined) {
        if (updatedState.activeDevelopScriptId) {
          searchParams.set(
            'activeDevelopScriptId',
            updatedState.activeDevelopScriptId
          );
        } else {
          searchParams.delete('activeDevelopScriptId');
        }
      }

      const newSearch = searchParams.toString();
      const newUrl = newSearch
        ? `${location.pathname}?${newSearch}`
        : location.pathname;

      // 只有当URL真正改变时才更新
      if (newUrl !== location.pathname + location.search) {
        const method = options?.method || 'replace';
        if (method === 'push') {
          history.push(newUrl);
        } else {
          history.replace(newUrl);
        }
        setUrlState(updatedState);
      }

      // 延迟重置标志，避免立即触发useEffect
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 0);
    },
    [urlState, history, location.pathname, location.search]
  );

  // 清除所有URL状态
  const clearUrlState = useCallback(() => {
    if (isUpdatingRef.current) return;

    isUpdatingRef.current = true;
    history.replace(location.pathname);
    setUrlState({});

    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 0);
  }, [history, location.pathname]);

  // 监听URL变化并更新状态（只在外部URL变化时更新）
  useEffect(() => {
    // 如果正在更新URL，跳过这次useEffect
    if (isUpdatingRef.current) return;

    const newState = parseUrlState();
    const currentState = urlState;

    // 只有当状态真正改变时才更新
    if (JSON.stringify(newState) !== JSON.stringify(currentState)) {
      setUrlState(newState);
    }
  }, [location.search]);

  return {
    urlState,
    updateUrlState,
    clearUrlState
  };
};
