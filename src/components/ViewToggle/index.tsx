import React from 'react';
import { IconApps } from '@arco-design/web-react/icon';
import IconMenu from './assets/list-icon.svg';

export enum ViewType {
  /** 卡片视图 */
  CARD = 'card',
  /** 列表视图 */
  LIST = 'list'
}

export interface ViewToggleProps<TViewType = ViewType> {
  /** 当前选中的视图类型 */
  value: TViewType;
  /** 视图切换回调 */
  onChange?: (viewType: TViewType) => void;
  /** 自定义类名 */
  className?: string;
  /** 第一个视图类型 */
  firstViewType?: TViewType;
  /** 第二个视图类型 */
  secondViewType?: TViewType;
  /** 第一个视图的图标组件，默认为 IconApps */
  FirstIcon?: React.ComponentType<{ className?: string }>;
  /** 第二个视图的图标组件，默认为 IconMenu */
  SecondIcon?: React.ComponentType<{ className?: string }>;
  /** 图标大小，默认为 '16px' */
  iconSize?: string;
  /** 背景色配置：'default' 使用 bg-[#EEF6FF]，'light' 使用 bg-[#fff] */
  variant?: 'default' | 'light';
}

export default function ViewToggle<TViewType extends string = string>({
  value,
  onChange,
  className = '',
  firstViewType = ViewType.CARD as TViewType,
  secondViewType = ViewType.LIST as TViewType,
  FirstIcon,
  SecondIcon,
  iconSize = '16px',
  variant = 'light'
}: ViewToggleProps<TViewType>) {
  const handleChange = (newValue: TViewType) => {
    if (newValue !== value) {
      onChange?.(newValue);
    }
  };

  const selectedView = value;
  const isDefaultVariant = variant === 'default';

  // 默认图标
  const DefaultFirstIcon = FirstIcon || IconApps;
  const DefaultSecondIcon =
    SecondIcon || (IconMenu as React.ComponentType<{ className?: string }>);

  // 根据 variant 决定样式
  const baseBgClass = isDefaultVariant ? 'bg-[#EEF6FF]' : 'bg-[#fff]';
  const selectedBgClass = 'bg-[#EEF6FF]';
  const borderColorClass = isDefaultVariant
    ? 'border-[var(--color-border-1)]'
    : 'border-[var(--color-border-2)]';
  const selectedBorderClass = 'border-[rgba(var(--primary-6))]';
  const selectedTextClass = 'text-[rgba(var(--primary-6))]';
  const iconSizeClass = `text-[${iconSize}]`;

  return (
    <div className={'flex items-center ' + className}>
      <button
        type="button"
        onClick={() => handleChange(firstViewType)}
        className={`flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-bl-[4px] rounded-tl-[4px] border ${
          selectedView === firstViewType
            ? `${selectedBorderClass} ${selectedBgClass} ${selectedTextClass} ${!isDefaultVariant ? 'icon-active' : ''}`
            : `${borderColorClass} ${baseBgClass}`
        }`}
      >
        <DefaultFirstIcon
          className={`${iconSizeClass} ${
            selectedView === firstViewType ? 'text-[var(--primary-6)]' : ''
          }`}
        />
      </button>
      <button
        type="button"
        onClick={() => handleChange(secondViewType)}
        className={`flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-br-[4px] rounded-tr-[4px] border ${
          selectedView === secondViewType
            ? `${selectedBorderClass} ${selectedBgClass} ${selectedTextClass} ${!isDefaultVariant ? 'icon-active' : ''}`
            : `${borderColorClass} ${baseBgClass}`
        }`}
      >
        <DefaultSecondIcon
          className={`${iconSizeClass} ${
            selectedView === secondViewType ? 'text-[var(--primary-6)]' : ''
          }`}
        />
      </button>
    </div>
  );
}
