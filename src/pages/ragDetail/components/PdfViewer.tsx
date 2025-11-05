import React, { useState, useEffect } from 'react';
import { useRagDetailStore } from '../store/ragDetailStore';
import PdfRenderer from './PdfRenderer';

interface PDFCoordinate {
  page: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface PdfViewerProps {
  fileName?: string;
  filePath?: string;
  highlightCoordinate?: PDFCoordinate;
  hideHeader?: boolean;
}

const PdfViewer: React.FC<PdfViewerProps> = ({
  fileName: propFileName,
  filePath,
  highlightCoordinate,
  hideHeader = false
}) => {
  const { fileName: storeName } = useRagDetailStore();
  const [pdfPath, setPdfPath] = useState<string>('');

  useEffect(() => {
    // 如果提供了filePath，使用它；否则使用默认的PDF路径
    if (filePath) {
      setPdfPath(filePath);
    } else {
      // 使用在线PDF文件进行测试
      // 这是一个公开的示例PDF文件
      const samplePdf =
        'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf';
      setPdfPath(samplePdf);
      // setPdfPath('/modaforge/test.pdf');
      console.log('Using sample PDF:', samplePdf);
    }
  }, [filePath]);

  const displayFileName = propFileName || storeName || 'Document.pdf';

  if (!pdfPath) {
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
          filePath={pdfPath}
          highlightCoordinates={highlightCoordinate}
          scale={1.3}
        />
      </div>
    </div>
  );
};

export default PdfViewer;
