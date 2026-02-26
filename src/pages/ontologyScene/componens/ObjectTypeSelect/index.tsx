import React, { useCallback, useEffect, useState } from 'react';
import { Select } from '@arco-design/web-react';
import { EllipsisPopover } from '@ceai-front/arco-material';
import { listOntologyObjectType } from '@/api/ontologySceneLibrary/objectType';
import { ObjectType } from '@/types/objectType';
import { OBJECT_TYPE_ICON_OPTIONS } from '@/pages/ontologyScene/common/constants';
import styles from './index.module.scss';

export interface ObjectTypeSelectProps {
  /** 当前选中的对象类型ID */
  value?: number;
  /** 值变化回调 */
  onChange?: (value: number | undefined, option?: ObjectType) => void;
  /** 占位符 */
  placeholder?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 本体模型ID，用于筛选 */
  ontologyModelID?: number;
  /** 是否允许清空 */
  allowClear?: boolean;
  /** 标签文本 */
  label?: string;
}

/**
 * 对象类型下拉选择组件
 * 支持图标、名称、ID、描述的展示
 */
const ObjectTypeSelect: React.FC<ObjectTypeSelectProps> = ({
  value,
  onChange,
  placeholder = '请选择对象类型',
  disabled = false,
  className = '',
  ontologyModelID,
  allowClear = true,
  label = ''
}) => {
  const [loading, setLoading] = useState(false);
  const [objectTypeList, setObjectTypeList] = useState<ObjectType[]>([]);

  // 获取对象类型列表
  const fetchObjectTypeList = useCallback(async () => {
    setLoading(true);
    try {
      const response = await listOntologyObjectType({
        ontologyModelID,
        pageNo: 1,
        // todo 参数太大会报错，先这么着
        pageSize: 100 // 获取所有数据
      });
      if (response.status === 200 && response.data) {
        setObjectTypeList(response.data.result || []);
      }
    } catch (error) {
      console.error('获取对象类型列表失败:', error);
    } finally {
      setLoading(false);
    }
  }, [ontologyModelID]);

  useEffect(() => {
    fetchObjectTypeList();
  }, [fetchObjectTypeList]);

  // 根据 icon 字段获取图标组件
  const getIconComponent = (iconValue?: string) => {
    const iconOption = iconValue
      ? OBJECT_TYPE_ICON_OPTIONS.find((option) => option.value === iconValue)
      : null;
    return iconOption?.icon ?? OBJECT_TYPE_ICON_OPTIONS[0]?.icon;
  };

  // 渲染下拉选项
  const renderOption = (option: ObjectType) => {
    const IconComponent = getIconComponent(option.icon);

    return (
      <div className="flex cursor-pointer items-center gap-[8px] px-[12px] py-[8px] transition-colors hover:bg-[#F2F8FF]">
        <div className="flex h-[36px] w-[36px] flex-shrink-0 items-center justify-center">
          <IconComponent className="h-[36px] w-[36px]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-[4px] flex items-center gap-[8px]">
            <EllipsisPopover
              preferTypography
              value={option.name || '-'}
              className="text-[14px] leading-[22px] text-[var(--color-text-1)]"
            />
            <span className="flex-shrink-0 text-[14px] leading-[22px] text-[var(--color-text-1)]">
              (id: {option.id})
            </span>
          </div>
          <EllipsisPopover
            preferTypography
            value={option.description || '描述说明文案'}
            className="text-[12px] leading-[18px] text-[var(--color-text-4)]"
          />
        </div>
      </div>
    );
  };

  // 处理选择变化
  const handleChange = (val: number | undefined) => {
    const selected = val
      ? objectTypeList.find((item) => item.id === val)
      : undefined;
    onChange?.(val, selected);
  };

  return (
    <div className={`flex flex-col ${label ? 'gap-2' : ''} ${className}`}>
      {label && (
        <label className="text-[14px] font-[400] leading-[22px] text-[#0F131F]">
          {label}
        </label>
      )}
      <Select
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        allowClear={allowClear}
        loading={loading}
        showSearch
        filterOption={(inputValue, option: any) => {
          const optionValue = option?.value ?? option;
          const item = objectTypeList.find((obj) => obj.id === optionValue);
          if (!item) return false;
          const searchText = inputValue.toLowerCase();
          return (
            item.name?.toLowerCase().includes(searchText) ||
            item.description?.toLowerCase().includes(searchText) ||
            String(item.id).includes(searchText)
          );
        }}
        renderFormat={(option, value) => {
          if (!value || !option) return null;
          const item = objectTypeList.find((obj) => obj.id === value);
          if (!item) return null;

          const IconComponent = getIconComponent(item.icon);

          return (
            <div className="flex items-center gap-2">
              {/* 左侧图标 */}
              <div className="flex h-[24px] w-[24px] flex-shrink-0 items-center justify-center rounded">
                <IconComponent className="h-[24px] w-[24px]" />
              </div>
              {/* 右侧名称 */}
              <EllipsisPopover
                preferTypography
                value={item.name || '-'}
                className="text-[14px] leading-[30px] text-[var(--color-text-1)]"
              />
            </div>
          );
        }}
        dropdownMenuClassName={styles['object-type-select-dropdown']}
        className="object-type-select"
      >
        {objectTypeList.map((item) => (
          <Select.Option key={item.id} value={item.id}>
            {renderOption(item)}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};

export default ObjectTypeSelect;
