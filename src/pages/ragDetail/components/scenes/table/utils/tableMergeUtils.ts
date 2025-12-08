/**
 * 表格合并单元格工具函数
 */

import { CellMerge } from '../../../../types';

export interface MergeInfo {
  rowSpan: number;
  colSpan: number;
  isStart?: boolean;
}

/**
 * 检查表头单元格是否应该渲染
 */
export const shouldRenderHeaderCell = (
  rowIndex: number,
  colIndex: number,
  merges?: CellMerge[]
): boolean => {
  if (!merges) return true;

  for (const merge of merges) {
    // 检查当前单元格是否在合并区域内（但不是起始单元格）
    if (
      rowIndex >= merge.startRow &&
      rowIndex <= merge.endRow &&
      colIndex >= merge.startCol &&
      colIndex <= merge.endCol &&
      !(rowIndex === merge.startRow && colIndex === merge.startCol)
    ) {
      return false;
    }
  }
  return true;
};

/**
 * 获取表头单元格的合并信息
 */
export const getHeaderCellMergeInfo = (
  rowIndex: number,
  colIndex: number,
  merges?: CellMerge[]
): MergeInfo | null => {
  if (!merges) return null;

  for (const merge of merges) {
    if (merge.startRow === rowIndex && merge.startCol === colIndex) {
      return {
        colSpan: merge.endCol - merge.startCol + 1,
        rowSpan: merge.endRow - merge.startRow + 1
      };
    }
  }
  return null;
};

/**
 * 获取数据单元格的合并信息
 */
export const getCellMergeInfo = (
  rowIndex: number,
  colIndex: number,
  headerRowCount: number,
  merges?: CellMerge[]
): MergeInfo | null => {
  if (!merges) return null;

  // rowIndex是数据行索引（0-based），需要加上表头行数
  const actualRowIndex = rowIndex + headerRowCount;

  for (const merge of merges) {
    // 检查当前单元格是否是合并区域的起始单元格
    if (merge.startRow === actualRowIndex && merge.startCol === colIndex) {
      return {
        rowSpan: merge.endRow - merge.startRow + 1,
        colSpan: merge.endCol - merge.startCol + 1,
        isStart: true
      };
    }
    // 检查当前单元格是否在合并区域内（但不是起始单元格）
    if (
      actualRowIndex >= merge.startRow &&
      actualRowIndex <= merge.endRow &&
      colIndex >= merge.startCol &&
      colIndex <= merge.endCol
    ) {
      return {
        rowSpan: 1,
        colSpan: 1,
        isStart: false
      };
    }
  }
  return null;
};
