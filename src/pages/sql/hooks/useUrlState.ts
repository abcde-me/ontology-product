import { useState, useEffect, useCallback, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

interface UrlState {
  folderId?: string;
  fileId?: string;
  search?: string;
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
      search: searchParams.get('search') || undefined
    };
  }, [location.search]);

  const [urlState, setUrlState] = useState<UrlState>(() => parseUrlState());

  // 更新URL状态
  const updateUrlState = useCallback(
    (newState: Partial<UrlState>) => {
      // 防止重复更新
      if (isUpdatingRef.current) return;

      isUpdatingRef.current = true;

      const updatedState = { ...urlState, ...newState };

      // 构建新的查询参数
      const searchParams = new URLSearchParams();

      if (updatedState.folderId) {
        searchParams.set('folderId', updatedState.folderId);
      }
      if (updatedState.fileId) {
        searchParams.set('fileId', updatedState.fileId);
      }
      if (updatedState.search) {
        searchParams.set('search', updatedState.search);
      }

      const newSearch = searchParams.toString();
      const newUrl = newSearch
        ? `${location.pathname}?${newSearch}`
        : location.pathname;

      // 只有当URL真正改变时才更新
      if (newUrl !== location.pathname + location.search) {
        history.replace(newUrl);
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
