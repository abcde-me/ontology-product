/**
 * Enhancement Info Component
 * 分段增强信息组件
 */

import React from 'react';
import { Input } from '@arco-design/web-react';
import { IconEdit } from '@arco-design/web-react/icon';
import type { EnhancementInfo as EnhancementInfoType } from '../../types';

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
        <div className="flex gap-2">
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
        </div>
      </div>

      {/* 内容区域 */}
      <div className="space-y-4">
        {/* 分段总结 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-[#0F172A]">
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
            <div className="whitespace-pre-wrap text-sm text-[#475569]">
              {enhancement.summary}
            </div>
          )}
        </div>

        {/* 假设性问答 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-[#0F172A]">
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
            <div className="whitespace-pre-wrap text-sm text-[#475569]">
              {enhancement.hypotheticalAnswer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancementInfo;
