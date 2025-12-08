/**
 * Table Element Card Component
 * 表格元素卡片组件
 */

import React from 'react';
import { Input } from '@arco-design/web-react';
import type { TableElement } from '../../../../types';
import SegmentMarkdown from '../../../common/SegmentMarkdown';
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

  const handleContentChange = (value: string) => {
    updateElement(element.id, { content: value });
  };

  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-3">
      <div className="mb-3 flex items-center">
        <span className="inline-flex h-6 w-9 items-center justify-center rounded bg-blue-50 text-sm font-medium text-blue-600">
          表格
        </span>
        <span className="ml-2 text-sm font-semibold text-[#0F172A]">
          元素ID: {element.id}
        </span>
      </div>

      {isEditing ? (
        <div className="mb-3">
          <Input.TextArea
            value={element.content}
            onChange={handleContentChange}
            placeholder="输入Markdown格式的表格"
            rows={10}
            className="w-full"
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <SegmentMarkdown content={element.content} />
        </div>
      )}

      {(element.positionType ||
        element.positionInfo ||
        (element as any).pageId) && (
        <div className="flex items-center gap-6 text-sm">
          {/* {element.positionType && (
            <span className="text-gray-900">
              <span className="text-gray-500">定位类型:</span>
              {element.positionType}
            </span>
          )}
          {element.positionInfo && (
            <span className="text-gray-900">
              <span className="text-gray-500">位置信息:</span>
              {element.positionInfo}
            </span>
          )} */}
          {/* {(element as any).pageId && (
            <span className="text-gray-900">
              <span className="text-gray-500">页码:</span>
              {(element as any).pageId}
            </span>
          )} */}
        </div>
      )}

      {/* <ElementEnhancedInfo element={element} isEditing={isEditing} /> */}
    </div>
  );
};

export default TableElementCard;
