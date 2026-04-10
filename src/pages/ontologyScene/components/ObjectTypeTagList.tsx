import React, { useRef } from 'react';
import { Popover } from '@arco-design/web-react';
import ObjectTypeTag, { ObjectTypeTagProps } from './ObjectTypeTag';

export interface ObjectTypeTagListProps {
  /** 对象类型标签列表 */
  tags: ObjectTypeTagProps[];
  /** 自定义类名 */
  className?: string;
}

/**
 * 对象类型标签列表组件
 * 当标签数量 >= 2 时，第二个位置显示剩余个数，hover 时显示剩余标签
 */
const ObjectTypeTagList: React.FC<ObjectTypeTagListProps> = ({
  tags,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // 如果标签数量小于 2，直接显示所有标签
  if (tags.length <= 2) {
    return (
      <div className={`flex flex-wrap items-center gap-[4px] ${className}`}>
        {tags.map((tag, index) => (
          <ObjectTypeTag key={index} {...tag} />
        ))}
      </div>
    );
  }

  // 第一个标签
  const firstTag = tags[0];
  // 剩余的标签
  const remainingTags = tags.slice(1);
  const remainingCount = remainingTags.length;

  // Popover 内容：显示剩余的标签
  const popoverContent = (
    <div className="flex flex-wrap gap-[4px] p-[4px]">
      {remainingTags.map((tag, index) => (
        <ObjectTypeTag key={index} {...tag} />
      ))}
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={`flex flex-wrap items-center gap-[4px] ${className}`}
    >
      {/* 第一个标签 */}
      <ObjectTypeTag {...firstTag} />

      {/* 第二个位置：显示剩余个数，hover 时显示 popover */}
      <Popover trigger="hover" content={popoverContent} position="top">
        <div className="inline-flex h-[26px] min-w-0 cursor-pointer items-center justify-center rounded border border-[#EBEEF5] bg-[#F5F7FC] px-[4px]">
          <span className="text-[14px] leading-[26px] text-[var(--color-text-1)]">
            +{remainingCount}
          </span>
        </div>
      </Popover>
    </div>
  );
};

export default ObjectTypeTagList;
