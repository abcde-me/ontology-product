export default function addSortToColumns(originalColumns) {
  return originalColumns.map((column) => ({
    ...column,
    sorter: (a, b) => {
      const aVal = a[column.dataIndex];
      const bVal = b[column.dataIndex];

      // 数字排序
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return aVal - bVal;
      }

      // 字符串排序
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal);
      }

      // 日期排序
      if (aVal instanceof Date && bVal instanceof Date) {
        return aVal.getTime() - bVal.getTime();
      }

      // 其他类型转换为字符串排序
      return String(aVal).localeCompare(String(bVal));
    }
  }));
}
