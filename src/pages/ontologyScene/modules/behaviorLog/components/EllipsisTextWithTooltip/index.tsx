import React, { useRef, useState, useEffect } from 'react';
import { Tooltip } from '@arco-design/web-react';

interface EllipsisTextWithTooltipProps {
  text?: string;
  value?: string;
  className?: string;
  quiteMessage?: boolean;
}

// 溢出检测组件
const EllipsisTextWithTooltip: React.FC<EllipsisTextWithTooltipProps> = ({
  text,
  value,
  className = '',
  quiteMessage = false
}) => {
  const textRef = useRef<HTMLDivElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // 支持 text 或 value 属性
  const displayText = value || text || '';

  // 检查是否溢出的函数
  const checkOverflow = () => {
    if (quiteMessage) return false;

    const element = textRef.current;
    if (element) {
      return element.scrollWidth > element.clientWidth;
    }
    return false;
  };

  const handleMouseEnter = () => {
    const isOverflow = checkOverflow();
    setShowTooltip(isOverflow);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  // 在内容变化时重新检查溢出状态
  useEffect(() => {
    // 延迟检查，确保 DOM 已经渲染
    const timer = setTimeout(() => {
      if (textRef.current) {
        checkOverflow();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [displayText]);

  return (
    <Tooltip content={displayText} popupVisible={showTooltip && !quiteMessage}>
      <div
        ref={textRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={className}
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '100%'
        }}
      >
        {displayText}
      </div>
    </Tooltip>
  );
};

export default EllipsisTextWithTooltip;
