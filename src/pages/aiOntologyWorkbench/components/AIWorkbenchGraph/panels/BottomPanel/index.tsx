import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useAIWorkbenchGraphStore } from '../../store';
import ObjectPanel from './ObjectPanel';
import LinkPanel from './LinkPanel';
import BehaviorPanel from './BehaviorPanel';

/**
 * 底部面板容器
 * 支持拖拽调整高度
 */
const BottomPanel: React.FC = () => {
  const {
    bottomPanelVisible,
    bottomPanelData,
    bottomPanelHeight,
    setBottomPanelHeight,
    closeBottomPanel
  } = useAIWorkbenchGraphStore();

  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const minHeight = 300;
  const maxHeight = 600;

  /**
   * 开始拖拽
   */
  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  /**
   * 拖拽中
   */
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newHeight = containerRect.bottom - e.clientY;

      // 限制高度范围
      if (newHeight >= minHeight && newHeight <= maxHeight) {
        setBottomPanelHeight(newHeight);
      }
    },
    [isDragging, setBottomPanelHeight]
  );

  /**
   * 结束拖拽
   */
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  /**
   * 监听鼠标事件
   */
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'row-resize';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (!bottomPanelVisible || !bottomPanelData) {
    return null;
  }

  /**
   * 渲染面板内容
   */
  const renderPanelContent = () => {
    switch (bottomPanelData.type) {
      case 'object':
        return <ObjectPanel objectId={bottomPanelData.id} />;
      case 'link':
        return <LinkPanel linkId={bottomPanelData.id} />;
      case 'behavior':
        return <BehaviorPanel behaviorId={bottomPanelData.id} />;
      default:
        return null;
    }
  };

  return (
    <div
      ref={containerRef}
      className="absolute bottom-0 left-0 right-0 z-10 flex flex-col bg-white shadow-[0px_-8px_20px_0px_rgba(0,0,0,0.12)]"
      style={{ height: `${bottomPanelHeight}px` }}
    >
      {/* 拖拽条 */}
      <div
        className="group relative h-[8px] w-full cursor-row-resize"
        onMouseDown={handleMouseDown}
      >
        {/* 拖拽热区 */}
        <div className="absolute inset-0" />
        {/* Hover 提示线 */}
        <div className="absolute left-0 top-[3px] h-[2px] w-full bg-[rgb(var(--primary-6))] opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      {/* 面板内容 */}
      <div className="flex-1 overflow-hidden">{renderPanelContent()}</div>
    </div>
  );
};

export default BottomPanel;
