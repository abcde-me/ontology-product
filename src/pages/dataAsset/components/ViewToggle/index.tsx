import React from 'react';
import { Radio } from '@arco-design/web-react';
import { IconApps, IconMenu } from '@arco-design/web-react/icon';

export type ViewType = 'card' | 'list';

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

  const isCardSelected = value === 'card';
  const isListSelected = value === 'list';
  const borderColor =
    isCardSelected || isListSelected
      ? 'rgb(var(--primary-6))'
      : 'var(--color-border-2)';

  return (
    <div
      className={`inline-flex overflow-hidden rounded bg-white ${className}`}
      style={{
        border: `1px solid ${borderColor}`
      }}
    >
      <Radio.Group
        value={value}
        onChange={handleChange}
        style={{
          display: 'inline-flex',
          border: 'none'
        }}
        className="[&_.arco-radio-button-wrapper]:m-0 [&_.arco-radio-button-wrapper]:p-0 [&_.arco-radio]:hidden"
      >
        {/* 卡片视图选项 */}
        <Radio value="card">
          {({ checked }) => {
            return (
              <div
                className="flex cursor-pointer items-center justify-center px-3 py-1.5 transition-all"
                style={{
                  borderRight: checked
                    ? '1px solid rgb(var(--primary-6))'
                    : '1px solid var(--color-border-2)',
                  borderTopLeftRadius: '4px',
                  borderBottomLeftRadius: '4px'
                }}
              >
                <IconApps
                  className={`text-base ${
                    checked
                      ? 'text-[rgb(var(--primary-6))]'
                      : 'text-[var(--color-text-2)]'
                  }`}
                />
              </div>
            );
          }}
        </Radio>

        {/* 列表视图选项 */}
        <Radio value="list">
          {({ checked }) => {
            return (
              <div
                className="flex cursor-pointer items-center justify-center px-3 py-1.5 transition-all"
                style={{
                  borderTopRightRadius: '4px',
                  borderBottomRightRadius: '4px'
                }}
              >
                <IconMenu
                  className={`text-base ${
                    checked
                      ? 'text-[rgb(var(--primary-6))]'
                      : 'text-[var(--color-text-2)]'
                  }`}
                />
              </div>
            );
          }}
        </Radio>
      </Radio.Group>
    </div>
  );
}
