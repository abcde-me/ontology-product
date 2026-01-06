import React, { useState, useEffect } from 'react';
import {
  Input,
  Button,
  Select,
  DatePicker,
  Popover,
  Checkbox,
  Tooltip,
  Tag,
  TreeSelect,
  InputNumber
} from '@arco-design/web-react';
import {
  IconSearch,
  IconDown,
  IconUp,
  IconSettings,
  IconMinus
} from '@arco-design/web-react/icon';
import { ColumnField } from '@/pages/dataAsset/components/ColumnSettingModal';
import { FieldSearchItem, BaseTag, TagValueItem } from '@/types/dataAssetApi';
import { isDateType, isDateTimeType } from '@/pages/dataAsset/utils/const';
import styles from './index.module.scss';
import dayjs from 'dayjs';
import classNames from 'classnames';

export interface SearchField {
  /** 字段唯一标识 */
  key: string;
  /** 字段显示名称 */
  label: string;
  /** 字段类型: 'input' | 'select' | 'daterange' */
  type: 'input' | 'select' | 'daterange';
  /** 下拉框选项（type为select时必填） */
  options?: Array<{ label: string; value: any }>;
  /** 字段对应的搜索参数key */
  paramKey?: string;
}

export interface SearchAreaProps {
  /** 搜索字段配置列表 */
  fields?: ColumnField[];
  /** 主搜索框的值 */
  mainSearchValue?: string;
  /** 主搜索框占位符 */
  mainSearchPlaceholder?: string;
  /** 主搜索回调 */
  onMainSearch?: (fieldValues: FieldSearchItem[], commonSearch: string) => void;
  /** 字段搜索回调 */
  onFieldSearch?: (
    fieldValues: FieldSearchItem[],
    commonSearch: string
  ) => void;
  /** 重置回调 */
  onReset?: () => void;
  /** 当前选中的元数据类型 */
  activeMetadataType?: string;
  /** 样式类 */
  className?: string;
}

const formatSearchContent = (field: ColumnField, value: any): string[] => {
  if (field.type.includes('date') && Array.isArray(value)) {
    const formattedValues = value
      .filter((item) => item !== undefined && item !== null && item !== '')
      .map((item) => {
        const date = dayjs(item);
        return date.isValid()
          ? date.format('YYYY-MM-DD HH:mm:ss')
          : String(item ?? '');
      });

    const joinedValue = formattedValues.join('_');
    return joinedValue ? [joinedValue] : [];
  }

  const normalizedValues = Array.isArray(value) ? value : [value];
  return normalizedValues
    .filter((item) => item !== undefined && item !== null && item !== '')
    .map((item) => String(item));
};

export default function SearchArea({
  fields = [],
  mainSearchValue = '',
  mainSearchPlaceholder = '请输入搜索内容',
  onMainSearch,
  onFieldSearch,
  onReset,
  activeMetadataType,
  className = ''
}: SearchAreaProps) {
  // 主搜索框的值
  const [mainSearch, setMainSearch] = useState(mainSearchValue);
  // 是否展开字段搜索
  const [isFieldSearchExpanded, setIsFieldSearchExpanded] = useState(false);
  // 字段搜索的值
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  // 已勾选的字段列表（用于字段搜索显示）
  const [checkedFields, setCheckedFields] = useState<Set<string>>(new Set());
  // 设置搜索条件下拉框是否可见
  const [settingsVisible, setSettingsVisible] = useState(false);
  // 设置搜索条件的搜索关键词
  const [settingsSearchKeyword, setSettingsSearchKeyword] = useState('');
  // 设置搜索条件的单位
  const [sizeUnitValue, setSizeUnitValue] = useState('KB');

  useEffect(() => {
    setFieldValues({});
  }, [activeMetadataType]);

  // 初始化：默认勾选所有字段
  useEffect(() => {
    const defaultChecked = new Set(fields.slice(0, 3).map((f) => f.id));
    setCheckedFields(defaultChecked);
  }, [fields]);

  // 处理主搜索（点击搜索图标或按Enter）
  const handleMainSearch = () => {
    onMainSearch?.([], mainSearch);
  };

  // 处理字段值变化
  const handleFieldValueChange = (fieldKey: string, value: any) => {
    setFieldValues((prev) => ({
      ...prev,
      [fieldKey]: value
    }));
  };

  // 处理浮点数范围
  const getFloatRange = (start: number, end: number): string[] | number[] => {
    switch (sizeUnitValue) {
      case 'KB':
        return [Number(start) * 1024, Number(end) * 1024];
      case 'MB':
        return [Number(start) * 1024 * 1024, Number(end) * 1024 * 1024];
      case 'GB':
        return [
          Number(start) * 1024 * 1024 * 1024,
          Number(end) * 1024 * 1024 * 1024
        ];
      case 'TB':
        return [
          Number(start) * 1024 * 1024 * 1024 * 1024,
          Number(end) * 1024 * 1024 * 1024 * 1024
        ];
      case 'PB':
        return [
          Number(start) * 1024 * 1024 * 1024 * 1024 * 1024,
          Number(end) * 1024 * 1024 * 1024 * 1024 * 1024
        ];
      default:
        return [Number(start) * 1024, Number(end) * 1024];
    }
  };

  // 处理查询按钮点击
  const handleQuery = () => {
    // 只传递已勾选字段的值
    const searchParams: Record<string, any> = {};
    const fieldSearch: FieldSearchItem[] = [];
    checkedFields.forEach((fieldKey) => {
      const field = fields.find((f) => f.id === fieldKey);
      if (field) {
        if (field.type === 'int' || field.type === 'float') {
          const newFieldKeyStart = `${fieldKey}_start`;
          const newFieldKeyEnd = `${fieldKey}_end`;
          if (
            fieldValues[newFieldKeyStart] !== undefined &&
            fieldValues[newFieldKeyStart] !== null &&
            fieldValues[newFieldKeyStart] !== '' &&
            fieldValues[newFieldKeyEnd] !== undefined &&
            fieldValues[newFieldKeyEnd] !== null &&
            fieldValues[newFieldKeyEnd] !== ''
          ) {
            fieldSearch.push({
              isEnumAble: field.isEnumAble ?? false,
              nameEn: `${field.id}`,
              type: field.type,
              searchContent:
                field.type === 'float'
                  ? getFloatRange(
                      fieldValues[newFieldKeyStart],
                      fieldValues[newFieldKeyEnd]
                    )
                  : [fieldValues[newFieldKeyStart], fieldValues[newFieldKeyEnd]]
            });
          }
        } else if (
          fieldValues[fieldKey] !== undefined &&
          fieldValues[fieldKey] !== null &&
          fieldValues[fieldKey] !== ''
        ) {
          const paramKey = field.id || fieldKey;
          searchParams[paramKey] = fieldValues[fieldKey];

          fieldSearch.push({
            isEnumAble: field.isEnumAble ?? false,
            nameEn: field.id,
            type: field.type,
            searchContent: formatSearchContent(field, fieldValues[fieldKey])
          });
        }
      }
    });
    onFieldSearch?.(fieldSearch, mainSearch);
  };

  // 处理重置按钮点击
  const handleReset = () => {
    setMainSearch('');
    setFieldValues({});
    onReset?.();
  };

  // 切换字段勾选状态
  const toggleFieldCheck = (fieldKey: string, checked: boolean) => {
    const newChecked = new Set(checkedFields);
    if (checked) {
      newChecked.add(fieldKey);
    } else {
      newChecked.delete(fieldKey);
      // 取消勾选时，清除该字段的值
      setFieldValues((prev) => {
        const newValues = { ...prev };
        delete newValues[fieldKey];
        return newValues;
      });
    }
    setCheckedFields(newChecked);
  };

  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // 如果有搜索关键词，只选中搜索过滤后的字段，并清空之前的字段状态
      if (settingsSearchKeyword) {
        // 重新计算过滤后的字段列表
        const filteredFields = fields.filter((f) =>
          f.nameZh.toLowerCase().includes(settingsSearchKeyword.toLowerCase())
        );
        const filteredFieldIds = filteredFields.map((f) => f.id);
        setCheckedFields(new Set(filteredFieldIds));
        // 清空之前所有字段的值
        setFieldValues({});
      } else {
        // 没有搜索关键词时，选中所有字段
        setCheckedFields(new Set(fields.map((f) => f.id)));
      }
    } else {
      setCheckedFields(new Set());
      // 取消全选时，清空所有字段的值
      setFieldValues({});
    }
  };

  // 是否有字段被勾选
  const hasCheckedFields = checkedFields.size > 0;
  // 筛选出已勾选的字段用于显示
  const visibleFields = fields.filter((f) => checkedFields.has(f.id));
  // 筛选设置搜索条件下拉框中的字段（根据搜索关键词）
  const filteredFieldsForSettings = fields.filter((f) =>
    settingsSearchKeyword
      ? f.nameZh.toLowerCase().includes(settingsSearchKeyword.toLowerCase())
      : true
  );

  // 设置搜索条件的内容
  const settingsContent = (
    <div className="flex flex-col rounded bg-white">
      <div className="mb-[4px]">
        <Input
          placeholder="输入关键词搜索"
          prefix={<IconSearch />}
          value={settingsSearchKeyword}
          onChange={setSettingsSearchKeyword}
          allowClear
        />
      </div>
      <div>
        <div
          className="flex cursor-pointer items-center pb-[7px] pt-[7px] transition-colors hover:bg-[var(--color-fill-2)]"
          onClick={() =>
            handleSelectAll(
              checkedFields.size !== filteredFieldsForSettings.length
            )
          }
        >
          <Checkbox
            checked={
              filteredFieldsForSettings.length > 0 &&
              filteredFieldsForSettings.every((f) => checkedFields.has(f.id))
            }
            indeterminate={
              filteredFieldsForSettings.some((f) => checkedFields.has(f.id)) &&
              !filteredFieldsForSettings.every((f) => checkedFields.has(f.id))
            }
          >
            全选
          </Checkbox>
        </div>
        {filteredFieldsForSettings.map((field) => (
          <div
            key={field.id}
            className="flex cursor-pointer items-center pb-[7px] pt-[7px] transition-colors hover:bg-[var(--color-fill-2)]"
            onClick={() =>
              toggleFieldCheck(field.id, !checkedFields.has(field.id))
            }
          >
            <Checkbox checked={checkedFields.has(field.id)}>
              {field.nameZh}
            </Checkbox>
          </div>
        ))}
        {filteredFieldsForSettings.length === 0 && (
          <div className="px-4 py-2 text-[#86909c]">暂无匹配的字段</div>
        )}
      </div>
    </div>
  );

  // 查询按钮组件（带禁用提示）
  const QueryButton = () => {
    const button = (
      <Button type="primary" disabled={!hasCheckedFields} onClick={handleQuery}>
        查询
      </Button>
    );

    if (!hasCheckedFields) {
      return (
        <Popover
          content={<div>未设置搜索条件</div>}
          position="top"
          trigger="hover"
        >
          {button}
        </Popover>
      );
    }

    return button;
  };

  // 类型守卫函数：判断是否为目标对象类型
  const isLabelValueObj = (
    obj:
      | string
      | number
      | BaseTag
      | { label: string; value: string | number }
      | null
  ): obj is {
    label: string;
    value: string | number;
  } => {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'label' in obj &&
      'value' in obj &&
      typeof obj.label === 'string' &&
      (typeof obj.value === 'string' || typeof obj.value === 'number')
    );
  };

  // 渲染字段搜索输入组件
  const renderFieldInput = (field: ColumnField) => {
    const value = fieldValues[field.id];
    const valueStart = fieldValues[`${field.id}_start`];
    const valueEnd = fieldValues[`${field.id}_end`];
    let fieldType = field.type;

    if (isDateType(field.type)) {
      fieldType = 'date';
    } else if (isDateTimeType(field.type)) {
      fieldType = 'datetime';
    } else if (field.isEnumAble && field.values?.length > 0) {
      fieldType = 'select';
    } else if (field.type === 'float') {
      fieldType = 'float';
    } else if (field.type === 'int') {
      fieldType = 'int';
    } else {
      fieldType = 'string';
    }

    switch (fieldType) {
      case 'string':
        return (
          <Input
            placeholder={`输入关键字搜索`}
            value={value || ''}
            onChange={(val) => handleFieldValueChange(field.id, val)}
            allowClear
          />
        );
      case 'select':
        return (
          <Select
            placeholder={`请选择${field.nameZh}`}
            value={value}
            className={styles['dropdown-select']}
            onChange={(val) => handleFieldValueChange(field.id, val)}
            allowClear
          >
            {field.values.map((opt) => {
              return isLabelValueObj(opt) ? (
                <Select.Option
                  key={String(opt.value)}
                  value={String(opt.value)}
                >
                  {opt.label}
                </Select.Option>
              ) : (
                <Select.Option key={String(opt)} value={String(opt)}>
                  {opt}
                </Select.Option>
              );
            })}
          </Select>
        );
      case 'datetime':
        return (
          <DatePicker.RangePicker
            value={value}
            onChange={(val) => handleFieldValueChange(field.id, val)}
            allowClear
            showTime={{ format: 'HH:mm:ss' }}
            format="YYYY-MM-DD HH:mm:ss"
            placeholder={['开始日期', '结束日期']}
          />
        );
      case 'date':
        return (
          <DatePicker.RangePicker
            value={value}
            onChange={(val) => handleFieldValueChange(field.id, val)}
            allowClear
            format="YYYY-MM-DD"
            placeholder={['开始时间', '结束时间']}
          />
        );
      case 'int':
        return (
          <Input.Group className="flex items-center">
            <InputNumber
              style={{ width: '50%', marginRight: 8 }}
              min={0}
              value={valueStart}
              onChange={(val) =>
                handleFieldValueChange(`${field.id}_start`, val)
              }
            />
            <IconMinus style={{ color: 'var(--color-text-1)' }} />
            <InputNumber
              style={{ width: '50%', marginLeft: 8 }}
              min={0}
              value={valueEnd}
              onChange={(val) => handleFieldValueChange(`${field.id}_end`, val)}
            />
          </Input.Group>
        );
      case 'float':
        return (
          <Input.Group className="flex items-center">
            <InputNumber
              style={{ width: '35%', marginRight: 8 }}
              min={0}
              value={valueStart}
              onChange={(val) =>
                handleFieldValueChange(`${field.id}_start`, val)
              }
            />
            <IconMinus style={{ color: 'var(--color-text-1)' }} />
            <InputNumber
              style={{ width: '35%', marginLeft: 8 }}
              min={0}
              value={valueEnd}
              onChange={(val) => handleFieldValueChange(`${field.id}_end`, val)}
            />
            <Select
              style={{ width: '30%', marginLeft: 8 }}
              defaultValue={sizeUnitValue}
              value={sizeUnitValue}
              options={[
                { label: 'KB', value: 'KB' },
                { label: 'MB', value: 'MB' },
                { label: 'GB', value: 'GB' },
                { label: 'TB', value: 'TB' },
                { label: 'PB', value: 'PB' }
              ]}
              onChange={(val) => setSizeUnitValue(val)}
            />
          </Input.Group>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`${className} ${styles['search-area']}`}>
      <div className="border-b border-[#CBD5E1] py-[24px]">
        {/* 字段搜索列表 */}
        {visibleFields.length > 0 && (
          <div className="mb-[8px] grid grid-cols-3 gap-4">
            {visibleFields.map((field) => {
              return (
                <div key={field.id} className="flex items-center gap-3">
                  <span className="whitespace-nowrap text-sm text-[var(--color-text-1)]">
                    {field.nameZh}:
                  </span>
                  <div className="flex-1">{renderFieldInput(field)}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* 操作按钮区域 */}
        <div className="flex items-center gap-2">
          <QueryButton />
          <Button disabled={!hasCheckedFields} onClick={handleReset}>
            重置
          </Button>
          <Popover
            content={settingsContent}
            trigger="click"
            position="bl"
            style={{ width: '240px', height: '296px' }}
            popupVisible={settingsVisible}
            onVisibleChange={(visible) => {
              setSettingsVisible(visible);
              if (!visible) {
                setSettingsSearchKeyword('');
              }
            }}
          >
            <Button
              type="text"
              className={classNames(
                'ml-auto flex items-center gap-1 px-[0px]',
                styles['settings-button']
              )}
            >
              <IconSettings />
              设置搜索条件
            </Button>
          </Popover>
        </div>
      </div>
    </div>
  );
}
