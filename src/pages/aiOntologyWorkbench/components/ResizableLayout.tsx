import React, { useState, useRef, useCallback } from 'react';

interface ResizableLayoutProps {
  /** 左侧内容 */
  leftContent: React.ReactNode;
  /** 右侧内容 */
  rightContent: React.ReactNode;
  /** 左侧默认宽度 */
  defaultLeftWidth?: number;
  /** 左侧最小宽度 */
  minLeftWidth?: number;
  /** 左侧最大宽度 */
  maxLeftWidth?: number;
}

/**
 * 可拖拽调整宽度的左右布局
 */
const ResizableLayout: React.FC<ResizableLayoutProps> = ({
  leftContent,
  rightContent,
  defaultLeftWidth = 400,
  minLeftWidth = 300,
  maxLeftWidth = 600
}) => {
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
      const newWidth = e.clientX - containerRect.left;

      // 限制宽度范围
      if (newWidth >= minLeftWidth && newWidth <= maxLeftWidth) {
        setLeftWidth(newWidth);
      }
    },
    [isDragging, minLeftWidth, maxLeftWidth]
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
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      // 禁止文本选择
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
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

  return (
    <div ref={containerRef} className="flex h-full w-full overflow-hidden">
      {/* 左侧面板 - 聊天面板 */}
      <div
        className="flex-shrink-0 overflow-hidden"
        style={{ width: `${leftWidth}px` }}
      >
        {leftContent}
      </div>

      {/* 拖拽分隔条 - 紧贴左侧面板 */}
      <div
        className="group relative w-[2px] flex-shrink-0 cursor-col-resize bg-transparent hover:bg-[rgb(var(--primary-6))]"
        onMouseDown={handleMouseDown}
      >
        {/* 拖拽热区 - 扩大点击区域 */}
        <div className="absolute left-[-3px] top-0 h-full w-[8px]" />
      </div>

      {/* 右侧面板 - 图谱 */}
      <div className="flex-1 overflow-hidden">{rightContent}</div>
    </div>
  );
};

export default ResizableLayout;
