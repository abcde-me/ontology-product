import React, { useState, useEffect } from 'react';
import {
  Input,
  Button,
  Select,
  DatePicker,
  Popover,
  Checkbox
} from '@arco-design/web-react';
import { IconSearch, IconSettings } from '@arco-design/web-react/icon';
import { FieldSearchItem } from '@/api/dataCatalog';
import dayjs from 'dayjs';

export interface SearchField {
  /** 字段唯一标识 */
  key: string;
  /** 字段显示名称 */
  label: string;
  /** 字段类型: 'input' | 'select' | 'daterange' */
  type: string;
  /** 下拉框选项（type为select时必填） */
  options?: Array<{ label: string; value: any }>;
  /** 字段对应的搜索参数key */
  paramKey?: string;
}

export interface SearchAreaProps {
  /** 搜索字段配置列表 */
  fields?: SearchField[];
  /** 字段搜索回调 */
  onFieldSearch?: (fieldValues: FieldSearchItem[]) => void;
  /** 重置回调 */
  onReset?: () => void;
  /** 样式类 */
  className?: string;
}

export default function SearchArea({
  fields = [],
  onFieldSearch,
  onReset,
  className = ''
}: SearchAreaProps) {
  // 字段搜索的值
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  // 已勾选的字段列表（用于字段搜索显示）
  const [checkedFields, setCheckedFields] = useState<Set<string>>(new Set());
  // 设置搜索条件下拉框是否可见
  const [settingsVisible, setSettingsVisible] = useState(false);
  // 设置搜索条件的搜索关键词
  const [settingsSearchKeyword, setSettingsSearchKeyword] = useState('');

  // 初始化：默认勾选前三个字段
  useEffect(() => {
    const defaultCheckedKeys = fields.slice(0, 3).map((f) => f.key);
    const defaultChecked = new Set(defaultCheckedKeys);
    setCheckedFields(defaultChecked);
  }, []);

  // 处理字段值变化
  const handleFieldValueChange = (fieldKey: string, value: any) => {
    setFieldValues((prev) => ({
      ...prev,
      [fieldKey]: value
    }));
  };

  const formatSearchContent = (field: SearchField, value: any): string => {
    if (field.type.includes('date') && Array.isArray(value)) {
      const formattedValues = value
        .filter((item) => item !== undefined && item !== null && item !== '')
        .map((item) => {
          const date = dayjs(item);
          return date.isValid()
            ? date.format('YYYY-MM-DD HH:mm:ss')
            : String(item ?? '');
        });

      return formattedValues.join('_');
    }

    return Array.isArray(value) ? value.join(',') : String(value);
  };

  // 处理查询按钮点击
  const handleQuery = () => {
    // 只传递已勾选字段的值
    // const searchParams: Record<string, any> = {};
    const fieldSearch: FieldSearchItem[] = [];
    checkedFields.forEach((fieldKey) => {
      const field = fields.find((f) => f.key === fieldKey);
      if (
        field &&
        fieldValues[fieldKey] !== undefined &&
        fieldValues[fieldKey] !== null &&
        fieldValues[fieldKey] !== ''
      ) {
        const paramKey = field.paramKey || fieldKey;
        // searchParams[paramKey] = fieldValues[fieldKey];

        fieldSearch.push({
          nameEn: field.key,
          type: field.type,
          queryValue: formatSearchContent(field, fieldValues[fieldKey])
        });
      }
    });
    onFieldSearch?.(fieldSearch);
  };

  // 处理重置按钮点击
  const handleReset = () => {
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
          f.label.toLowerCase().includes(settingsSearchKeyword.toLowerCase())
        );
        const filteredFieldKeys = filteredFields.map((f) => f.key);
        setCheckedFields(new Set(filteredFieldKeys));
        // 清空之前所有字段的值
        setFieldValues({});
      } else {
        // 没有搜索关键词时，选中所有字段
        setCheckedFields(new Set(fields.map((f) => f.key)));
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
  const visibleFields = fields.filter((f) => checkedFields.has(f.key));
  // 筛选设置搜索条件下拉框中的字段（根据搜索关键词）
  const filteredFieldsForSettings = fields.filter((f) =>
    settingsSearchKeyword
      ? f.label.toLowerCase().includes(settingsSearchKeyword.toLowerCase())
      : true
  );

  // 设置搜索条件的内容
  const settingsContent = (
    <div className="flex max-h-[400px] min-w-[240px] max-w-[400px] flex-col rounded bg-white">
      <div className="p-2 pb-1">
        <Input
          placeholder="输入关键词搜索"
          prefix={<IconSearch />}
          value={settingsSearchKeyword}
          onChange={setSettingsSearchKeyword}
          allowClear
        />
      </div>
      <div className="max-h-[300px] overflow-y-auto py-1">
        <div
          className="flex cursor-pointer items-center px-4 py-2 transition-colors hover:bg-[var(--color-fill-2)]"
          onClick={() =>
            handleSelectAll(
              checkedFields.size !== filteredFieldsForSettings.length
            )
          }
        >
          <Checkbox
            checked={
              filteredFieldsForSettings.length > 0 &&
              filteredFieldsForSettings.every((f) => checkedFields.has(f.key))
            }
            indeterminate={
              filteredFieldsForSettings.some((f) => checkedFields.has(f.key)) &&
              !filteredFieldsForSettings.every((f) => checkedFields.has(f.key))
            }
          >
            全选
          </Checkbox>
        </div>
        {filteredFieldsForSettings.map((field) => (
          <div
            key={field.key}
            className="flex cursor-pointer items-center px-4 py-2 transition-colors hover:bg-[var(--color-fill-2)]"
            onClick={() =>
              toggleFieldCheck(field.key, !checkedFields.has(field.key))
            }
          >
            <Checkbox checked={checkedFields.has(field.key)}>
              {field.label}
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

  // 渲染字段搜索输入组件
  const renderFieldInput = (field: SearchField) => {
    const value = fieldValues[field.key];
    let fieldType = field.type;

    if (field.type.includes('datetime') || field.type === 'date') {
      fieldType = 'range';
    } else {
      fieldType = 'input';
    }

    switch (fieldType) {
      case 'input':
        return (
          <Input
            placeholder={`输入关键字搜索`}
            value={value || ''}
            onChange={(val) => handleFieldValueChange(field.key, val)}
            allowClear
          />
        );
      case 'select':
        return (
          <Select
            placeholder={`请选择${field.label}`}
            value={value}
            onChange={(val) => handleFieldValueChange(field.key, val)}
            allowClear
            showSearch
          >
            {field.options?.map((opt) => (
              <Select.Option key={opt.value} value={opt.value}>
                {opt.label}
              </Select.Option>
            ))}
          </Select>
        );
      case 'range':
        return (
          <DatePicker.RangePicker
            value={value}
            onChange={(val) => handleFieldValueChange(field.key, val)}
            allowClear
            showTime={{ format: 'HH:mm:ss' }}
            format="YYYY-MM-DD HH:mm:ss"
            placeholder={['开始日期', '结束日期']}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex max-h-[269px] flex-col ${className}`}>
      {/* 字段搜索区域 */}
      <div className="flex-1 overflow-y-auto">
        {/* 字段搜索列表 */}
        {visibleFields.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-4">
            {visibleFields.map((field) => (
              <div key={field.key} className="flex items-center gap-3">
                <span className="whitespace-nowrap text-sm text-[var(--color-text-1)]">
                  {field.label}:
                </span>
                <div className="min-w-[260px]">{renderFieldInput(field)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 操作按钮区域 */}
      <div className="flex flex-shrink-0 items-center gap-2 border-b border-[#E5E6EB] py-4">
        <QueryButton />
        <Button disabled={!hasCheckedFields} onClick={handleReset}>
          重置
        </Button>
        <Popover
          content={settingsContent}
          trigger="click"
          position="bl"
          popupVisible={settingsVisible}
          onVisibleChange={setSettingsVisible}
        >
          <Button type="text" className="ml-auto flex items-center gap-1">
            <IconSettings />
            设置搜索条件
          </Button>
        </Popover>
      </div>
    </div>
  );
}
