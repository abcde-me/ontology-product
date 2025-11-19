/**
 * Table Segment Card Component
 * 表格分段卡片
 */

import React, { useState, useRef } from 'react';
import { useClickAway } from 'ahooks';
import { TableSegment } from '../../../types';
import { useRagDetailStore } from '../../../store/ragDetailStore';
import SegmentCardActions from '../../shared/SegmentCardActions';
import SegmentMarkdown from '../../common/SegmentMarkdown';
import { Input } from '@arco-design/web-react';

interface TableSegmentCardProps {
  segment: TableSegment;
  isSelected: boolean;
  totalSegments?: number;
}

const TableSegmentCard: React.FC<TableSegmentCardProps> = ({
  segment,
  isSelected,
  totalSegments
}) => {
  const { selectSegment, editingSegmentId, cancelEditingSegment } =
    useRagDetailStore();
  const [isHovered, setIsHovered] = useState(false);
  const isEditing = editingSegmentId === segment.id;
  const cardRef = useRef<HTMLDivElement>(null);

  // 根据当前定义的 tableData 值生成表格结构
  const rawTableData = {
    ID: 1,
    问题: '整个共和国、城市地区和农村地区家庭在医疗服务和护理上的平均年度支出是多少英镑？',
    回答: '### 家庭在服务和医疗保健上的平均年度支出 1. **整个共和国家庭在服务和医疗保健上的平均年度支出：** - 2019/2020 年，整个共和国家庭在服务和医疗保健上的平均年度支出为 7,779.3 英镑（信息 1）。 2. **城镇家庭在服务和医疗保健上的平均年度支出：** - 2019/2020 年城镇家庭在服务和医疗保健上的平均年度支出为 6,779.3 埃及镑（信息 1）。 3. **农村家庭在服务和医疗保健上的平均年度支出：** - 2019/2020 年农村家庭在服务和医疗保健上的平均年度支出为 6,113.5 埃及镑（信息 1）。'
  };

  // 转换为表格格式：headers 和 rows
  const tableData = {
    headers: Object.keys(rawTableData),
    rows: [rawTableData]
  };

  // 判断内容是否包含 markdown 格式
  const containsMarkdown = (content: string | number): boolean => {
    if (typeof content === 'number') return false;
    const markdownPatterns = [
      /^#{1,6}\s/, // 标题 (#, ##, ###, etc.)
      /\*\*.*?\*\*/, // 粗体 (**text**)
      /\*.*?\*/, // 斜体 (*text*)
      /\[.*?\]\(.*?\)/, // 链接 [text](url)
      /^\s*[-*+]\s/, // 无序列表 (-, *, +)
      /^\s*\d+\.\s/, // 有序列表 (1., 2., etc.)
      /`.*?`/, // 行内代码 (`code`)
      /```[\s\S]*?```/, // 代码块 (```code```)
      /^\s*>\s/, // 引用 (> text)
      /\|.*\|/, // 表格 (| col |)
      /!\[.*?\]\(.*?\)/ // 图片 ![alt](url)
    ];
    return markdownPatterns.some((pattern) => pattern.test(content));
  };

  // 渲染单元格内容
  const renderCellContent = (content: string | number) => {
    const contentStr = String(content);
    if (containsMarkdown(contentStr)) {
      return (
        <div className="text-gray-900">
          <SegmentMarkdown content={contentStr} className="!m-0 !p-0" />
        </div>
      );
    }
    return <span className="text-gray-900">{contentStr}</span>;
  };
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
                          //  onChange={(value) =>
                          //    handleCellChange(rowIndex, header, value)
                          //  }
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
