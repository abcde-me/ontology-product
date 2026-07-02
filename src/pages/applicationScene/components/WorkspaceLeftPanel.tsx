import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from '../index.module.scss';

const DEFAULT_RULES_HEIGHT = 120;
const MIN_RULES_HEIGHT = 84;
const MAX_RULES_HEIGHT = 360;

interface WorkspaceLeftPanelProps {
  graph: React.ReactNode;
  rules: React.ReactNode;
}

export default function WorkspaceLeftPanel({
  graph,
  rules
}: WorkspaceLeftPanelProps) {
  const [rulesHeight, setRulesHeight] = useState(DEFAULT_RULES_HEIGHT);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const startHeightRef = useRef(DEFAULT_RULES_HEIGHT);

  const clampRulesHeight = useCallback((nextHeight: number) => {
    const containerHeight = containerRef.current?.clientHeight ?? 0;
    const maxHeight = containerHeight
      ? Math.min(MAX_RULES_HEIGHT, Math.floor(containerHeight * 0.65))
      : MAX_RULES_HEIGHT;

    return Math.min(maxHeight, Math.max(MIN_RULES_HEIGHT, nextHeight));
  }, []);

  const handleResizeStart = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      startYRef.current = event.clientY;
      startHeightRef.current = rulesHeight;
      setIsDragging(true);
    },
    [rulesHeight]
  );

  useEffect(() => {
    if (!isDragging) {
      return undefined;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const deltaY = startYRef.current - event.clientY;
      setRulesHeight(clampRulesHeight(startHeightRef.current + deltaY));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const resetDragStyles = () => {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('blur', resetDragStyles);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'row-resize';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('blur', resetDragStyles);
      resetDragStyles();
    };
  }, [clampRulesHeight, isDragging]);

  return (
    <div ref={containerRef} className={styles['workspace-left']}>
      <div className={styles['graph-section-wrap']}>{graph}</div>
      <div
        className={styles['rules-resize-handle']}
        role="separator"
        aria-orientation="horizontal"
        aria-label="调整规则管理区域高度"
        onMouseDown={handleResizeStart}
      />
      <div className={styles['rules-section']} style={{ height: rulesHeight }}>
        {rules}
      </div>
    </div>
  );
}
