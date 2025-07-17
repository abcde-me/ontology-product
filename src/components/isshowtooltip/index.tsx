import React, { useRef, useState, useEffect } from 'react';
import { Tooltip } from '@arco-design/web-react';

interface TooltipOnOverflowProps {
  /** 要显示的文本内容 */
  content: string;
  /** 容器宽度，可以是数字（px）或字符串（如 '100%', '200px' 等） */
  width?: number | string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 自定义类名 */
  className?: string;
  /** Tooltip 位置 */
  tooltipPosition?:
    | 'top'
    | 'tl'
    | 'tr'
    | 'bottom'
    | 'bl'
    | 'br'
    | 'left'
    | 'lt'
    | 'lb'
    | 'right'
    | 'rt'
    | 'rb';
  /** 是否启用多行模式 */
  multiline?: boolean;
  /** 多行模式下显示的行数 */
  lineClamp?: number;
  /** Tooltip 自定义样式 */
  tooltipStyle?: React.CSSProperties;
}

const TooltipOnOverflow: React.FC<TooltipOnOverflowProps> = ({
  content,
  width,
  style,
  className,
  tooltipPosition = 'top',
  multiline = false,
  lineClamp = 2,
  tooltipStyle
}) => {
  const textRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (textRef.current) {
        const element = textRef.current;
        // 根据模式检查溢出
        const hasOverflow = multiline
          ? element.scrollHeight > element.clientHeight
          : element.scrollWidth > element.clientWidth;
        setIsOverflowing(hasOverflow);
      }
    };

    // 延迟执行以确保 DOM 完全渲染
    const timer = setTimeout(checkOverflow, 50);

    // 监听窗口大小变化
    window.addEventListener('resize', checkOverflow);

    // 使用 ResizeObserver 监听元素尺寸变化
    let resizeObserver: ResizeObserver | null = null;
    if (textRef.current && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(checkOverflow);
      resizeObserver.observe(textRef.current);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkOverflow);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [content, width, multiline]);

  // 合并样式
  const mergedStyle: React.CSSProperties = multiline
    ? {
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: lineClamp,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        wordBreak: 'break-all',
        ...(width !== undefined && { width }),
        ...style
      }
    : {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        ...(width !== undefined && { width }),
        ...style
      };

  const textElement = (
    <div ref={textRef} className={className} style={mergedStyle}>
      {content || '-'}
    </div>
  );

  // 只在溢出时显示 Tooltip
  return isOverflowing ? (
    <Tooltip content={content} position={tooltipPosition} style={tooltipStyle}>
      {textElement}
    </Tooltip>
  ) : (
    textElement
  );
};

export default TooltipOnOverflow;
