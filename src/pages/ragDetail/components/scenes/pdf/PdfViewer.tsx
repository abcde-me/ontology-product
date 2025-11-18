import React, { useState, useEffect, useMemo } from 'react';
import { useRagDetailStore } from '../../../store/ragDetailStore';
import PdfRenderer from './PdfRenderer';
import { PDFCoordinate } from '../../../types';
import { getFileBinaryData } from '@/api/modules/rag';

interface PdfViewerProps {
  fileName?: string;
  highlightCoordinates?: PDFCoordinate[];
  hideHeader?: boolean;
}

const PdfViewer: React.FC<PdfViewerProps> = ({
  fileName: propFileName,
  highlightCoordinates,
  hideHeader = false
}) => {
  const { fileName: storeName, highlightedPdfCoordinates } =
    useRagDetailStore();
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPdf = async () => {
      setLoading(true);
      setPdfData(null);

      try {
        const response = await getFileBinaryData();
        setPdfData(response as ArrayBuffer);
      } catch (error) {
        console.error('❌ 加载PDF失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPdf();
  }, []);

  const displayFileName = propFileName || storeName || 'Document.pdf';

  // 使用props传入的坐标或store中的坐标
  const coordinates = highlightCoordinates || highlightedPdfCoordinates;

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">加载PDF中...</p>
        </div>
      </div>
    );
  }

  if (!pdfData) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">未找到PDF文件</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col">
      {/* PDF头部 - 文件名（可选） */}
      {!hideHeader && (
        <div className="flex h-[56px] items-center border-b border-gray-200 px-5">
          <span className="text-[14px] font-medium text-gray-900">
            {displayFileName}
          </span>
        </div>
      )}

      {/* PDF内容 */}
      <div className="flex-1 overflow-auto bg-[#F7F8FA]">
        <PdfRenderer
          pdfData={pdfData}
          highlightCoordinates={coordinates}
          scale={1.3}
        />
      </div>
    </div>
  );
};

export default PdfViewer;
