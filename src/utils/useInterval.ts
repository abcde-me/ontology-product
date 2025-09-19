import { useRef, useEffect, useCallback } from 'react';
type AnyFunction = (...items: any) => void | any;
export function useInterval(callback: AnyFunction, delay: null | number) {
  const refIntervalId = useRef<ReturnType<typeof setInterval> | null>(null);
  const refSavedCallback = useRef<AnyFunction>();

  const setUpInterval = useCallback(() => {
    if (delay !== null) {
      refIntervalId.current = setInterval(() => {
        refSavedCallback.current && refSavedCallback.current();
      }, delay);
    }
  }, [delay]);

  const cleanUpInterval = () => {
    refIntervalId.current && clearInterval(refIntervalId.current);
  };

  const resetInterval = () => {
    cleanUpInterval();
    setUpInterval();
  };

  // Remember the latest function.
  useEffect(() => {
    refSavedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    setUpInterval();
    return cleanUpInterval;
  }, [delay, setUpInterval]);

  return [cleanUpInterval, resetInterval];
}
