import React from 'react';
import { EllipsisPopover } from './';
import { OBJECT_TYPE_ICON_OPTIONS } from '@/pages/ontologyScene/common/constants';

export interface ObjectTypeTagProps {
  showIcon?: boolean;
  /** 对象类型图标值 */
  ontologyObjectTypeIcon?: string;
  /** 对象类型名称 */
  ontologyObjectTypeName: string;
  /** 对象类型ID */
  ontologyObjectTypeId?: string | number;
  /** 点击事件 */
  onClick?: () => void;
  /** 自定义类名 */
  className?: string;
  /** 悬浮类名 */
  hoverClassName?: string;
  /** 列表场景展示完整名称，不截断 */
  showFullName?: boolean;
}

/**
 * 对象类型标签组件
 * 用于展示对象类型信息，包含图标和名称
 */
const ObjectTypeTag: React.FC<ObjectTypeTagProps> = ({
  ontologyObjectTypeIcon,
  ontologyObjectTypeName,
  ontologyObjectTypeId,
  onClick,
  className = '',
  hoverClassName = 'hover-blue',
  showIcon = true,
  showFullName = false
}) => {
  // 根据 icon 字段匹配对应的图标
  const iconOption = ontologyObjectTypeIcon
    ? OBJECT_TYPE_ICON_OPTIONS.find(
        (option) => option.value === ontologyObjectTypeIcon
      )
    : null;
  const IconComponent = iconOption?.icon ?? OBJECT_TYPE_ICON_OPTIONS[0].icon;

  const objTypeName = ontologyObjectTypeName || '全局行为';
  return (
    <div
      className={`object-type-tag inline-flex h-[26px] items-center gap-[4px] rounded border border-[#EBEEF5] bg-[#F5F7FC] px-[4px] ${
        showFullName ? 'max-w-none' : 'min-w-0 max-w-[110px] overflow-hidden'
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {/* 图标区域 */}
      {objTypeName !== '全局行为' && (
        <div className="object-type-tag-icon flex h-[12px] w-[12px] flex-shrink-0 items-center justify-center">
          <IconComponent className="h-[100%] w-[100%] text-white" />
        </div>
      )}
      {/* 名称区域 */}
      <div
        className={`object-type-tag-name ${
          showFullName ? 'whitespace-nowrap' : 'min-w-0 flex-shrink'
        }`}
      >
        {showFullName ? (
          <span
            className={`text-[14px] leading-[26px] text-[var(--color-text-1)] ${
              onClick ? hoverClassName : ''
            }`}
          >
            {objTypeName}
          </span>
        ) : (
          <EllipsisPopover
            value={objTypeName}
            className={`text-[14px] leading-[26px] text-[var(--color-text-1)] ${
              onClick ? `${hoverClassName}` : ''
            }`}
          />
        )}
      </div>
    </div>
  );
};

export default ObjectTypeTag;
