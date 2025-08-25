import React, { ReactNode } from 'react';
import { useFullscreen } from '../hooks/useFullscreen';

interface FullscreenContainerProps {
  children: (props: any) => ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onEnter?: () => void;
  onExit?: () => void;
  escKey?: boolean;
  preventScroll?: boolean;
}

export const FullscreenContainer: React.FC<FullscreenContainerProps> = ({
  children,
  className = '',
  style = {},
  onEnter,
  onExit,
  escKey = true,
  preventScroll = true
}) => {
  const { isFullscreen, toggleFullscreen } = useFullscreen({
    onEnter,
    onExit,
    escKey,
    preventScroll
  });

  const fullscreenStyles: React.CSSProperties = isFullscreen
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        backgroundColor: 'white',
        padding: '20px',
        boxSizing: 'border-box',
        ...style
      }
    : style;

  return (
    <div className={className} style={fullscreenStyles}>
      {children && children({ isFullscreen, toggleFullscreen })}
    </div>
  );
};

// 导出 Hook 供外部使用
export { useFullscreen };
