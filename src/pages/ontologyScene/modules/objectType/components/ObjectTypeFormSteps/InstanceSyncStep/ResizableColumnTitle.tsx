import React, { useCallback, useEffect, useRef } from 'react';
import styles from './KafkaMessageParseSettings.module.scss';

export const MIN_RESIZABLE_COLUMN_WIDTH = 72;

interface ResizableColumnTitleProps {
  columnKey: string;
  width: number;
  onResize: (columnKey: string, width: number) => void;
  children: React.ReactNode;
}

export default function ResizableColumnTitle({
  columnKey,
  width,
  onResize,
  children
}: ResizableColumnTitleProps) {
  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();

      draggingRef.current = true;
      startXRef.current = event.clientX;
      startWidthRef.current = width;
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    },
    [width]
  );

  useEffect(() => {
    const resetDragStyles = () => {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!draggingRef.current) {
        return;
      }

      const nextWidth = Math.max(
        MIN_RESIZABLE_COLUMN_WIDTH,
        startWidthRef.current + event.clientX - startXRef.current
      );
      onResize(columnKey, nextWidth);
    };

    const handleMouseUp = () => {
      if (!draggingRef.current) {
        return;
      }

      draggingRef.current = false;
      resetDragStyles();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('blur', resetDragStyles);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('blur', resetDragStyles);
      resetDragStyles();
    };
  }, [columnKey, onResize]);

  return (
    <div className={styles['ai-rule-test-resizable-column-title']}>
      <div className={styles['ai-rule-test-resizable-column-title-text']}>
        {children}
      </div>
      <span
        className={styles['ai-rule-test-column-resize-handle']}
        onMouseDown={handleMouseDown}
        onClick={(event) => event.stopPropagation()}
      />
    </div>
  );
}
