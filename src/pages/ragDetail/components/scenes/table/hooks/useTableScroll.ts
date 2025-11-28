/**
 * Table Scroll Hook
 * 表格滚动相关的 Hook
 */

import { useEffect, useState, RefObject } from 'react';

interface UseTableScrollProps {
  tableScrollRef: RefObject<HTMLDivElement>;
  tableRef: RefObject<HTMLTableElement>;
  horizontalScrollRef: RefObject<HTMLDivElement>;
  tableData: any;
}

interface UseTableScrollReturn {
  needsHorizontalScroll: boolean;
  tableWidth: number;
}

export const useTableScroll = ({
  tableScrollRef,
  tableRef,
  horizontalScrollRef,
  tableData
}: UseTableScrollProps): UseTableScrollReturn => {
  const [needsHorizontalScroll, setNeedsHorizontalScroll] = useState(false);
  const [tableWidth, setTableWidth] = useState<number>(0);

  // 检测是否需要横向滚动
  useEffect(() => {
    const checkScrollNeeded = () => {
      const tableScroll = tableScrollRef.current;
      const table = tableRef.current;

      if (!tableScroll || !table) {
        setNeedsHorizontalScroll(false);
        setTableWidth(0);
        return;
      }

      // 检测表格实际宽度是否超过容器宽度
      const currentTableWidth = table.scrollWidth;
      const containerWidth = tableScroll.clientWidth;
      setTableWidth(currentTableWidth);
      setNeedsHorizontalScroll(currentTableWidth > containerWidth);
    };

    // 初始检测
    checkScrollNeeded();

    // 监听窗口大小变化和表格大小变化
    const resizeObserver = new ResizeObserver(checkScrollNeeded);
    if (tableScrollRef.current) {
      resizeObserver.observe(tableScrollRef.current);
    }
    if (tableRef.current) {
      resizeObserver.observe(tableRef.current);
    }

    // 延迟检测，确保表格已渲染
    const timeoutId = setTimeout(checkScrollNeeded, 100);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timeoutId);
    };
  }, [tableData, tableScrollRef, tableRef]);

  // 同步横向滚动
  useEffect(() => {
    const tableScroll = tableScrollRef.current;
    const horizontalScroll = horizontalScrollRef.current;

    if (!tableScroll || !horizontalScroll || !needsHorizontalScroll) return;

    const handleScroll = () => {
      horizontalScroll.scrollLeft = tableScroll.scrollLeft;
    };

    const handleHorizontalScroll = () => {
      tableScroll.scrollLeft = horizontalScroll.scrollLeft;
    };

    tableScroll.addEventListener('scroll', handleScroll);
    horizontalScroll.addEventListener('scroll', handleHorizontalScroll);

    return () => {
      tableScroll.removeEventListener('scroll', handleScroll);
      horizontalScroll.removeEventListener('scroll', handleHorizontalScroll);
    };
  }, [tableData, needsHorizontalScroll, tableScrollRef, horizontalScrollRef]);

  return {
    needsHorizontalScroll,
    tableWidth
  };
};
