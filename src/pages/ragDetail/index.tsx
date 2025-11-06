import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './components/Header';
import SceneRouter from './components/SceneRouter';
import ImageModal from './components/ImageModal';
import { useRagDetailStore } from './store/ragDetailStore';
import './styles/index.css';

function RagDetail() {
  const location = useLocation();
  const { initializeRagDetail, sceneType, showPdfViewer, loading } =
    useRagDetailStore();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const ragId = queryParams.get('ragId');
    if (ragId) {
      initializeRagDetail(ragId);
    }
  }, [location, initializeRagDetail]);

  return (
    <div
      className="rag-detail-page flex h-screen w-full flex-col overflow-hidden bg-[#F7F8FA]"
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
    </div>
  );
}

export default RagDetail;
