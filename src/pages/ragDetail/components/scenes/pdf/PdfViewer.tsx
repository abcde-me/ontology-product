import React, { useState, useEffect } from 'react';
import { useRagDetailStore } from '../../../store/ragDetailStore';
import PdfRenderer from './PdfRenderer';
import { PDFCoordinate } from '../../../types';
import { mockApiGetPdfBinaryData } from '../../../utils/mockPdfData';

interface PdfViewerProps {
  fileName?: string;
  filePath?: string;
  pdfData?: ArrayBuffer; // 支持直接传入二进制数据
  highlightCoordinates?: PDFCoordinate[];
  hideHeader?: boolean;
  useMockBinaryData?: boolean; // 是否使用mock二进制数据
}

const PdfViewer: React.FC<PdfViewerProps> = ({
  fileName: propFileName,
  filePath,
  pdfData: propPdfData,
  highlightCoordinates,
  hideHeader = false,
  useMockBinaryData = false
}) => {
  const { fileName: storeName, highlightedPdfCoordinates } =
    useRagDetailStore();
  const [pdfPath, setPdfPath] = useState<string>('');
  const [pdfBinaryData, setPdfBinaryData] = useState<ArrayBuffer | undefined>(
    propPdfData
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPdf = async () => {
      if (useMockBinaryData) {
        // 使用mock二进制数据
        setLoading(true);
        try {
          const binaryData = await mockApiGetPdfBinaryData(
            'mock-dataset',
            'mock-document'
          );
          setPdfBinaryData(binaryData);
          console.log('Loaded mock PDF binary data');
        } catch (error) {
          console.error('Error loading mock PDF binary data:', error);
        } finally {
          setLoading(false);
        }
      } else if (filePath) {
        // 使用URL路径
        setPdfPath(filePath);
        console.log('Using PDF path:', filePath);
      } else if (!propPdfData) {
        // 默认使用在线PDF文件进行测试
        const samplePdf =
          'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf';
        setPdfPath(samplePdf);
        console.log('Using sample PDF:', samplePdf);
      }
    };

    loadPdf();
  }, [filePath, propPdfData, useMockBinaryData]);

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

  if (!pdfPath && !pdfBinaryData) {
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
          pdfData={pdfBinaryData}
          highlightCoordinates={coordinates}
          scale={1.3}
        />
      </div>
    </div>
  );
};

export default PdfViewer;
