/**
 * Table Segment Card Component
 * 表格分段卡片
 */

import React, { useState, useRef } from 'react';
import { useClickAway } from 'ahooks';
import { TableSegment } from '../../../types';
import { useRagDetailStore } from '../../../store/ragDetailStore';
import SegmentCardActions from '../../shared/SegmentCardActions';
import { Input } from '@arco-design/web-react';

interface TableSegmentCardProps {
  segment: TableSegment;
  isSelected: boolean;
}

const TableSegmentCard: React.FC<TableSegmentCardProps> = ({
  segment,
  isSelected
}) => {
  const { selectSegment, editingSegmentId, cancelEditingSegment } =
    useRagDetailStore();
  const [isHovered, setIsHovered] = useState(false);
  const isEditing = editingSegmentId === segment.id;
  const tableData = segment.tableData;
  const cardRef = useRef<HTMLDivElement>(null);

  // 点击外部区域取消编辑
  useClickAway(() => {
    if (isEditing) {
      cancelEditingSegment();
    }
  }, cardRef);

  return (
    <div
      ref={cardRef}
      className={`
        cursor-pointer rounded-lg border-[1px] px-3 transition-all duration-200
        ${
          isSelected
            ? 'border-[#007DFA] bg-blue-50'
            : isHovered
              ? 'border-[#007DFA] bg-white'
              : 'border-gray-200 bg-white'
        }
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        if (isEditing) {
          return;
        }
        selectSegment(segment.id);
      }}
    >
      {/* 卡片头部 */}
      <div className="flex items-center justify-between px-3 pb-[7px] pt-3">
        <div className="flex-1">
          <div className="text-xs text-gray-500">
            字符数: {segment.charCount} 分段数: {segment.segmentIndex}/100
          </div>
        </div>
        {(isSelected || isHovered) && (
          <SegmentCardActions segment={segment} isEditing={isEditing} />
        )}
      </div>

      {/* 表格预览 */}
      {tableData && (
        <div className="mb-3 overflow-x-auto bg-white">
          <table
            className={`border-collapse ${
              tableData.headers.length >= 4 ? '' : 'w-full'
            }`}
            style={
              tableData.headers.length >= 4
                ? { tableLayout: 'fixed', width: 'auto' }
                : { tableLayout: 'auto' }
            }
          >
            <thead>
              <tr>
                {tableData.headers.map((header, index) => (
                  <th
                    key={index}
                    className="border border-[#E2E8F0] px-4 py-2 text-left text-sm font-semibold text-[#1E293B]"
                    style={
                      tableData.headers.length >= 4
                        ? { width: '200px', minWidth: '200px' }
                        : {}
                    }
                  >
                    {isEditing ? (
                      <Input
                        value={header}
                        //  onChange={(value) => handleHeaderChange(index, value)}
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
              {tableData.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {tableData.headers.map((header, colIndex) => (
                    <td
                      key={colIndex}
                      className="border bg-white px-4 py-2 text-sm"
                      style={
                        tableData.headers.length >= 4
                          ? { width: '200px', minWidth: '200px' }
                          : {}
                      }
                    >
                      {isEditing ? (
                        <Input
                          value={row[header]}
                          //  onChange={(value) =>
                          //    handleCellChange(rowIndex, header, value)
                          //  }
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
      )}
    </div>
  );
};

export default TableSegmentCard;
