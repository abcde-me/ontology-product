import type { ColumnProps } from '@arco-design/web-react/es/Table';
import React from 'react';

import {
  MIN_RESIZABLE_COLUMN_WIDTH,
  ResizableColumnTitle
} from '../components/ResizableColumnTitle';

export type ColumnWidthMap = Record<string, number>;

export const resolveColumnWidth = (
  columnKey: string,
  defaultWidth: number,
  columnWidths: ColumnWidthMap
): number => columnWidths[columnKey] ?? defaultWidth;

export const withResizableColumn = <T,>(
  column: ColumnProps<T>,
  columnKey: string,
  defaultWidth: number,
  columnWidths: ColumnWidthMap,
  onResize: (key: string, width: number) => void
): ColumnProps<T> => {
  const width = resolveColumnWidth(columnKey, defaultWidth, columnWidths);
  const titleContent = column.title;

  return {
    ...column,
    key: columnKey,
    width,
    title: (
      <ResizableColumnTitle
        columnKey={columnKey}
        width={width}
        onResize={(key, nextWidth) =>
          onResize(key, Math.max(MIN_RESIZABLE_COLUMN_WIDTH, nextWidth))
        }
      >
        {titleContent}
      </ResizableColumnTitle>
    )
  };
};
