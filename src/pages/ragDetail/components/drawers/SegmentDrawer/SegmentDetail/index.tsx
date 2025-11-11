/**
 * Segment Detail Component
 * 分段详情组件 - 主入口
 */

import React, { useEffect } from 'react';
import { IconEdit } from '@arco-design/web-react/icon';
import BasicInfo from './BasicInfo';
import ElementList from './ElementList';
import EnhancementInfo from './EnhancementInfo';
import { useSegmentDetailStore } from './store/segmentDetailStore';
import { useSegmentDrawerStore } from '../store/segmentDrawerStore';

interface SegmentDetailProps {
  segmentId: string;
}

const SegmentDetail: React.FC<SegmentDetailProps> = ({ segmentId }) => {
  // 从本地 store 获取编辑状态和方法
  const {
    detailData: localDetailData,
    isEditing,
    loading,
    isEditingEnhancement,
    loadingEnhancement,
    initializeDetail,
    startEditing,
    cancelEditing,
    confirmEditing,
    startEditingEnhancement,
    cancelEditingEnhancement,
    confirmEditingEnhancement,
    updateEnhancement
  } = useSegmentDetailStore();

  // 从统一的 drawer store 获取数据
  const { segmentDetailData, segmentDetailLoading } = useSegmentDrawerStore();

  // 初始化数据
  useEffect(() => {
    // 从统一的 drawer store 获取数据并初始化到本地 store
    if (segmentDetailData) {
      initializeDetail(segmentId, segmentDetailData);
    }
  }, [segmentId, segmentDetailData, initializeDetail]);

  // 如果数据还没加载，显示加载状态
  if (segmentDetailLoading || !segmentDetailData || !localDetailData) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto  pb-6 pt-6">
        {/* 基本信息 */}
        <BasicInfo
          segmentId={localDetailData.segmentId}
          charCount={localDetailData.charCount}
        />

        {/* 元素信息 */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-medium text-gray-900">元素信息</h3>
            <div className="flex gap-2">
              {!isEditing ? (
                <button
                  onClick={startEditing}
                  className="flex items-center gap-1 rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
                >
                  <IconEdit className="text-base" />
                  编辑
                </button>
              ) : (
                <>
                  <button
                    onClick={cancelEditing}
                    className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                    disabled={loading}
                  >
                    取消
                  </button>
                  <button
                    onClick={confirmEditing}
                    className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? '保存中...' : '确定'}
                  </button>
                </>
              )}
            </div>
          </div>

          <ElementList
            elements={localDetailData.elements}
            isEditing={isEditing}
          />
        </div>

        {/* 分段增强信息 */}
        {localDetailData.enhancement && (
          <div className="mt-6">
            <EnhancementInfo
              enhancement={localDetailData.enhancement}
              isEditing={isEditingEnhancement}
              loading={loadingEnhancement}
              onUpdate={updateEnhancement}
              onStartEditing={startEditingEnhancement}
              onCancelEditing={cancelEditingEnhancement}
              onConfirmEditing={confirmEditingEnhancement}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SegmentDetail;
