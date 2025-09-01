import { useState, useEffect, useCallback } from 'react';

interface UseFullscreenOptions {
  onEnter?: () => void;
  onExit?: () => void;
  escKey?: boolean;
  preventScroll?: boolean;
}

export const useFullscreen = (options: UseFullscreenOptions = {}) => {
  const { onEnter, onExit, escKey = true, preventScroll = true } = options;

  const [isFullscreen, setIsFullscreen] = useState(false);

  const enterFullscreen = useCallback(() => {
    setIsFullscreen(true);
    onEnter?.();
  }, [onEnter]);

  const exitFullscreen = useCallback(() => {
    setIsFullscreen(false);
    onExit?.();
  }, [onExit]);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  useEffect(() => {
    if (!escKey) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        exitFullscreen();
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
      if (preventScroll) {
        document.body.style.overflow = 'hidden';
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (preventScroll) {
        document.body.style.overflow = 'auto';
      }
    };
  }, [isFullscreen, escKey, preventScroll, exitFullscreen]);

  return {
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen
  };
};
