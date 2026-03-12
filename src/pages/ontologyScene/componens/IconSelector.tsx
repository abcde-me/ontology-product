import React, { useState, useEffect } from 'react';
import { Trigger } from '@arco-design/web-react';
import { IconDown } from '@arco-design/web-react/icon';

export interface IconOption {
  value: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>> | string;
}

interface IconSelectorProps {
  initialValue?: string;
  onChange?: (value: string) => void;
  options: IconOption[];
}

const IconSelector: React.FC<IconSelectorProps> = ({
  initialValue,
  onChange,
  options
}) => {
  const [iconDropdownVisible, setIconDropdownVisible] = useState(false);

  const getSelectedIconValue = (
    value: string | undefined,
    iconOptions: IconOption[]
  ): string | undefined => {
    if (value) {
      const existsInOptions = iconOptions.some((opt) => opt.value === value);
      if (existsInOptions) {
        return value;
      }
      return iconOptions[0]?.value;
    }
    const randomIndex = Math.floor(Math.random() * iconOptions.length);
    return iconOptions[randomIndex]?.value;
  };

  const [selectedIconValue, setSelectedIconValue] = useState<
    string | undefined
  >();
  const [selectedIconOption, setSelectedIconOption] = useState<
    IconOption | undefined
  >();

  useEffect(() => {
    const newValue = getSelectedIconValue(initialValue, options);
    setSelectedIconValue(newValue);
    setSelectedIconOption(
      options.find((opt) => opt.value === newValue) || options[0]
    );
  }, [initialValue, options]);

  const handleIconSelect = (iconValue: string) => {
    setSelectedIconValue(iconValue);
    setSelectedIconOption(
      options.find((opt) => opt.value === iconValue) || options[0]
    );
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
            boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.10)',
            padding: 16
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '8px'
            }}
          >
            {options.map((option) => {
              const iconSource = option.icon ?? options[0].icon;
              return (
                <div
                  key={option.value}
                  onClick={() => handleIconSelect(option.value)}
                  style={{
                    width: 49,
                    height: 49,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    borderRadius: 4,
                    border:
                      selectedIconValue === option.value
                        ? '1px solid rgba(var(--primary-6))'
                        : '1px solid var(--color-border-2)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedIconValue !== option.value) {
                      e.currentTarget.style.backgroundColor = '#f7f8fa';
                      e.currentTarget.style.borderColor =
                        'rgba(var(--primary-6))';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedIconValue !== option.value) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.borderColor =
                        'var(--color-border-2)';
                    }
                  }}
                >
                  {typeof iconSource === 'string' ? (
                    <img
                      src={iconSource}
                      alt=""
                      style={{
                        width: 51,
                        height: 51,
                        objectFit: 'cover'
                      }}
                    />
                  ) : iconSource ? (
                    React.createElement(iconSource, {
                      style: { width: 51, height: 51 }
                    })
                  ) : null}
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
        className="flex h-[56px] w-[64px] items-center justify-between gap-[4px]"
        style={{
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
        <div className="flex h-[49px] w-[49px] items-center justify-center rounded-[4px] bg-[#f0f5ff]">
          {selectedIconOption &&
            (typeof selectedIconOption.icon === 'string' ? (
              <img
                src={selectedIconOption.icon}
                alt=""
                style={{ width: 49, height: 49, objectFit: 'contain' }}
              />
            ) : (
              <selectedIconOption.icon style={{ width: 49, height: 49 }} />
            ))}
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
