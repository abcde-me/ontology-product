import { useSelector } from 'react-redux';
import type { GlobalState } from '@/store';
import pathGet from 'lodash/get';

export default function useSafeSelector(path: string, fallback?: any) {
  const data = useSelector((state: GlobalState) => {
    return pathGet(state ?? {}, `plugins.${path}`);
  });

  return data ?? fallback ?? {};
}
