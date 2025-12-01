/**
 * Table Segment Card Component
 * 表格分段卡片
 */

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useClickAway } from 'ahooks';
import { TableSegment } from '../../../types';
import { useRagDetailStore } from '../../../store/ragDetailStore';
import SegmentCardActions from '../../shared/SegmentCardActions';
import SegmentMarkdown from '../../common/SegmentMarkdown';
import { Input } from '@arco-design/web-react';
import { containsMarkdown } from '../../../utils/excelUtils';

interface TableSegmentCardProps {
  segment: TableSegment;
  isSelected: boolean;
  totalSegments?: number;
}

interface TableData {
  headers: string[];
  rows: Array<Record<string, string>>;
}

const TableSegmentCard: React.FC<TableSegmentCardProps> = ({
  segment,
  isSelected,
  totalSegments
}) => {
  const {
    selectSegment,
    editingSegmentId,
    cancelEditingSegment,
    updateSegmentContent,
    setHighlightedExcelCoordinate,
    clearHighlightedExcelCoordinate
  } = useRagDetailStore();
  const [isHovered, setIsHovered] = useState(false);
  const isEditing = editingSegmentId === segment.id;
  const cardRef = useRef<HTMLDivElement>(null);
  const prevIsEditingRef = useRef<boolean>(false);
  const isClickAwayRef = useRef<boolean>(false);

  // 初始化表格数据
  const initialTableData = useMemo<TableData>(() => {
    try {
      const rawData = JSON.parse(segment.content);
      return {
        headers: Object.keys(rawData),
        rows: [rawData]
      };
    } catch (error) {
      console.error('解析表格数据失败:', error);
      return {
        headers: [],
        rows: []
      };
    }
  }, [segment.content]);

  const [tableData, setTableData] = useState<TableData>(initialTableData);

  // 同步外部数据到本地状态
  React.useEffect(() => {
    setTableData(initialTableData);
  }, [initialTableData]);

  // 将表格数据转换为 JSON 字符串
  const convertTableDataToJson = useCallback((data: TableData): string => {
    try {
      return JSON.stringify(data.rows[0]);
    } catch (error) {
      console.error('转换表格数据为JSON失败:', error);
      return '{}';
    }
  }, []);

  // 渲染单元格内容
  const renderCellContent = useCallback((content: string | number) => {
    const contentStr = String(content || '');
    // if (containsMarkdown(contentStr)) {
    //   return (
    //     <div className="text-gray-900">
    //       <SegmentMarkdown content={contentStr} className="!m-0 !p-0" />
    //     </div>
    //   );
    // }
    return <span className="break-all text-gray-900">{contentStr}</span>;
  }, []);

  // 处理表头编辑
  const handleHeaderChange = useCallback((index: number, value: string) => {
    setTableData((prevData) => {
      const oldHeader = prevData.headers[index];
      const newHeaders = [...prevData.headers];
      newHeaders[index] = value;

      // 更新 rows 中的键名
      const newRows = prevData.rows.map((row) => {
        const newRow: Record<string, string> = {};
        Object.entries(row).forEach(([key, val]) => {
          newRow[key === oldHeader ? value : key] = val;
        });
        return newRow;
      });

      return { headers: newHeaders, rows: newRows };
    });
  }, []);

  // 处理单元格编辑
  const handleCellChange = useCallback(
    (rowIndex: number, header: string, value: string) => {
      setTableData((prevData) => {
        const newRows = [...prevData.rows];
        newRows[rowIndex] = { ...newRows[rowIndex], [header]: value };
        return { ...prevData, rows: newRows };
      });
    },
    []
  );

  // 保存编辑
  const handleSave = useCallback(async () => {
    try {
      const jsonContent = convertTableDataToJson(tableData);

      // 只有在内容发生变化时才更新
      if (jsonContent !== segment.content) {
        await updateSegmentContent(segment.id, jsonContent);
      } else {
        // 内容没有变化，只是取消编辑状态
        cancelEditingSegment();
      }
    } catch (error) {
      console.error('保存表格失败:', error);
    }
  }, [
    tableData,
    segment.id,
    segment.content,
    updateSegmentContent,
    cancelEditingSegment,
    convertTableDataToJson
  ]);

  // 监听编辑状态变化，从编辑状态退出时保存数据
  React.useEffect(() => {
    // 当从编辑状态变为非编辑状态时，保存数据
    if (prevIsEditingRef.current && !isEditing) {
      // 如果是点击外部区域触发的，跳过（已经在 useClickAway 中处理了）
      if (!isClickAwayRef.current) {
        handleSave();
      }
      // 重置标志
      isClickAwayRef.current = false;
    }
    prevIsEditingRef.current = isEditing;
  }, [isEditing, handleSave]);

  // 点击外部区域：先取消编辑状态，再判断是否需要更新
  useClickAway(() => {
    if (isEditing) {
      try {
        // 标记是点击外部区域触发的
        isClickAwayRef.current = true;
        // 取消高亮
        clearHighlightedExcelCoordinate();
        // 先取消编辑状态
        cancelEditingSegment();

        // 判断内容是否变化，如果变化则更新
        const jsonContent = convertTableDataToJson(tableData);
        if (jsonContent !== segment.content) {
          updateSegmentContent(segment.id, jsonContent);
        }
      } catch (error) {
        console.error('点击外部区域保存失败:', error);
      }
    }
  }, cardRef);

  // 处理卡片点击
  const handleCardClick = useCallback(() => {
    if (!isEditing) {
      selectSegment(segment.id);
      setHighlightedExcelCoordinate(segment.id);
    }
  }, [isEditing, selectSegment, segment.id]);

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
      onClick={handleCardClick}
    >
      {/* 卡片头部 */}
      <div className="flex items-center justify-between px-3 pb-[7px] pt-3">
        <div className="flex-1">
          <div className="text-xs text-gray-500">
            字符数: {segment.charCount} 分段数: {segment.segmentIndex + 1}/
            {totalSegments ?? 0}
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
            className={`border-collapse border ${
              tableData.headers.length >= 4 ? '' : 'w-full'
            }`}
            style={
              tableData.headers.length >= 4
                ? {
                    tableLayout: 'fixed',
                    width: `${tableData.headers.length * 200}px`
                  }
                : { tableLayout: 'fixed', width: '100%' }
            }
          >
            <thead>
              <tr>
                {tableData.headers.map((header, index) => (
                  <th
                    key={index}
                    className="border-b border-[#E2E8F0] px-4 py-2 text-left text-sm font-semibold text-[#1E293B]"
                    style={
                      tableData.headers.length >= 4
                        ? { width: '200px', minWidth: '200px' }
                        : { width: `${100 / tableData.headers.length}%` }
                    }
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
              {tableData.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {tableData.headers.map((header, colIndex) => (
                    <td
                      key={colIndex}
                      className="border-b bg-white px-4 py-2 text-sm"
                      style={
                        tableData.headers.length >= 4
                          ? { width: '200px', minWidth: '200px' }
                          : { width: `${100 / tableData.headers.length}%` }
                      }
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
                        renderCellContent(row[header])
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
