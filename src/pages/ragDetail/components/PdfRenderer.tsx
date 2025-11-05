import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// 配置worker - 使用unpkg CDN
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFCoordinate {
  page: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface PdfRendererProps {
  filePath: string;
  highlightCoordinates?: PDFCoordinate;
  onPageChange?: (pageNumber: number) => void;
  scale?: number;
}

/**
 * PDF渲染组件 - 使用react-pdf
 * 支持：
 * - 简单可靠的PDF渲染
 * - 自动处理worker
 * - 响应式缩放
 */
const PdfRenderer: React.FC<PdfRendererProps> = ({
  filePath,
  highlightCoordinates,
  onPageChange,
  scale = 1.5
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
    console.log('PDF loaded successfully, pages:', numPages);
  }

  function onDocumentLoadError(error: Error) {
    console.error('Error loading PDF:', error);
  }
  console.log('filePath', filePath);
  return (
    <div className="flex h-full w-full flex-col items-center overflow-y-auto bg-gray-100">
      <div className="w-full py-4">
        <Document
          file={{
            url: filePath
          }}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          options={{
            cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
            cMapPacked: true,
            standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`
          }}
          loading={
            <div className="flex h-full items-center justify-center bg-gray-50 py-20">
              <div className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
                <p className="text-gray-600">加载PDF中...</p>
              </div>
            </div>
          }
          error={
            <div className="flex h-full items-center justify-center bg-gray-50 py-20">
              <div className="text-center">
                <p className="mb-2 font-medium text-red-600">加载PDF失败</p>
                <p className="text-sm text-gray-600">文件路径: {filePath}</p>
              </div>
            </div>
          }
        >
          {Array.from(new Array(numPages), (el, index) => (
            <div key={`page_${index + 1}`} className="mb-4 flex justify-center">
              <Page
                pageNumber={index + 1}
                scale={scale}
                className="bg-white shadow-lg"
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            </div>
          ))}
        </Document>
      </div>
    </div>
  );
};

export default PdfRenderer;
