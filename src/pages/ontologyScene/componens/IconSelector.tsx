import React, { useState } from 'react';
import { Trigger } from '@arco-design/web-react';
import { IconDown } from '@arco-design/web-react/icon';

export interface IconOption {
  value: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface IconSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  options: IconOption[];
  defaultIcon?: string; // 默认图标值
}

const IconSelector: React.FC<IconSelectorProps> = ({
  value,
  onChange,
  options,
  defaultIcon
}) => {
  const [iconDropdownVisible, setIconDropdownVisible] = useState(false);

  const selectedIconValue = value || defaultIcon || options[0]?.value;
  const selectedIconOption =
    options.find((opt) => opt.value === selectedIconValue) || options[0];

  const handleIconSelect = (iconValue: string) => {
    onChange?.(iconValue);
    setIconDropdownVisible(false);
  };

  return (
    <Trigger
      popupVisible={iconDropdownVisible}
      onVisibleChange={setIconDropdownVisible}
      popup={() => (
        <div
          style={{
            background: '#fff',
            borderRadius: 4,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            padding: 12,
            width: 200
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '4px'
            }}
          >
            {options.map((option) => {
              const IconComponent = option.icon ?? options[0].icon;
              return (
                <div
                  key={option.value}
                  onClick={() => handleIconSelect(option.value)}
                  style={{
                    width: 56,
                    height: 56,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    borderRadius: 4,
                    border:
                      selectedIconValue === option.value
                        ? '1px solid #165dff'
                        : '1px solid transparent',
                    backgroundColor:
                      selectedIconValue === option.value
                        ? '#f0f5ff'
                        : 'transparent',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedIconValue !== option.value) {
                      e.currentTarget.style.backgroundColor = '#f7f8fa';
                      e.currentTarget.style.borderColor = '#e5e6eb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedIconValue !== option.value) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.borderColor = 'transparent';
                    }
                  }}
                >
                  <IconComponent
                    style={{
                      width: 32,
                      height: 32
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
      trigger="click"
      position="bl"
    >
      <div
        className="flex h-[56px] w-[72px] items-center justify-between gap-[4px]"
        style={{
          padding: '0 4px',
          cursor: 'pointer',
          transition: 'border-color 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#165dff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#d9d9d9';
        }}
        onClick={() => setIconDropdownVisible(!iconDropdownVisible)}
      >
        <div className="flex h-[56px] w-[56px] items-center justify-center rounded-[4px] bg-[#f0f5ff]">
          {selectedIconOption && (
            <selectedIconOption.icon style={{ width: 32, height: 32 }} />
          )}
        </div>
        <IconDown
          style={{
            fontSize: 12,
            color: '#86909c',
            transform: iconDropdownVisible ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s'
          }}
        />
      </div>
    </Trigger>
  );
};

export default IconSelector;
