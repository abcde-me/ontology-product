import React from 'react';
import { ICON_OPTIONS } from '@/pages/ontologyScene/common/constants';

/**
 * 根据 icon 值获取对应的图标组件
 * @param icon - 图标值（如 'intelligence-analysis-scene'）
 * @param size - 图标尺寸（默认 20）
 * @returns React 元素
 */
export const getIconComponent = (icon: string, size = 20) => {
  const matchedIcon = ICON_OPTIONS.find((option) => option.value === icon);
  const iconSource = matchedIcon?.icon ?? ICON_OPTIONS[0].icon;

  // 如果是字符串（图片路径），使用 img 标签
  if (typeof iconSource === 'string') {
    return (
      <img
        src={iconSource}
        alt=""
        className="h-full w-full object-contain"
        style={{ width: size, height: size }}
      />
    );
  }

  // 如果是 React 组件（SVG），直接使用组件
  return iconSource
    ? React.createElement(iconSource, { style: { width: size, height: size } })
    : null;
};
