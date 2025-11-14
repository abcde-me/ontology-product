/**
 * Enhancement Info Component
 * 分段增强信息组件
 */

import React from 'react';
import { Input, Select } from '@arco-design/web-react';
import { IconEdit } from '@arco-design/web-react/icon';
import type { EnhancementInfo as EnhancementInfoType } from '../../../../types';

const { TextArea } = Input;

interface EnhancementInfoProps {
  enhancement: EnhancementInfoType;
  isEditing: boolean;
  loading: boolean;
  onUpdate: (field: keyof EnhancementInfoType, value: string) => void;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onConfirmEditing: () => void;
}

const EnhancementInfo: React.FC<EnhancementInfoProps> = ({
  enhancement,
  isEditing,
  loading,
  onUpdate,
  onStartEditing,
  onCancelEditing,
  onConfirmEditing
}) => {
  return (
    <div>
      {/* 标题和编辑按钮 */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-medium text-gray-900">分段增强信息</h3>
        {/* <div className="flex gap-2">
          {!isEditing ? (
            <button
              onClick={onStartEditing}
              className="flex items-center gap-1 rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
            >
              <IconEdit className="text-base" />
              编辑
            </button>
          ) : (
            <>
              <button
                onClick={onCancelEditing}
                className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                disabled={loading}
              >
                取消
              </button>
              <button
                onClick={onConfirmEditing}
                className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? '保存中...' : '确定'}
              </button>
            </>
          )}
        </div> */}
      </div>

      {/* 内容区域 */}
      <div className="space-y-4">
        {/* 分段总结 */}
        <div className="flex gap-2">
          <label className="block w-[100px] text-sm  text-[#6E7B8D]">
            分段总结：
          </label>
          {isEditing ? (
            <TextArea
              value={enhancement.summary}
              onChange={(value) => onUpdate('summary', value)}
              placeholder="请输入分段总结"
              autoSize={{ minRows: 3, maxRows: 6 }}
              className="w-full"
            />
          ) : (
            <div className="w-full whitespace-pre-wrap text-sm text-[#475569]">
              {enhancement.summary}
            </div>
          )}
        </div>

        {/* 假设性问答 */}
        <div className="flex gap-2">
          <label className="block w-[100px] text-sm  text-[#6E7B8D]">
            假设性问答：
          </label>
          {isEditing ? (
            <TextArea
              value={enhancement.hypotheticalAnswer}
              onChange={(value) => onUpdate('hypotheticalAnswer', value)}
              placeholder="请输入假设性问答"
              autoSize={{ minRows: 3, maxRows: 6 }}
              className="w-full"
            />
          ) : (
            <div className="w-full whitespace-pre-wrap text-sm text-[#475569]">
              {enhancement.hypotheticalAnswer}
            </div>
          )}
        </div>

        {/* 实体 */}
        <div className="flex items-center">
          <label className="block w-[100px] text-sm  text-[#6E7B8D]">
            实体:
          </label>
          {isEditing ? (
            <Select
              mode="multiple"
              placeholder="请输入或选择实体"
              value={enhancement.extractionEntity || []}
              onChange={(values) => onUpdate('extractionEntity', values)}
              allowCreate
              allowClear
              style={{ width: '100%' }}
            />
          ) : (
            <div className="flex flex-wrap" style={{ gap: '4px' }}>
              {enhancement.extractionEntity &&
              enhancement.extractionEntity.length > 0 ? (
                enhancement.extractionEntity.map((entity, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center border border-[#E2E8F0] bg-white px-2 py-1 text-xs text-gray-700"
                    style={{ borderRadius: '2px' }}
                  >
                    {entity}
                  </span>
                ))
              ) : (
                <span className="whitespace-pre-wrap text-sm text-[#475569]">
                  -
                </span>
              )}
            </div>
          )}
        </div>

        {/* 标签 */}
        <div className="flex items-center">
          <label className="block w-[100px] text-sm  text-[#6E7B8D]">
            标签:
          </label>
          {isEditing ? (
            <Select
              mode="multiple"
              placeholder="请输入或选择标签"
              value={enhancement.tags || []}
              onChange={(values) => onUpdate('tags', values)}
              allowCreate
              allowClear
              style={{ width: '100%' }}
            />
          ) : (
            <div className="flex flex-wrap" style={{ gap: '4px' }}>
              {enhancement.tags && enhancement.tags.length > 0 ? (
                enhancement.tags.map((entity, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center border border-[#E2E8F0] bg-white px-2 py-1 text-xs text-gray-700"
                    style={{ borderRadius: '2px' }}
                  >
                    {entity}
                  </span>
                ))
              ) : (
                <span className="whitespace-pre-wrap text-sm text-[#475569]">
                  -
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancementInfo;
