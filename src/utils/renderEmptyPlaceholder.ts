// table数据为空时展示-
export const renderEmptyPlaceholder = (value: string | null) => {
  return value === '' || value == null ? '-' : value;
};
