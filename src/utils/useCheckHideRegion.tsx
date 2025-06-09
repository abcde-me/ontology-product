import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import settings from '@/settings.json';

function useCheckHideRegion() {
  const history = useHistory();
  const pathname = history.location.pathname;
  const hash = history.location.hash;
  const dispatch = useDispatch();
  const showRegionPath = settings['showRegionPath'] || [];
  const hideRegionPath = settings['hideRegionPath'] || [];
  useEffect(() => {
    const { pathname: fullPathname } = window.location;
    const parts = fullPathname.split('/');
    const moduleId = parts[parts.indexOf('console') + 1];
    const showRegionPathList = showRegionPath.map((item) => {
      return item.replace(':module', moduleId);
    });
    if (
      showRegionPathList.includes(pathname) ||
      showRegionPathList.includes(pathname + hash.split('?')[0])
    ) {
      dispatch({
        type: 'update-visibleAreaSelect',
        payload: { visibleAreaSelect: true },
      });
    } else {
      dispatch({
        type: 'update-visibleAreaSelect',
        payload: { visibleAreaSelect: false },
      });
    }
    const hideRegionPathList = hideRegionPath.map((item) => {
      return item.replace(':module', moduleId);
    });
    if (
      hideRegionPathList.includes(pathname) ||
      hideRegionPathList.includes(pathname + hash.split('?')[0])
    ) {
      dispatch({
        type: 'update-visibleAreaSelect',
        payload: { visibleAreaSelect: false },
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, hash]);
}
export default useCheckHideRegion;
