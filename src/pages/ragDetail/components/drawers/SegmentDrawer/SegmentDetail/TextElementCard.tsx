/**
 * Text Element Card Component
 * 文本元素卡片组件
 */

import React from 'react';
import { Input } from '@arco-design/web-react';
import type { TextElement } from '../../../../types';
import ElementEnhancedInfo from './ElementEnhancedInfo';
import { useSegmentDetailStore } from './store/segmentDetailStore';

const { TextArea } = Input;

interface TextElementCardProps {
  element: TextElement;
  isEditing: boolean;
}

const TextElementCard: React.FC<TextElementCardProps> = ({
  element,
  isEditing
}) => {
  // 从 store 获取更新方法
  const updateElement = useSegmentDetailStore((state) => state.updateElement);

  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center">
        <span className="inline-flex items-center rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600">
          文本
        </span>
        <span className="ml-2 text-sm font-semibold text-gray-600">
          元素ID: {element.id}
        </span>
      </div>

      {/* 文本内容 */}
      {isEditing ? (
        <TextArea
          value={element.content}
          onChange={(value) => updateElement(element.id, { content: value })}
          className="mb-3"
          autoSize={{ minRows: 3, maxRows: 8 }}
          placeholder="请输入文本内容"
        />
      ) : (
        <div className="mb-3 rounded py-3 text-[14px] leading-6 text-gray-900">
          {element.content}
        </div>
      )}

      <div className="flex items-center gap-3 text-sm">
        <div className="flex">
          <span className="w-18 text-gray-500">定位类型：</span>
          <span className="text-gray-900">{element.positionType}</span>
        </div>
        <div className="flex">
          <span className="w-18 text-gray-500">位置信息：</span>
          <span className="text-gray-900">{element.positionInfo}</span>
        </div>
      </div>

      <ElementEnhancedInfo element={element} isEditing={isEditing} />
    </div>
  );
};

export default TextElementCard;
