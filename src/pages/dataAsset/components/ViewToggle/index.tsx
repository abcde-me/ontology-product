import React from 'react';
import { IconApps, IconMenu } from '@arco-design/web-react/icon';

export enum ViewType {
  /** 卡片视图 */
  CARD = 'card',
  /** 列表视图 */
  LIST = 'list'
}

export interface ViewToggleProps {
  /** 当前选中的视图类型 */
  value: ViewType;
  /** 视图切换回调 */
  onChange?: (viewType: ViewType) => void;
  /** 自定义类名 */
  className?: string;
}

export default function ViewToggle({
  value,
  onChange,
  className = ''
}: ViewToggleProps) {
  const handleChange = (newValue: ViewType) => {
    if (newValue !== value) {
      onChange?.(newValue);
    }
  };

  const selectedView = value;

  return (
    <div className={'flex items-center ' + className}>
      <button
        type="button"
        onClick={() => handleChange(ViewType.CARD)}
        className={
          'flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-bl-[4px] rounded-tl-[4px] border bg-white ' +
          (selectedView === ViewType.CARD
            ? 'border-[rgba(var(--primary-6))] text-[rgba(var(--primary-6))]'
            : 'border-[var(--color-border-2)]')
        }
      >
        <IconApps
          className={
            'text-[22px] ' +
            (selectedView === 'card' ? 'text-[var(--primary-6)]' : '')
          }
        />
      </button>
      <button
        type="button"
        onClick={() => handleChange(ViewType.LIST)}
        className={
          'flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-br-[4px] rounded-tr-[4px] border bg-white ' +
          (selectedView === ViewType.LIST
            ? 'border-[rgba(var(--primary-6))] text-[rgba(var(--primary-6))]'
            : 'border-[var(--color-border-2)]')
        }
      >
        <IconMenu
          className={
            'text-[22px] ' +
            (selectedView === 'list' ? 'text-[var(--primary-6)]' : '')
          }
        />
      </button>
    </div>
  );
}
