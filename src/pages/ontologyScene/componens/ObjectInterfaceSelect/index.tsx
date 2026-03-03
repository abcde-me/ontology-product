import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Select } from '@arco-design/web-react';
import { useVirtualList } from 'ahooks';
import classNames from 'classnames';
import styles from './index.module.scss';

export interface ObjectInterfaceSelectProps
  extends CustomFormItemCompProps<string | number> {
  placeholder?: string;
}

type OptionItem = {
  value: number;
  label: string;
};

const dropdownHeight = 400;
const rowHeight = 36;
const mockTotal = 10000;

/** 生成模拟数据 */
const createMockOptions = (total: number): OptionItem[] => {
  const list: OptionItem[] = [];
  for (let i = 1; i <= total; i += 1) {
    list.push({
      value: i,
      label: `实例-${i}`
    });
  }
  return list;
};

/** 构建值与展示文本的映射 */
const buildLabelMap = (list: OptionItem[]) => {
  const map = new Map<string, string>();
  for (const item of list) {
    map.set(String(item.value), item.label);
  }
  return map;
};

/** 获取模拟数据列表 */
const getMockOptionList = () => createMockOptions(mockTotal);

/** 对象实例下拉选择组件 */
export const ObjectInterfaceSelect = (props: ObjectInterfaceSelectProps) => {
  const { value, onChange, disabled, className, placeholder } = props;

  // 下拉容器与包裹层引用
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 控制下拉显示状态
  const [popupVisible, setPopupVisible] = useState(false);

  // 生成模拟数据
  const optionList = useMemo(getMockOptionList, []);

  /** 获取回显映射 */
  const getLabelMap = useCallback(
    () => buildLabelMap(optionList),
    [optionList]
  );

  // 构建回显映射
  const labelMap = useMemo(getLabelMap, [getLabelMap]);

  // 虚拟滚动列表
  const [virtualList] = useVirtualList(optionList, {
    containerTarget: containerRef,
    wrapperTarget: wrapperRef,
    itemHeight: rowHeight,
    overscan: 8
  });

  /** 处理下拉显示状态变化 */
  const handlePopupVisibleChange = useCallback((visible: boolean) => {
    setPopupVisible(visible);
  }, []);

  /** 处理清空或输入变化 */
  const handleValueChange = useCallback(
    (nextValue: string | number) => {
      onChange?.(nextValue);
    },
    [onChange]
  );

  /** 处理点击选项 */
  const handleOptionClick = useCallback(
    (option: OptionItem) => {
      onChange?.(option.value);
      setPopupVisible(false);
    },
    [onChange]
  );

  /** 渲染虚拟列表的单行 */
  /** 处理列表行点击事件 */
  const handleRowClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const target = event.currentTarget;
      const indexAttr = target.getAttribute('data-index');
      if (!indexAttr) return;
      const index = Number(indexAttr);
      if (Number.isNaN(index)) return;
      const option = optionList[index];
      if (!option) return;
      handleOptionClick(option);
    },
    [handleOptionClick, optionList]
  );

  /** 渲染虚拟列表的单行 */
  const renderVirtualRow = useCallback(
    (item: { data: OptionItem; index: number }) => {
      const isSelected = value === item.data.value;
      return (
        <div
          key={item.data.value}
          data-index={item.index}
          style={{
            height: rowHeight,
            lineHeight: `${rowHeight}px`,
            padding: '0 12px',
            cursor: 'pointer',
            background: isSelected ? '#F2F8FF' : 'transparent'
          }}
          onClick={handleRowClick}
        >
          {item.data.label}
        </div>
      );
    },
    [value, handleRowClick]
  );

  /** 渲染下拉内容 */
  const renderDropdown = useCallback(() => {
    return (
      <div
        ref={containerRef}
        style={{
          height: dropdownHeight,
          overflow: 'auto',
          padding: '4px 0'
        }}
      >
        <div ref={wrapperRef}>{virtualList.map(renderVirtualRow)}</div>
      </div>
    );
  }, [virtualList, renderVirtualRow]);

  /** 自定义回显内容 */
  const renderValue = useCallback(
    (_: any, currentValue: string | number) => {
      if (currentValue === undefined || currentValue === null) return null;
      return labelMap.get(String(currentValue)) || String(currentValue);
    },
    [labelMap]
  );

  return (
    <div className={classNames([styles['obj-interface'], className])}>
      <Select
        className={styles['interface']}
        value={value}
        disabled={disabled}
        allowClear
        popupVisible={popupVisible}
        placeholder={placeholder || '请选择'}
        onChange={handleValueChange}
        onDropdownVisibleChange={handlePopupVisibleChange}
        dropdownRender={renderDropdown}
        renderFormat={renderValue}
      />
    </div>
  );
};
