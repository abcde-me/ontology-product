import React, { useState, useEffect } from 'react';
import {
  Input,
  Button,
  Select,
  DatePicker,
  Popover,
  Checkbox
} from '@arco-design/web-react';
import {
  IconSearch,
  IconDown,
  IconUp,
  IconSettings
} from '@arco-design/web-react/icon';
import { ColumnField } from '../ColumnSettingModal';
import { FieldSearchItem } from '@/types/dataAssetApi';

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
  onMainSearch?: (value: string) => void;
  /** 字段搜索回调 */
  onFieldSearch?: (fieldValues: FieldSearchItem[]) => void;
  /** 重置回调 */
  onReset?: () => void;
  /** 样式类 */
  className?: string;
}

export default function SearchArea({
  fields = [],
  mainSearchValue = '',
  mainSearchPlaceholder = '请输入搜索内容,如10月份所有的表',
  onMainSearch,
  onFieldSearch,
  onReset,
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

  // 初始化：默认勾选所有字段
  useEffect(() => {
    const defaultChecked = new Set(fields.slice(0, 4).map((f) => f.id));
    setCheckedFields(defaultChecked);
  }, [fields]);

  // 处理主搜索（点击搜索图标或按Enter）
  const handleMainSearch = () => {
    onMainSearch?.(mainSearch);
  };

  // 处理字段值变化
  const handleFieldValueChange = (fieldKey: string, value: any) => {
    setFieldValues((prev) => ({
      ...prev,
      [fieldKey]: value
    }));
  };

  // 处理查询按钮点击
  const handleQuery = () => {
    // 只传递已勾选字段的值
    const searchParams: Record<string, any> = {};
    const fieldSearch: FieldSearchItem[] = [];
    checkedFields.forEach((fieldKey) => {
      const field = fields.find((f) => f.id === fieldKey);
      if (
        field &&
        fieldValues[fieldKey] !== undefined &&
        fieldValues[fieldKey] !== null &&
        fieldValues[fieldKey] !== ''
      ) {
        const paramKey = field.id || fieldKey;
        searchParams[paramKey] = fieldValues[fieldKey];

        fieldSearch.push({
          nameEn: field.id,
          type: field.type,
          searchContent: [fieldValues[fieldKey]]
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
      setCheckedFields(new Set(fields.map((f) => f.id)));
    } else {
      setCheckedFields(new Set());
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
            className="flex cursor-pointer items-center px-4 py-2 transition-colors hover:bg-[var(--color-fill-2)]"
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

  // 渲染字段搜索输入组件
  const renderFieldInput = (field: ColumnField) => {
    const value = fieldValues[field.id];
    let fieldType = field.type;

    if (field.isEnumAble && field.values?.length > 0) {
      fieldType = 'select';
    } else if (field.type === 'datetime') {
      fieldType = 'range';
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
            suffix={<IconSearch />}
            allowClear
          />
        );
      case 'select':
        return (
          <Select
            placeholder={`请选择${field.nameZh}`}
            value={value}
            onChange={(val) => handleFieldValueChange(field.id, val)}
            allowClear
            showSearch
          >
            {field.values?.map((opt) => (
              <Select.Option key={opt} value={opt}>
                {opt}
              </Select.Option>
            ))}
          </Select>
        );
      case 'range':
        return (
          <DatePicker.RangePicker
            value={value}
            onChange={(val) => handleFieldValueChange(field.nameZh, val)}
            allowClear
            placeholder={['开始日期', '结束日期']}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`${className}`}>
      {/* 主搜索区域 */}
      <div className="flex items-center gap-3">
        <Input.Search
          className="w-[480px]"
          placeholder={mainSearchPlaceholder}
          value={mainSearch}
          onChange={setMainSearch}
          onClear={handleMainSearch}
          onPressEnter={handleMainSearch}
          suffix={
            <IconSearch
              className="cursor-pointer text-[var(--color-text-2)] transition-colors hover:text-[rgb(var(--primary-6))]"
              onClick={handleMainSearch}
            />
          }
          allowClear
        />
        <Button
          type="text"
          // className="whitespace-nowrap px-2 "
          onClick={() => setIsFieldSearchExpanded(!isFieldSearchExpanded)}
        >
          {isFieldSearchExpanded ? (
            <>
              <IconUp className="mr-[8px]" />
              收起字段搜索
            </>
          ) : (
            <>
              <IconDown className="mr-[8px]" />
              展开字段搜索
            </>
          )}
        </Button>
      </div>

      {/* 字段搜索区域（可展开/收起） */}
      {isFieldSearchExpanded && (
        <div className="border-b border-[#CBD5E1] py-[24px]">
          {/* 字段搜索列表 */}
          {visibleFields.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-4">
              {visibleFields.map((field) => (
                <div key={field.id} className="flex items-center gap-3">
                  <span className="whitespace-nowrap text-sm text-[var(--color-text-1)]">
                    {field.nameZh}:
                  </span>
                  <div className="w-[200px]">{renderFieldInput(field)}</div>
                </div>
              ))}
            </div>
          )}

          {/* 操作按钮区域 */}
          <div className="flex items-center gap-2">
            <QueryButton />
            <Button onClick={handleReset}>重置</Button>
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
      )}
    </div>
  );
}
