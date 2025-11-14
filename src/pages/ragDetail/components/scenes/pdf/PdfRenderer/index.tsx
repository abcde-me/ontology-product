import React, { useState, useCallback, useRef, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
import { Spin } from '@arco-design/web-react';
import styles from './PdfRenderer.module.scss';

// 配置worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface PDFCoordinate {
  page: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface PdfRendererProps {
  filePath?: string; // PDF文件URL路径
  pdfData?: ArrayBuffer; // PDF二进制数据
  highlightCoordinates?: PDFCoordinate[];
  onPageChange?: (pageNumber: number) => void;
  scale?: number;
}

/**
 * PDF渲染组件 - 使用pdfjs-dist和canvas
 * 支持：
 * - Canvas渲染PDF
 * - 高亮指定区域
 * - 自动滚动到高亮位置
 */
const PdfRenderer: React.FC<PdfRendererProps> = ({
  filePath,
  pdfData,
  highlightCoordinates,
  onPageChange,
  scale = 1.3
}) => {
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const BACKGROUND_COLOR = `rgba(255, 0, 0, 0.3)`;
  const canvasRef = useRef<HTMLCanvasElement[]>([]);
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const originalImagesRef = useRef<{ [page: number]: ImageData }>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const divRef = useRef<HTMLDivElement>(null);

  // 加载PDF文档
  useEffect(() => {
    if (filePath || pdfData) {
      let docURL: string | undefined;

      const loadPdf = async () => {
        setLoading(true);
        setTotalPages(0);
        try {
          let loadingTask: pdfjsLib.PDFDocumentLoadingTask | undefined;

          if (pdfData) {
            // 使用二进制数据加载PDF
            console.log(
              '📄 使用二进制数据加载PDF, 大小:',
              pdfData.byteLength,
              'bytes'
            );
            const blob = new Blob([pdfData], { type: 'application/pdf' });
            docURL = URL.createObjectURL(blob);
            loadingTask = pdfjsLib.getDocument(docURL);
          } else if (filePath) {
            // 使用URL加载PDF
            console.log('📄 使用URL加载PDF:', filePath);
            loadingTask = pdfjsLib.getDocument(filePath);
          }

          if (loadingTask) {
            console.log('tttt');
            const pdf = await loadingTask.promise;
            pdfDocRef.current = pdf;
            console.log('pdfddd', pdf);
            setTotalPages(pdf.numPages);
            originalImagesRef.current = {};
            console.log('✅ PDF加载成功! 总页数:', pdf.numPages);
          }
          setLoading(false);
        } catch (error) {
          console.error('❌ Error loading PDF:', error);
          setTotalPages(0);
          setLoading(false);
        }
      };
      loadPdf();

      // Cleanup: 释放 Object URL
      return () => {
        if (docURL) {
          URL.revokeObjectURL(docURL);
        }
      };
    }
  }, [filePath, pdfData]);

  // 渲染单个页面
  const renderPage = useCallback(
    async (pageNum: number) => {
      if (!pdfDocRef.current || !canvasRef.current[pageNum - 1]) return;

      const page = await pdfDocRef.current.getPage(pageNum);
      const viewport = page.getViewport({ scale });

      const canvas = canvasRef.current[pageNum - 1];
      if (canvas) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
        ctx.imageSmoothingEnabled = false;

        const containerWidth = divRef?.current?.offsetWidth || 0;
        const maxWidth = containerWidth * 1;
        const scaleFactor = maxWidth / viewport.width;
        const newViewport = page.getViewport({ scale: scaleFactor });

        canvas.height = newViewport.height;
        canvas.width = newViewport.width;

        await page.render({ canvasContext: ctx, viewport: newViewport })
          .promise;

        // 保存原始图像数据
        originalImagesRef.current[pageNum] = ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );
      }
    },
    [scale]
  );

  // 渲染所有页面
  useEffect(() => {
    if (totalPages > 0 && pdfDocRef.current) {
      let currentPage = 1;
      const renderNextPage = () => {
        if (currentPage <= totalPages) {
          renderPage(currentPage);
          currentPage += 1;
          requestAnimationFrame(renderNextPage);
        }
      };
      requestAnimationFrame(renderNextPage);

      return () => {
        currentPage = totalPages + 1;
      };
    }
  }, [totalPages, renderPage]);

  // 高亮指定坐标
  useEffect(() => {
    if (
      highlightCoordinates &&
      highlightCoordinates.length > 0 &&
      totalPages > 0
    ) {
      // 清空所有高亮
      for (let page = 1; page <= totalPages; page++) {
        const canvas = canvasRef.current[page - 1];
        if (canvas && originalImagesRef.current[page]) {
          const ctx = canvas.getContext('2d')!;
          ctx.putImageData(originalImagesRef.current[page], 0, 0);
        }
      }

      // 获取第一个坐标用于滚动
      const firstCoord = highlightCoordinates[0];
      const firstPageNum = firstCoord.page;

      // 绘制所有高亮区域
      highlightCoordinates.forEach((coord) => {
        const pageNumber = coord.page;
        const targetCanvas = canvasRef.current[pageNumber - 1];

        if (targetCanvas && originalImagesRef.current[pageNumber]) {
          const { x1, y1, x2, y2 } = coord;
          const width = x2 - x1;
          const height = y2 - y1;

          const ctx = targetCanvas.getContext('2d')!;
          ctx.save();
          ctx.globalAlpha = 0.3;
          ctx.fillStyle = BACKGROUND_COLOR;
          ctx.fillRect(x1, y1, width, height);
          ctx.restore();
        }
      });

      // 滚动到第一个高亮位置
      const firstCanvas = canvasRef.current[firstPageNum - 1];
      if (firstCanvas && containerRef.current) {
        const targetOffset = firstCanvas.offsetTop + firstCoord.y1;
        containerRef.current.scrollTo({
          top: targetOffset,
          behavior: 'smooth'
        });
      }
    }
  }, [highlightCoordinates, totalPages]);

  return (
    <div className="relative flex h-full bg-[#f0f2f5]" ref={divRef}>
      {loading ? (
        <div className="absolute z-10 flex h-full w-full items-center justify-center">
          <Spin tip="文档加载中..."></Spin>
        </div>
      ) : (
        <div className="flex flex-1 flex-col">
          {totalPages > 0 ? (
            <div
              className={`flex-1 overflow-auto bg-white ${styles.pdfContainer}`}
              ref={containerRef}
            >
              {[...Array(totalPages)].map((_, index) => (
                <canvas
                  className="w-full"
                  key={index}
                  ref={(el) => (canvasRef.current[index] = el!)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-gray-600">
              <p>无法加载PDF文件，请检查文件路径</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PdfRenderer;
