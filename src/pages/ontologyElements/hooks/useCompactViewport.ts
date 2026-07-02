import { useEffect, useState } from 'react';

const COMPACT_MEDIA_QUERY = '(max-height: 860px), (max-width: 1440px)';

export const useCompactViewport = () => {
  const [isCompact, setIsCompact] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.matchMedia(COMPACT_MEDIA_QUERY).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(COMPACT_MEDIA_QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      setIsCompact(event.matches);
    };

    setIsCompact(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return { isCompact };
};
