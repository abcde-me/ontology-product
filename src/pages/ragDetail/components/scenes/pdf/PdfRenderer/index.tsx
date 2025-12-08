import React, { useState, useCallback, useRef, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
import { Spin } from '@arco-design/web-react';
import styles from './PdfRenderer.module.scss';

// 配置worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface PDFCoordinate {
  page: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
}

interface PdfRendererProps {
  filePath?: string; // PDF文件URL路径
  pdfData?: ArrayBuffer; // PDF二进制数据
  highlightCoordinates?: PDFCoordinate[];
  onPageChange?: (pageNumber: number) => void;
  scale?: number;
  bgColor?: string; // 高亮背景色
  bgTransparency?: number; // 高亮透明度
}

/**
 * PDF渲染组件 - 使用pdfjs-dist和canvas
 * 支持：
 * - Canvas渲染PDF
 * - 高亮指定区域（使用pdf-preview的完善逻辑）
 * - 自动滚动到高亮位置
 * - 响应式重渲染
 * - 防止并发渲染
 */
const PdfRenderer: React.FC<PdfRendererProps> = ({
  pdfData,
  highlightCoordinates,
  onPageChange,
  scale: initialScale = 1.3,
  bgColor = 'rgba(255, 0, 0, 0.3)',
  bgTransparency = 0.3
}) => {
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [scale, setScale] = useState(initialScale);
  const [allRendered, setAllRendered] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement[]>([]);
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const originalImagesRef = useRef<Record<number, ImageData>>({});
  const busyPageSetRef = useRef<Set<number>>(new Set()); // 防止并发渲染
  const renderedPagesRef = useRef<Set<number>>(new Set()); // 已渲染页面
  const containerRef = useRef<HTMLDivElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const pendingScrollRef = useRef<Record<string, number[]> | null>(null);
  const fileUrlRef = useRef<string | null>(null);

  // 加载PDF文档
  useEffect(() => {
    if (!pdfData) return;

    let docURL: string | undefined;

    const loadPdf = async () => {
      setLoading(true);
      setTotalPages(0);
      setAllRendered(false);
      renderedPagesRef.current.clear();
      busyPageSetRef.current.clear();

      try {
        // 使用二进制数据加载PDF
        const blob = new Blob([pdfData], {
          type: 'application/octet-stream'
        });
        docURL = URL.createObjectURL(blob);
        fileUrlRef.current = docURL;

        const loadingTask = pdfjsLib.getDocument(docURL);
        const pdf = await loadingTask.promise;
        pdfDocRef.current = pdf;
        setTotalPages(pdf.numPages);
        originalImagesRef.current = {};
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
        fileUrlRef.current = null;
      }
    };
  }, [pdfData]);

  // 渲染单个页面 - 使用防并发机制
  const renderPage = useCallback(async (pageNum: number) => {
    if (!pdfDocRef.current) return;

    // 防止同一页重复并发渲染
    if (busyPageSetRef.current.has(pageNum)) return;
    busyPageSetRef.current.add(pageNum);

    try {
      const canvas = canvasRef.current[pageNum - 1];
      if (!canvas) return;

      const page = await pdfDocRef.current.getPage(pageNum);
      const rawViewport = page.getViewport({ scale: 1 });
      const containerWidth = divRef?.current?.offsetWidth || 0;
      const scaleFactor = containerWidth / rawViewport.width;
      const viewport = page.getViewport({ scale: scaleFactor });
      setScale(scaleFactor);

      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      ctx.imageSmoothingEnabled = false;
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: ctx, viewport }).promise;

      // 保存原始图像数据
      originalImagesRef.current[pageNum] = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );

      renderedPagesRef.current.add(pageNum);

      // 检测是否全部渲染完成
      if (
        pdfDocRef.current &&
        renderedPagesRef.current.size === pdfDocRef.current.numPages
      ) {
        setAllRendered(true);
      }
    } finally {
      busyPageSetRef.current.delete(pageNum);
    }
  }, []);

  // 渲染所有页面 - 使用 requestIdleCallback 优化性能
  useEffect(() => {
    if (!pdfDocRef.current || !totalPages) return;

    let current = 1;
    let cancelled = false;

    const schedule = (fn: () => void) => {
      const requestIdleCallback = (window as any).requestIdleCallback;
      if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(
          (deadline: any) => {
            if (cancelled) return;
            fn();
          },
          { timeout: 200 }
        );
      } else {
        requestAnimationFrame(() => {
          if (cancelled) return;
          fn();
        });
      }
    };

    const renderNextPage = () => {
      if (cancelled) return;
      if (current <= totalPages) {
        renderPage(current);
        current++;
        schedule(renderNextPage);
      }
    };

    schedule(renderNextPage);

    return () => {
      cancelled = true;
    };
  }, [totalPages, renderPage]);

  // 还原所有页面
  const restoreAllPages = useCallback(() => {
    if (!totalPages) return;
    for (let page = 1; page <= totalPages; page++) {
      const canvas = canvasRef.current[page - 1];
      const img = originalImagesRef.current[page];
      if (canvas && img) {
        const ctx = canvas.getContext('2d')!;
        ctx.putImageData(img, 0, 0);
      }
    }
  }, [totalPages]);

  // 滚动到第一个高亮框
  const scrollToFirstBox = useCallback((adjusted: Record<string, number[]>) => {
    const firstPage = Number(Object.keys(adjusted)[0]);
    const firstCanvas = canvasRef.current[firstPage - 1];
    if (firstCanvas && containerRef.current) {
      const [, y1] = adjusted[firstPage];
      const top = firstCanvas.offsetTop + y1;
      containerRef.current.scrollTo({ top, behavior: 'smooth' });
    }
  }, []);

  // 绘制高亮
  const paintHighlights = useCallback(
    (adjusted: Record<string, number[]>) => {
      Object.keys(adjusted).forEach((k) => {
        const pageNum = Number(k);
        const canvas = canvasRef.current[pageNum - 1];
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;
        const [x1, y1, x2, y2] = adjusted[k];
        const rectW = (x2 - x1) * scale;
        const rectH = (y2 - y1) * scale;
        const sx = x1 * scale;
        const sy = y1 * scale;
        ctx.save();
        ctx.globalAlpha = bgTransparency;
        ctx.fillStyle = bgColor;
        ctx.fillRect(sx, sy, rectW, rectH);
        ctx.restore();
      });
    },
    [scale, bgColor, bgTransparency]
  );

  // 应用滚动与高亮
  const applyScrollAndHighlight = useCallback(
    (adjusted: Record<string, number[]>) => {
      restoreAllPages();
      scrollToFirstBox(adjusted);
      paintHighlights(adjusted);
    },
    [restoreAllPages, scrollToFirstBox, paintHighlights]
  );

  // 高亮与滚动 - 支持 bbox 为空时仅定位不高亮
  useEffect(() => {
    if (
      !highlightCoordinates ||
      highlightCoordinates.length === 0 ||
      !totalPages
    ) {
      return;
    }

    // 将 PDFCoordinate[] 转换为 Record<string, number[]>
    const adjusted: Record<string, number[]> = {};
    highlightCoordinates.forEach((coord) => {
      const { page, x1, y1, x2, y2 } = coord;
      // 仅当 bbox 坐标都有效时才添加到高亮列表
      if (
        x1 !== undefined &&
        y1 !== undefined &&
        x2 !== undefined &&
        y2 !== undefined
      ) {
        adjusted[page.toString()] = [x1, y1, x2, y2];
      }
    });

    // 如果没有有效的高亮坐标，仅滚动到第一页
    if (Object.keys(adjusted).length === 0) {
      const firstPage = highlightCoordinates[0].page;
      const firstCanvas = canvasRef.current[firstPage - 1];
      if (firstCanvas && containerRef.current) {
        containerRef.current.scrollTo({
          top: firstCanvas.offsetTop,
          behavior: 'smooth'
        });
      }
      return;
    }

    if (!allRendered) {
      pendingScrollRef.current = adjusted;
      return;
    }

    applyScrollAndHighlight(adjusted);
  }, [highlightCoordinates, totalPages, allRendered, applyScrollAndHighlight]);

  // 全部渲染完成后的待处理
  useEffect(() => {
    if (!allRendered || !pendingScrollRef.current || !totalPages) return;
    const adjusted = pendingScrollRef.current;
    applyScrollAndHighlight(adjusted);
    pendingScrollRef.current = null;
  }, [allRendered, totalPages, applyScrollAndHighlight]);

  // ResizeObserver：容器宽度变化时重渲染已渲染的页面
  useEffect(() => {
    const el = divRef.current;
    if (!el || !('ResizeObserver' in window)) return;

    let lastWidth = el.offsetWidth;
    let timer: NodeJS.Timeout | null = null;

    const ro = new ResizeObserver(() => {
      const w = el.offsetWidth;
      if (Math.abs(w - lastWidth) < 2) return;
      lastWidth = w;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        if (!pdfDocRef.current) return;
        renderedPagesRef.current.forEach((pageNum) => {
          renderPage(pageNum);
        });
      }, 100);
    });

    ro.observe(el);
    return () => {
      ro.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [renderPage]);

  return (
    <div className="relative flex h-full bg-[#ffffff]" ref={divRef}>
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
              <p>无法加载文件，请检查数据格式</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PdfRenderer;
