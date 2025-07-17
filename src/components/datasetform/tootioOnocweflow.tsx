import React, { useRef, useState, useEffect } from 'react';
import { Tooltip } from '@arco-design/web-react';

interface TooltipOnOverflowProps {
  text: String;
  style?: React.CSSProperties;
  className?: string;
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
  /** 是否为多行省略模式 */
  multiline?: boolean;
  /** 多行省略时的行数 */
  lineClamp?: number;
  tooltipStyle?: React.CSSProperties;
}

const TooltipOnOverflow: React.FC<TooltipOnOverflowProps> = ({
  text,
  style,
  className,
  tooltipPosition = 'top',
  multiline = false,
  lineClamp = 2,
  tooltipStyle
}) => {
  const textRef = useRef<HTMLDivElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const checkTextOverflow = () => {
      if (textRef.current) {
        const element = textRef.current;

        // 检测是否有文本溢出
        const isOverflowing = multiline
          ? element.scrollHeight > element.clientHeight
          : element.scrollWidth > element.clientWidth;

        setShowTooltip(isOverflowing);
      }
    };

    // 延迟执行，确保DOM已经渲染完成
    const timer = setTimeout(checkTextOverflow, 100);

    // 监听窗口大小变化，重新检测
    window.addEventListener('resize', checkTextOverflow);

    // 使用 ResizeObserver 监听元素尺寸变化
    const resizeObserver = new ResizeObserver(() => {
      checkTextOverflow();
    });

    if (textRef.current) {
      resizeObserver.observe(textRef.current);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkTextOverflow);
      resizeObserver.disconnect();
    };
  }, [text, multiline]);

  const baseStyle: React.CSSProperties = multiline
    ? {
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: lineClamp,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        wordBreak: 'break-all',
        ...style
      }
    : {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        ...style
      };

  const textElement = (
    <div ref={textRef} className={className} style={baseStyle}>
      {text}
    </div>
  );

  // 只有在文本被截断时才显示Tooltip
  return showTooltip ? (
    <Tooltip content={text} position={tooltipPosition} style={tooltipStyle}>
      {textElement}
    </Tooltip>
  ) : (
    textElement
  );
};

export default TooltipOnOverflow;
