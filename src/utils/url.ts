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
