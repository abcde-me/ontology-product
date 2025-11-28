import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './components/common/Header';
import SceneRouter from './components/SceneRouter';
import ImageModal from './components/common/ImageModal';
import SegmentDrawer from './components/drawers/SegmentDrawer';
import { useRagDetailStore } from './store/ragDetailStore';
import './styles/index.css';

function RagDetail() {
  const location = useLocation();
  const {
    initializeRagDetail,
    sceneType,
    showPdfViewer,
    loading,
    segmentDrawerVisible,
    segmentDrawerTab,
    segmentDrawerSegmentId,
    closeSegmentDrawer,
    segments,
    datasetId
  } = useRagDetailStore();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const datasetId = queryParams.get('datasetId');
    const documentId = queryParams.get('documentId');
    const bucketName = queryParams.get('bucketName');
    const path = queryParams.get('path');
    const datasetName = queryParams.get('datasetName');
    // 保留 ragId 以支持旧的 URL 格式
    const ragId = queryParams.get('ragId');
    // 新增：从 URL 获取 chunkId 和 positions 用于初始定位
    const chunkId = queryParams.get('chunkId');
    const positionsStr = queryParams.get('positions');

    if (datasetId && documentId) {
      initializeRagDetail(
        Number(datasetId),
        documentId,
        bucketName,
        path,
        datasetName,
        chunkId, // 新增
        positionsStr // 新增
      );
    }
  }, [location, initializeRagDetail]);

  // 获取当前打开 drawer 的分段信息
  const currentSegment = segments.find(
    (seg) => seg.id === segmentDrawerSegmentId
  );

  return (
    <div
      className="rag-detail-page flex h-screen w-full flex-col overflow-hidden bg-[#EFF6FE]"
      style={{ minHeight: 0 }}
    >
      <Header />
      <div
        className="flex-1 overflow-hidden px-4 pb-4"
        style={{ minHeight: 0 }}
      >
        <div
          className="h-full overflow-hidden rounded-[20px] bg-white"
          style={{ minHeight: 0 }}
        >
          <SceneRouter
            sceneType={sceneType}
            showPdfViewer={showPdfViewer}
            loading={loading}
          />
        </div>
      </div>
      {/* 图片放大弹窗 */}
      <ImageModal />
      {/* 分段详情/溯源日志抽屉 */}
      {currentSegment && (
        <SegmentDrawer
          visible={segmentDrawerVisible}
          onClose={closeSegmentDrawer}
          defaultActiveTab={segmentDrawerTab}
          currentSegmentIndex={currentSegment.segmentIndex}
          totalSegments={segments.length}
          datasetId={datasetId ?? undefined}
          chunkId={currentSegment.id}
          segments={segments}
        />
      )}
    </div>
  );
}

export default RagDetail;
