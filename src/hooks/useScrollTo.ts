import { useCallback } from 'react';

export const useScrollTo = () => {
  const scrollTo = useCallback((target, options = {}) => {
    const el =
      typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    el.scrollIntoView({
      behavior: options.smooth ? 'smooth' : 'auto',
      block: options.align || 'start', // start/center/end
      inline: 'nearest'
    });
  }, []);

  return scrollTo;
};
