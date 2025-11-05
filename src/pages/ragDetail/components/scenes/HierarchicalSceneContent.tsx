/**
 * Hierarchical Scene Content Component
 * 分层级分段场景：目录树 + 分层级分段列表
 */

import React, { useMemo } from 'react';
import { useRagDetailStore } from '../../store/ragDetailStore';
import DirectoryTree from '../DirectoryTree';
import HierarchicalSegmentList from '../HierarchicalSegmentList';
import PdfViewer from '../PdfViewer';

interface HierarchicalSceneContentProps {
  showPdfViewer: boolean;
  loading: boolean;
}

const HierarchicalSceneContent: React.FC<HierarchicalSceneContentProps> = ({
  showPdfViewer,
  loading
}) => {
  const { fileName, directory, segments, togglePdfViewer } =
    useRagDetailStore();

  const hierarchicalSegments = useMemo(() => {
    return segments as any[];
  }, [segments]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-white">
      {/* 左侧PDF查看器 (33%) */}
      {showPdfViewer && (
        <div className="w-1/3 overflow-hidden border-r border-gray-200">
          <PdfViewer fileName={fileName} />
        </div>
      )}

      {/* 中间目录树 (33%) */}
      <div
        className={`${showPdfViewer ? 'w-1/3' : 'w-1/2'} flex flex-col border-r border-gray-200 bg-white`}
      >
        {/* 目录树头部 - 隐藏按钮 */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 bg-gray-50 px-4">
          <div className="text-sm font-medium text-gray-900">目录</div>
          <button
            onClick={togglePdfViewer}
            className="rounded px-3 py-1 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            {showPdfViewer ? '隐藏原文件' : '显示原文件'}
          </button>
        </div>

        {/* 目录树内容 */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {directory && directory.length > 0 ? (
            <DirectoryTree nodes={directory} />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">
              暂无目录
            </div>
          )}
        </div>
      </div>

      {/* 右侧分层级分段列表 (33%) */}
      <div
        className={`${showPdfViewer ? 'w-1/3' : 'w-1/2'} flex flex-col overflow-hidden`}
      >
        <HierarchicalSegmentList segments={hierarchicalSegments} />
      </div>
    </div>
  );
};

export default HierarchicalSceneContent;
