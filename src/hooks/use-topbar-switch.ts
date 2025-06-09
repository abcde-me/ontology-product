import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

export default function useTopbarSwitch(hideTopBar = true) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({
      type: 'update-local-layout',
      payload: {
        hideTopBar
      }
    });
    return () => {
      dispatch({
        type: 'update-local-layout',
        payload: {
          hideTopBar: !hideTopBar
        }
      });
    };
  }, [dispatch, hideTopBar]);
}
