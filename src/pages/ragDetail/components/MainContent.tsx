import React from 'react';
import { useRagDetailStore } from '../store/ragDetailStore';
import PdfViewer from './PdfViewer';
import SegmentList from './SegmentList';

const MainContent: React.FC = () => {
  const { showPdfViewer, loading, highlightedPdfCoordinate } =
    useRagDetailStore();

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left side - PDF Viewer */}
      {showPdfViewer && (
        <div className="flex-1 overflow-hidden border-r border-gray-200">
          <PdfViewer highlightCoordinate={highlightedPdfCoordinate} />
        </div>
      )}

      {/* Right side - Segment List */}
      <div className={`${showPdfViewer ? 'w-1/2' : 'w-full'} overflow-hidden`}>
        <SegmentList />
      </div>
    </div>
  );
};

export default MainContent;
