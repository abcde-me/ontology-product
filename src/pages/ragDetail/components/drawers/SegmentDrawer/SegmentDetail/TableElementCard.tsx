/**
 * Table Element Card Component
 * 表格元素卡片组件
 */

import React from 'react';
import { Input } from '@arco-design/web-react';
import type { TableElement } from '../../../../types';
import ElementEnhancedInfo from './ElementEnhancedInfo';
import { useSegmentDetailStore } from './store/segmentDetailStore';

interface TableElementCardProps {
  element: TableElement;
  isEditing: boolean;
}

const TableElementCard: React.FC<TableElementCardProps> = ({
  element,
  isEditing
}) => {
  // 从 store 获取更新方法
  const updateElement = useSegmentDetailStore((state) => state.updateElement);

  const handleHeaderChange = (index: number, value: string) => {
    const newHeaders = [...element.headers];
    newHeaders[index] = value;
    updateElement(element.id, { headers: newHeaders });
  };

  const handleCellChange = (
    rowIndex: number,
    header: string,
    value: string
  ) => {
    const newRows = [...element.rows];
    newRows[rowIndex] = { ...newRows[rowIndex], [header]: value };
    updateElement(element.id, { rows: newRows });
  };

  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center">
        <span className="inline-flex items-center rounded bg-green-50 px-2 py-1 text-xs font-medium text-green-600">
          表格
        </span>
        <span className="ml-2 text-sm text-gray-600">元素ID: {element.id}</span>
      </div>

      <div className="mb-3 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {element.headers.map((header, index) => (
                <th
                  key={index}
                  className="border border-gray-200 px-4 py-2 text-left text-sm font-medium font-semibold text-gray-700"
                >
                  {isEditing ? (
                    <Input
                      value={header}
                      onChange={(value) => handleHeaderChange(index, value)}
                      size="small"
                      className="w-full"
                    />
                  ) : (
                    header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {element.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {element.headers.map((header, colIndex) => (
                  <td
                    key={colIndex}
                    className="border border-gray-200 px-4 py-2 text-sm"
                  >
                    {isEditing ? (
                      <Input
                        value={row[header]}
                        onChange={(value) =>
                          handleCellChange(rowIndex, header, value)
                        }
                        size="small"
                        className="w-full"
                      />
                    ) : (
                      <span className="text-gray-900">{row[header]}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <div className="flex">
          <span className="text-gray-500">定位类型:</span>
          <span className="ml-2 text-gray-900">{element.positionType}</span>
        </div>
        <div className="flex">
          <span className="text-gray-500">位置信息:</span>
          <span className="ml-2 text-gray-900">{element.positionInfo}</span>
        </div>
      </div>

      {/* <ElementEnhancedInfo element={element} isEditing={isEditing} /> */}
    </div>
  );
};

export default TableElementCard;
