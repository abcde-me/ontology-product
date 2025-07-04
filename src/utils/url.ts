export function useParams(name: string) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

export function goParams(history, params: Record<string, string>) {
  const origin = new URLSearchParams(history.location.search);
  Object.entries(params).forEach((item) => {
    origin.set(item[0], item[1]);
  });
  history.push(history.location.pathname + '?' + origin.toString());
}

export const updateQueryParams = (history, newParams) => {
  // 获取当前路径和查询参数
  const currentPath = history.location.pathname;
  const currentSearch = new URLSearchParams(history.location.search);

  // 更新查询参数
  Object.entries(newParams).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      currentSearch.delete(key);
    } else {
      currentSearch.set(key, value as string);
    }
  });

  // 推入新的历史记录
  history.push({
    pathname: currentPath,
    search: currentSearch.toString()
  });
};
