import React from 'react';
import { Popover } from '@arco-design/web-react';
import { useEffect, useRef, useState } from 'react';

export const OverflowTooltip = ({ children, width = 200, styles }) => {
  const ref = useRef<any>(null);
  const [isOverflowed, setIsOverflowed] = useState(false);

  useEffect(() => {
    if (ref.current) {
      setIsOverflowed(ref.current.scrollWidth > ref.current.clientWidth);
    }
  }, [children]);

  return (
    <div
      ref={ref}
      style={{
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        width: `${width}px`
      }}
    >
      <Popover
        title={children}
        position="tl"
        disabled={isOverflowed ? false : true}
      >
        <span className={`${styles}`}>{children}</span>
      </Popover>
    </div>
  );
};

// 使用示例
{
  /* <OverflowTooltip width={150} children={展示的内容}>
    这段文字会根据宽度自动判断是否显示 Tooltip
</OverflowTooltip> */
}
