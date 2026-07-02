import React, { useCallback, useEffect, useState } from 'react';
import { Popover, Select, SelectProps, Tooltip } from '@arco-design/web-react';
import { GlobalTooltip } from '@ceai-front/arco-material';
import { listOntologyObjectType } from '@/api/ontologySceneLibrary/objectType';
import { ObjectType } from '@/types/objectType';
import { OBJECT_TYPE_ICON_OPTIONS } from '@/pages/ontologyScene/common/constants';
import styles from './index.module.scss';
import { SyncStatus } from '@/types/graphApi';
import { isNil } from 'lodash-es';
import { EllipsisPopover } from '@/pages/ontologyScene/components';

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
  /** 下拉菜单挂载的容器 */
  getPopupContainer?: (node: HTMLElement) => HTMLElement;
  /** 是否显示全部 */
  showAll?: boolean;
  /** 下拉中排除的对象类型 id */
  excludeIds?: number[];
  primaryKey?: keyof ObjectType;
  selectProps?: Partial<SelectProps>;
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
  label = '',
  getPopupContainer,
  showAll = false,
  excludeIds,
  primaryKey = 'id',
  selectProps = {}
}) => {
  const [loading, setLoading] = useState(false);
  const [objectTypeList, setObjectTypeList] = useState<ObjectType[]>([]);

  // 获取对象类型列表
  const fetchObjectTypeList = useCallback(async () => {
    setLoading(true);
    try {
      const response = await listOntologyObjectType({
        ontologyModelID,
        pageNo: -1,
        // todo 参数太大会报错，先这么着
        pageSize: -1 // 获取所有数据
      });
      if (response.status === 200 && response.data) {
        const objectTypes = response.data.result || [];
        if (showAll) {
          objectTypes.unshift({
            syncStatus: SyncStatus.SUCCESS,
            id: -1,
            icon: 'object-type-1',
            name: '全局行为',
            code: '-1',
            description: '全局行为'
          });
        }
        setObjectTypeList(objectTypes);
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

    const isGlobal = option.id !== -1;
    return (
      <div
        className={`flex ${isGlobal ? 'h-[60px]' : ''} cursor-pointer items-center gap-[8px] overflow-hidden px-[12px] py-[8px] transition-colors hover:bg-[#F2F8FF]`}
      >
        {isGlobal && (
          <div className="flex h-[36px] w-[36px] flex-shrink-0 items-center justify-center">
            <IconComponent className="h-[36px] w-[36px]" />
          </div>
        )}
        <div
          className={`flex ${isGlobal ? 'h-[44px]' : ''} min-w-0 flex-1 flex-col justify-center gap-1`}
        >
          <div className="nowrap flex h-[22px] flex-shrink-0 items-center overflow-hidden">
            <EllipsisPopover
              value={option.name}
              className="primary-text w-max leading-[22px]"
              wrapperClassName="min-w-0 leading-[22px] flex items-center"
            />
            {!isNil(option.code) && option.code !== '-1' && (
              <div className="primary-text flex h-[22px] min-w-[60px] flex-1 flex-shrink-0 items-center text-[14px] leading-[22px] text-[var(--color-text-1)]">
                <div>(id:</div>
                <EllipsisPopover
                  value={option.code}
                  className="leading-[22px]"
                  wrapperClassName="min-w-0 leading-[22px] flex items-center"
                />
                <div>)</div>
              </div>
            )}
          </div>
          {option.id > 0 && (
            <EllipsisPopover
              value={option.description || '-'}
              className="text-[12px] leading-[18px] text-[var(--color-text-4)]"
              wrapperClassName={'h-full leading-[18px]'}
            />
          )}
        </div>
      </div>
    );
  };

  // 处理选择变化
  const handleChange = (val: number | undefined) => {
    const selected = val
      ? objectTypeList.find((item) => item[primaryKey] === val)
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
        getPopupContainer={getPopupContainer}
        filterOption={(inputValue, option: any) => {
          // 如果没有输入搜索文本，显示所有选项
          if (!inputValue) return true;

          // 从 option 中获取对象类型 ID
          const optionValue = option?.props?.value ?? option;
          const item = objectTypeList.find(
            (obj) => obj[primaryKey] === optionValue
          );

          // 如果找不到对应的对象类型，不显示该选项
          if (!item) return false;

          // 将搜索文本转为小写进行匹配
          const searchText = inputValue.toLowerCase().trim();

          // 匹配对象类型的名称、描述或 ID
          const nameMatch =
            item.name?.toLowerCase().includes(searchText) ?? false;
          const codeMatch =
            item.code?.toLowerCase().includes(searchText) ?? false;
          const descriptionMatch =
            item.description?.toLowerCase().includes(searchText) ?? false;
          const idMatch = String(item.id).includes(searchText);

          return nameMatch || codeMatch || descriptionMatch || idMatch;
        }}
        renderFormat={(option, value) => {
          if (!value || !option) return null;
          const item = objectTypeList.find((obj) => obj[primaryKey] === value);
          if (!item) return null;

          const IconComponent = getIconComponent(item.icon);

          return (
            <div className="flex items-center gap-2">
              {/* 左侧图标 */}
              {item.id !== -1 && (
                <div className="flex h-[24px] w-[24px] flex-shrink-0 items-center justify-center rounded">
                  <IconComponent className="h-[24px] w-[24px]" />
                </div>
              )}
              {/* 右侧名称 */}
              <GlobalTooltip.Ellipsis
                // preferTypography
                text={item.name || '-'}
                className="text-[14px] leading-[30px] text-[var(--color-text-1)]"
              />
            </div>
          );
        }}
        dropdownMenuClassName={styles['object-type-select-dropdown']}
        className="object-type-select"
        {...selectProps}
        triggerProps={{
          updateOnScroll: true,
          ...selectProps?.triggerProps
        }}
      >
        {objectTypeList
          .filter((item) => !excludeIds?.includes(item.id))
          .map((item) => (
            <Select.Option key={item.id} value={item[primaryKey] as any}>
              {renderOption(item)}
            </Select.Option>
          ))}
      </Select>
    </div>
  );
};

export default ObjectTypeSelect;
