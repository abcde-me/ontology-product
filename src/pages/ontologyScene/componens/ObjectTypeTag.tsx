import React from 'react';
import { EllipsisPopover } from '@ceai-front/arco-material';
import { IconFile } from '@arco-design/web-react/icon';
import { OBJECT_TYPE_ICON_OPTIONS } from '@/pages/ontologyScene/common/constants';

export interface ObjectTypeTagProps {
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
  className = ''
}) => {
  // 根据 icon 字段匹配对应的图标
  const iconOption = ontologyObjectTypeIcon
    ? OBJECT_TYPE_ICON_OPTIONS.find(
        (option) => option.value === ontologyObjectTypeIcon
      )
    : null;
  const IconComponent = iconOption?.icon;

  return (
    <div
      className={`inline-flex h-[26px] min-w-0 max-w-[96px] items-center gap-[4px] overflow-hidden rounded border border-[#EBEEF5] bg-[#F5F7FC] px-[4px] ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
    >
      {/* 图标区域 */}
      <div className="flex h-[12px] w-[12px] flex-shrink-0 items-center justify-center">
        {IconComponent ? (
          <IconComponent className="h-[12px] w-[12px] text-white" />
        ) : (
          <IconFile className="h-[12px] w-[12px] text-white" />
        )}
      </div>
      {/* 名称区域 */}
      <div className="min-w-0 flex-shrink-0">
        <EllipsisPopover
          value={ontologyObjectTypeName}
          className="text-[14px] leading-[26px] text-[var(--color-text-1)]"
        />
      </div>
    </div>
  );
};

export default ObjectTypeTag;
