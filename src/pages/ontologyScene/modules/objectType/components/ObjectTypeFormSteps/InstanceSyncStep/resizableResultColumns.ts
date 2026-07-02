import type { ColumnProps } from '@arco-design/web-react/es/Table';
import React from 'react';
import ResizableColumnTitle, {
  MIN_RESIZABLE_COLUMN_WIDTH
} from './ResizableColumnTitle';

export type ResultColumnWidthMap = Record<string, number>;

export const DEFAULT_RESULT_COLUMN_WIDTHS: ResultColumnWidthMap = {
  recordIndex: 80,
  name: 110,
  comment: 130,
  fieldType: 140,
  valueText: 240
};

export const RESULT_TABLE_HEADER_HEIGHT = 36;

export function resolveResultColumnWidth(
  columnKey: string,
  columnWidths: ResultColumnWidthMap
): number {
  return (
    columnWidths[columnKey] ?? DEFAULT_RESULT_COLUMN_WIDTHS[columnKey] ?? 100
  );
}

export function withResizableResultColumn<T>(
  column: ColumnProps<T>,
  columnKey: string,
  columnWidths: ResultColumnWidthMap,
  onResize: (key: string, width: number) => void
): ColumnProps<T> {
  const width = resolveResultColumnWidth(columnKey, columnWidths);
  const titleContent = column.title;

  return {
    ...column,
    key: columnKey,
    width,
    title: React.createElement(
      ResizableColumnTitle,
      {
        columnKey,
        width,
        onResize: (key, nextWidth) =>
          onResize(key, Math.max(MIN_RESIZABLE_COLUMN_WIDTH, nextWidth))
      },
      titleContent
    )
  };
}
