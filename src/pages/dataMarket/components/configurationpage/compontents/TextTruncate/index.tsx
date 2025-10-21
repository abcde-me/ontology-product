import { Tooltip } from '@arco-design/web-react';
import React, { useEffect, useRef, useState } from 'react';

interface TextTruncateProps {
  // 最大宽度
  maxW?: string;
  // 文本
  text: string;
  //总行数
  clientHeight?: number;
  typeTooltip?;
}

const TextTruncate: React.FC<TextTruncateProps> = ({
  maxW,
  text,
  clientHeight,
  typeTooltip
}) => {
  const [overflow, setOverflow] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  // 检查溢出的函数
  const checkOverflow = (element: HTMLElement | null) => {
    if (element) {
      return element.scrollHeight > element.clientHeight;
    }
    return false;
  };

  // 在 useEffect 中进行溢出检测
  useEffect(() => {
    const element = textRef.current;
    if (!element) return;
    // 每次使用这个组件都会重新刷新所有引入组件的地方-用来判断flex布局-添加文件之后的样式
    setOverflow(checkOverflow(element));

    // 来监听元素尺寸变化
    const resizeObserver = new ResizeObserver(() => {
      setOverflow(checkOverflow(element));
    });

    // 开始观察
    resizeObserver.observe(element);

    // 清理函数
    return () => {
      resizeObserver.disconnect();
    };
  }, [text]);

  return (
    <div
      ref={textRef}
      className=" cursor-pointer"
      style={{
        maxWidth: maxW,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}
    >
      {!typeTooltip ? (
        <>
          {' '}
          {overflow ? (
            <Tooltip content={text} position="top">
              {text}
            </Tooltip>
          ) : (
            <>{text}</>
          )}
        </>
      ) : (
        <div>{text}</div>
      )}
    </div>
  );
};

export default TextTruncate;
