import { useSelector } from 'react-redux';
import type { GlobalState } from '@/store';
import { get } from 'lodash-es';

export default function useSafeSelector(path: string, fallback?: any) {
  const data = useSelector((state: GlobalState) => {
    return get(state ?? {}, `plugins.${path}`);
  });

  return data ?? fallback ?? {};
}
