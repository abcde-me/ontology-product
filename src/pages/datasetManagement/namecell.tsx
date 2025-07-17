import React, { useRef, useState, useEffect } from 'react';
import { Tooltip } from '@arco-design/web-react';
import { Dataset, datasetStatus } from './index';
import styles from './index.module.css';
export const NameCell: React.FC<{
  name: string;
  record: Dataset;
  handleGoToDetail: (id: number) => void;
}> = ({ name, record, handleGoToDetail }) => {
  const textRef = useRef<HTMLSpanElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const checkTextOverflow = () => {
      if (textRef.current) {
        const element = textRef.current;

        // 对于使用 -webkit-line-clamp 的多行截断，检测垂直溢出
        const isVerticalOverflowing =
          element.scrollHeight > element.clientHeight;
        // 也检测水平溢出（防止某些情况）
        const isHorizontalOverflowing =
          element.scrollWidth > element.clientWidth;

        const isOverflowing = isVerticalOverflowing || isHorizontalOverflowing;
        setShowTooltip(isOverflowing);
      }
    };

    // 延迟执行，确保DOM已经渲染完成
    const timer = setTimeout(checkTextOverflow, 100);

    // 监听窗口大小变化，重新检测
    window.addEventListener('resize', checkTextOverflow);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkTextOverflow);
    };
  }, [name]);
  const spanElement = (
    <span
      ref={textRef}
      className={
        record.status === datasetStatus.create_failed ||
        record.status === datasetStatus.creating
          ? styles.datasetNameLink
          : `${styles.datasetNameLink} ${styles.datasetNameHover}`
      }
      onClick={() => {
        record.status === datasetStatus.create_failed ||
        record.status === datasetStatus.creating
          ? null
          : handleGoToDetail(record.id);
      }}
      style={{
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: 2,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        wordBreak: 'break-all',
        fontWeight: '600'
      }}
    >
      {name}
    </span>
  );

  // 只有在文本被截断时才显示Tooltip
  return showTooltip ? (
    <Tooltip content={name} position="tl">
      {spanElement}
    </Tooltip>
  ) : (
    spanElement
  );
};
