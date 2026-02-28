import React, { useState, useEffect } from 'react';
import { Trigger } from '@arco-design/web-react';
import { IconDown } from '@arco-design/web-react/icon';

export interface IconOption {
  value: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>> | string;
  label?: string; // 中文标签
}

interface ObjectTypeIconSelectorProps {
  initialValue?: string;
  onChange?: (value: string) => void;
  options: IconOption[];
}

// 图标选项的中文标签映射
const ICON_LABEL_MAP: Record<string, string> = {
  'object-type-1': '通用1',
  'object-type-2': '通用2',
  'object-type-3': '通用3',
  'object-type-4': '通用4',
  'object-type-5': '通用5',
  'object-type-6': '通用6',
  'object-type-fighter': '战斗机',
  'object-type-drone': '无人机',
  'object-type-camera-point': '摄像点位',
  'object-type-person': '人员',
  'object-type-intelligence': '情报',
  'object-type-civil-aviation': '民航',
  'object-type-coal-mine': '煤矿',
  'object-type-warship': '军舰',
  'object-type-building': '建筑',
  'object-type-location': '地点',
  'object-type-office': '办公'
};

const ObjectTypeIconSelector: React.FC<ObjectTypeIconSelectorProps> = ({
  initialValue,
  onChange,
  options
}) => {
  const [isOpen, setIsOpen] = useState(false);

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

  const getLabel = (value: string) => {
    return ICON_LABEL_MAP[value] || value;
  };

  const handleSelect = (value: string) => {
    setSelectedIconValue(value);
    setSelectedIconOption(
      options.find((opt) => opt.value === value) || options[0]
    );
    onChange?.(value);
    setIsOpen(false);
  };

  const renderIcon = (
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>> | string,
    className = 'w-6 h-6'
  ) => {
    if (typeof icon === 'string') {
      return <img src={icon} alt="" className={className} />;
    } else {
      const IconComponent = icon;
      return <IconComponent className={className} />;
    }
  };

  return (
    <Trigger
      popupVisible={isOpen}
      onVisibleChange={setIsOpen}
      popup={() => (
        <div className="w-[211px] rounded-[4px] bg-white shadow-[0px_4px_12px_0px_#0000001A]">
          <div className="max-h-[168px] overflow-y-auto">
            {options.map((option) => {
              const isSelected = selectedIconValue === option.value;
              const label = option.label || getLabel(option.value);

              return (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`flex h-[36px] cursor-pointer items-center gap-[12px] px-[12px] py-[7px] transition-colors ${isSelected ? 'bg-[#EDF5FF]' : ''} hover:bg-[#EDF5FF]`}
                >
                  <div className="flex h-[20px] w-[20px] flex-shrink-0 items-center justify-center">
                    {renderIcon(option.icon, 'w-[20px] h-[20px]')}
                  </div>
                  <span
                    className={`flex-1 text-[14px] ${
                      isSelected
                        ? 'font-[500] text-[#184FF2]'
                        : 'text-[var(--color-text-1)]'
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      trigger="click"
      position="bl"
    >
      <div className="flex h-14 w-16 cursor-pointer items-center justify-between gap-[4px]">
        <div className="flex h-[48px] w-[48px] items-center justify-center rounded">
          {selectedIconOption &&
            (typeof selectedIconOption.icon === 'string' ? (
              <img
                src={selectedIconOption.icon}
                alt=""
                className="h-12 w-12 object-contain"
              />
            ) : (
              <selectedIconOption.icon className="h-12 w-12" />
            ))}
        </div>
        <IconDown
          className={`h-[12px] w-[12px] text-[var(--color-text-2)] transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>
    </Trigger>
  );
};

export default ObjectTypeIconSelector;
