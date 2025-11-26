import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore - worker entry doesn't have types
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';

// 设置worker路径 - 使用webpack打包的worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * PDF坐标信息
 * 支持 bbox 为空的情况：仅定位到页面，不高亮
 */
export interface PDFCoordinate {
  page: number; // 页码（1-based）
  x1?: number; // 左上角X坐标（可选，为空时仅定位不高亮）
  y1?: number; // 左上角Y坐标（可选，为空时仅定位不高亮）
  x2?: number; // 右下角X坐标（可选，为空时仅定位不高亮）
  y2?: number; // 右下角Y坐标（可选，为空时仅定位不高亮）
}

/**
 * PDF分段信息
 */
export interface PDFSegmentInfo {
  id: string;
  content: string;
  charCount: number;
  coordinates: PDFCoordinate;
  pageNumber: number;
}

/**
 * 加载PDF文件
 */
export const loadPdfFile = async (filePath: string): Promise<any> => {
  try {
    console.log('Loading PDF from:', filePath);

    // 使用fetch获取PDF文件
    const response = await fetch(filePath);

    // 检查响应是否成功
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 获取arraybuffer
    const arrayBuffer = await response.arrayBuffer();

    // 创建Blob并生成URL（与项目中其他地方的做法一致）
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    const docURL = URL.createObjectURL(blob);

    // 使用URL加载PDF
    const loadingTask = pdfjsLib.getDocument(docURL);
    const pdf = await loadingTask.promise;

    console.log('PDF loaded successfully, pages:', pdf.numPages);
    return pdf;
  } catch (error) {
    console.error('Failed to load PDF:', error);
    throw error;
  }
};

/**
 * 从URL加载PDF
 */
export const loadPdfFromUrl = async (url: string): Promise<any> => {
  try {
    const loadingTask = pdfjsLib.getDocument(url);
    const pdf = await loadingTask.promise;
    return pdf;
  } catch (error) {
    console.error('Failed to load PDF from URL:', error);
    throw error;
  }
};

/**
 * 从Blob加载PDF
 */
export const loadPdfFromBlob = async (blob: Blob): Promise<any> => {
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    return pdf;
  } catch (error) {
    console.error('Failed to load PDF from Blob:', error);
    throw error;
  }
};

/**
 * 渲染PDF页面到Canvas
 */
export const renderPageToCanvas = async (
  pdf: any,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  scale = 1.5
): Promise<void> => {
  try {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale });

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('Failed to get canvas context');

    await page.render({
      canvasContext: context,
      viewport
    }).promise;
  } catch (error) {
    console.error(`Failed to render page ${pageNumber}:`, error);
    throw error;
  }
};

/**
 * 提取PDF文本
 */
export const extractPdfText = async (pdf: any): Promise<string> => {
  try {
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join('');
      fullText += pageText + '\n';
    }

    return fullText;
  } catch (error) {
    console.error('Failed to extract PDF text:', error);
    throw error;
  }
};

/**
 * 提取PDF文本和坐标信息
 */
export const extractPdfTextWithCoordinates = async (
  pdf: any
): Promise<
  Array<{
    text: string;
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
  }>
> => {
  try {
    const items: Array<any> = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      textContent.items.forEach((item: any) => {
        if (item.str && item.str.trim()) {
          items.push({
            text: item.str,
            page: i,
            x: item.transform[4],
            y: item.transform[5],
            width: item.width,
            height: item.height
          });
        }
      });
    }

    return items;
  } catch (error) {
    console.error('Failed to extract PDF text with coordinates:', error);
    throw error;
  }
};

/**
 * 获取PDF页面信息
 */
export const getPdfPageInfo = async (
  pdf: any,
  pageNumber: number
): Promise<{ width: number; height: number }> => {
  try {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1 });
    return {
      width: viewport.width,
      height: viewport.height
    };
  } catch (error) {
    console.error(`Failed to get page info for page ${pageNumber}:`, error);
    throw error;
  }
};

/**
 * 保存Canvas原始图像数据（用于高亮恢复）
 */
export const saveCanvasImageData = (
  canvas: HTMLCanvasElement
): ImageData | null => {
  try {
    const context = canvas.getContext('2d');
    if (!context) return null;
    return context.getImageData(0, 0, canvas.width, canvas.height);
  } catch (error) {
    console.error('Failed to save canvas image data:', error);
    return null;
  }
};

/**
 * 恢复Canvas原始图像
 */
export const restoreCanvasImageData = (
  canvas: HTMLCanvasElement,
  imageData: ImageData
): void => {
  try {
    const context = canvas.getContext('2d');
    if (!context) return;
    context.putImageData(imageData, 0, 0);
  } catch (error) {
    console.error('Failed to restore canvas image data:', error);
  }
};

/**
 * 在Canvas上绘制高亮矩形
 */
export const drawHighlightRect = (
  canvas: HTMLCanvasElement,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color = '#FF0000',
  alpha = 0.3
): void => {
  try {
    const context = canvas.getContext('2d');
    if (!context) return;

    const width = x2 - x1;
    const height = y2 - y1;

    context.save();
    context.globalAlpha = alpha;
    context.fillStyle = color;
    context.fillRect(x1, y1, width, height);
    context.restore();
  } catch (error) {
    console.error('Failed to draw highlight rect:', error);
  }
};

/**
 * 清除Canvas高亮
 */
export const clearCanvasHighlight = (
  canvas: HTMLCanvasElement,
  imageData: ImageData
): void => {
  restoreCanvasImageData(canvas, imageData);
};

/**
 * 计算文本在PDF中的坐标范围
 * 这是一个简化版本，实际应该根据PDF的文本布局来计算
 */
export const calculateTextCoordinates = (
  textItems: Array<any>,
  startIndex: number,
  endIndex: number
): PDFCoordinate | null => {
  if (startIndex < 0 || endIndex >= textItems.length) {
    return null;
  }

  const startItem = textItems[startIndex];
  const endItem = textItems[endIndex];

  if (!startItem || !endItem) {
    return null;
  }

  return {
    page: startItem.page,
    x1: Math.min(startItem.x, endItem.x),
    y1: Math.min(startItem.y, endItem.y),
    x2: Math.max(startItem.x + startItem.width, endItem.x + endItem.width),
    y2: Math.max(startItem.y + startItem.height, endItem.y + endItem.height)
  };
};
