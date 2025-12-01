/**
 * Table Body Component
 * 表体组件
 */

import React from 'react';
import { getCellMergeInfo } from '../utils/tableMergeUtils';
import { CellMerge } from '../../../../types';

interface TableBodyProps {
  rows: Array<Record<string, string>>;
  headers: string[];
  headerRowCount: number;
  merges?: CellMerge[];
  highlightedRowIndex?: number; // 需要高亮的行索引
  rowRefs?: React.RefObject<(HTMLTableRowElement | null)[]>; // 行引用数组
}

const TableBody: React.FC<TableBodyProps> = ({
  rows,
  headers,
  headerRowCount,
  merges,
  highlightedRowIndex,
  rowRefs
}) => {
  // 渲染单元格内容
  const renderCellContent = (
    content: string | number,
    isHighlighted: boolean
  ) => {
    const contentStr = String(content || '');
    return (
      <span
        className="break-all text-gray-900"
        style={isHighlighted ? { backgroundColor: '#F76560' } : {}}
      >
        {contentStr}
      </span>
    );
  };

  return (
    <tbody>
      {rows.map((row, rowIndex) => {
        const isHighlighted =
          highlightedRowIndex !== undefined && rowIndex === highlightedRowIndex;
        return (
          <tr
            key={rowIndex}
            ref={(el) => {
              if (rowRefs?.current) {
                rowRefs.current[rowIndex] = el;
              }
            }}
            className="bg-white transition-colors"
          >
            {headers.map((header, colIndex) => {
              const mergeInfo = getCellMergeInfo(
                rowIndex,
                colIndex,
                headerRowCount,
                merges
              );

              // 如果单元格在合并区域内但不是起始单元格，则不渲染
              if (mergeInfo && !mergeInfo.isStart) {
                return null;
              }

              return (
                <td
                  key={colIndex}
                  className="h-10 px-4 text-sm"
                  style={{
                    ...(headers.length >= 4
                      ? { width: '200px', minWidth: '200px' }
                      : { width: `${100 / headers.length}%` }),
                    borderBottom: '1px solid #e5e7eb',
                    verticalAlign: 'middle'
                  }}
                  rowSpan={mergeInfo?.rowSpan || 1}
                  colSpan={mergeInfo?.colSpan || 1}
                >
                  {renderCellContent(row[header], isHighlighted)}
                </td>
              );
            })}
          </tr>
        );
      })}
    </tbody>
  );
};

export default TableBody;
