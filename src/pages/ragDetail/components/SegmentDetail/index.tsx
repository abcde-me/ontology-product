/**
 * Segment Detail Component
 * 分段详情组件 - 主入口
 */

import React, { useEffect } from 'react';
import { IconEdit } from '@arco-design/web-react/icon';
import BasicInfo from './BasicInfo';
import ElementList from './ElementList';
import { mockSegmentDetailData } from './mockData';
import { useSegmentDetailStore } from './store/segmentDetailStore';

interface SegmentDetailProps {
  segmentId: string;
}

const SegmentDetail: React.FC<SegmentDetailProps> = ({ segmentId }) => {
  // 从 store 获取状态和方法
  const {
    detailData,
    isEditing,
    loading,
    initializeDetail,
    startEditing,
    cancelEditing,
    confirmEditing
  } = useSegmentDetailStore();

  // 初始化数据
  useEffect(() => {
    // TODO: 从 API 获取数据，目前使用 mock 数据
    initializeDetail(segmentId, mockSegmentDetailData);

    // 组件卸载时重置状态
    return () => {
      // 可选：如果需要在组件卸载时清理状态
      // reset();
    };
  }, [segmentId, initializeDetail]);

  // 如果数据还没加载，显示加载状态
  if (!detailData) {
    return <div className="p-6">加载中...</div>;
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-6 pb-6 pt-6">
        {/* 基本信息 */}
        <BasicInfo
          segmentId={detailData.segmentId}
          charCount={detailData.charCount}
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

          <ElementList elements={detailData.elements} isEditing={isEditing} />
        </div>
      </div>
    </div>
  );
};

export default SegmentDetail;
