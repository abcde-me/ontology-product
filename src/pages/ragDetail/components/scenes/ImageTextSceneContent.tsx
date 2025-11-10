/**
 * Image-Text Scene Content Component
 * 图文混合场景：PDF + 图文混合分段列表
 */

import React, { useMemo } from 'react';
import { useRagDetailStore } from '../../store/ragDetailStore';
import PdfViewer from '../PdfViewer';
import ImageTextSegmentList from '../ImageTextSegmentList';
import ImageModal from '../ImageModal';

interface ImageTextSceneContentProps {
  showPdfViewer: boolean;
  loading: boolean;
}

const ImageTextSceneContent: React.FC<ImageTextSceneContentProps> = ({
  showPdfViewer,
  loading
}) => {
  const { fileName, segments } = useRagDetailStore();

  const imageTextSegments = useMemo(() => {
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
      {/* 左侧PDF查看器 */}
      {showPdfViewer && (
        <div className="w-1/2 overflow-hidden border-r border-gray-200">
          <PdfViewer fileName={fileName} />
        </div>
      )}

      {/* 右侧图文混合分段列表 */}
      <div
        className={`${showPdfViewer ? 'w-1/2' : 'w-full'} flex flex-col overflow-hidden`}
      >
        <ImageTextSegmentList segments={imageTextSegments} />
      </div>

      {/* 图片弹窗 */}
      <ImageModal />
    </div>
  );
};

export default ImageTextSceneContent;
