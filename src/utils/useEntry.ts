import { useSelector } from 'react-redux';
import { GlobalState } from '../store/index';

export const getModuleTypeFromUrl = () => {
  const { basePath } = (window as any).SERVER_FLAGS;
  const moduleType =
    window.location.pathname.replace(basePath || '', '').split('/')[0] || '';
  return moduleType;
};
export function useEntry() {
  const moduleType = getModuleTypeFromUrl();
  const entry = useSelector(
    (state: GlobalState): any => state.globalVars?.entry
  );

  if (entry && entry.entryFromUrl) {
    return entry;
  } else {
    return {
      entryFromUrl: moduleType,
    };
  }
}
