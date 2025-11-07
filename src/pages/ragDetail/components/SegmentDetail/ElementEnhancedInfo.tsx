/**
 * Element Enhanced Info Component
 * 元素增强信息组件（关键描述和抽取实体）
 */

import React from 'react';
import { Input, Select } from '@arco-design/web-react';
import type { Element } from '../../types';
import { useSegmentDetailStore } from './store/segmentDetailStore';
import ElementEnhancementInformation from './assets/element-enhancement-information.svg';

const { TextArea } = Input;

interface ElementEnhancedInfoProps {
  element: Element;
  isEditing: boolean;
}

const ElementEnhancedInfo: React.FC<ElementEnhancedInfoProps> = ({
  element,
  isEditing
}) => {
  // 从 store 获取更新方法
  const updateElement = useSegmentDetailStore((state) => state.updateElement);

  if (!element.relatedDescription && !element.extractionEntity && !isEditing) {
    return null;
  }

  // 处理抽取实体变化
  const handleEntityChange = (values: string[]) => {
    console.log('🏷️ 抽取实体变化:', { elementId: element.id, values });
    updateElement(element.id, {
      extractionEntity: values
    });
  };

  // 处理关键描述变化
  const handleDescriptionChange = (value: string) => {
    console.log('📝 关键描述变化:', { elementId: element.id, value });
    updateElement(element.id, { relatedDescription: value });
  };

  return (
    <div className="mt-4 rounded-lg bg-gray-50 p-3">
      <div className="mb-2 flex items-center gap-1 text-sm font-medium text-gray-700">
        <ElementEnhancementInformation />
        <span className="text-sm font-semibold leading-5">元素增强信息</span>
      </div>

      {/* 关键描述 */}
      <div className="mb-3 flex">
        <div className="mb-1 w-[180px] text-xs text-gray-500">关键描述:</div>
        {isEditing ? (
          <TextArea
            value={element.relatedDescription || ''}
            onChange={handleDescriptionChange}
            autoSize={{ minRows: 2, maxRows: 6 }}
            placeholder="请输入关键描述"
          />
        ) : (
          <div className="text-sm text-gray-900">
            {element.relatedDescription || '-'}
          </div>
        )}
      </div>

      {/* 抽取实体 */}
      <div className="flex">
        <div className="mb-1 w-[180px] text-xs text-gray-500">抽取实体:</div>
        {isEditing ? (
          <Select
            mode="multiple"
            placeholder="请输入或选择标签"
            value={element.extractionEntity || []}
            onChange={handleEntityChange}
            allowCreate
            allowClear
            style={{ width: '100%' }}
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            {element.extractionEntity && element.extractionEntity.length > 0 ? (
              element.extractionEntity.map((entity, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded bg-white px-2 py-1 text-xs text-gray-700"
                >
                  {entity}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-400">-</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ElementEnhancedInfo;
