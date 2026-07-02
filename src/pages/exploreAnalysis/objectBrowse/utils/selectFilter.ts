import type { ReactNode } from 'react';

interface SelectOptionLike {
  props?: {
    children?: ReactNode;
    value?: unknown;
  };
}

/** 按选项展示文本匹配关键字，用于 Select 的 filterOption */
export const filterSelectByLabel = (
  inputValue: string,
  option: SelectOptionLike
): boolean => {
  const label = String(option?.props?.children ?? '');
  const keyword = inputValue.trim().toLowerCase();
  if (!keyword) {
    return true;
  }
  return label.toLowerCase().includes(keyword);
};

/** 按数据源字段匹配关键字，支持名称、编码等多字段检索 */
export const createSelectFilterByFields = <T>(
  items: T[],
  getValue: (item: T) => unknown,
  getSearchTexts: (item: T) => Array<string | number | undefined | null>
) => {
  return (inputValue: string, option: SelectOptionLike): boolean => {
    const keyword = inputValue.trim().toLowerCase();
    if (!keyword) {
      return true;
    }

    const optionValue = option?.props?.value;
    const item = items.find((row) => getValue(row) === optionValue);
    if (!item) {
      return filterSelectByLabel(inputValue, option);
    }

    return getSearchTexts(item).some((text) =>
      String(text ?? '')
        .toLowerCase()
        .includes(keyword)
    );
  };
};
