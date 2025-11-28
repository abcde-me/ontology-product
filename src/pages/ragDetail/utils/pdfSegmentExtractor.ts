import * as pdfjsLib from 'pdfjs-dist';
import { PDFCoordinate, PDFSegmentInfo } from './pdfUtils';

/**
 * PDF文本项
 */
interface PDFTextItem {
  text: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  transform: number[];
}

/**
 * 从PDF提取文本项
 */
export const extractTextItemsFromPdf = async (
  pdf: any
): Promise<PDFTextItem[]> => {
  const items: PDFTextItem[] = [];

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
          height: item.height,
          transform: item.transform
        });
      }
    });
  }

  return items;
};

/**
 * 按段落分割文本
 * 根据换行符和空行来分割
 */
export const splitTextIntoParagraphs = (text: string): string[] => {
  return text
    .split(/\n\n+/)
    .map((para) => para.trim())
    .filter((para) => para.length > 0);
};

/**
 * 按句子分割文本
 */
export const splitTextIntoSentences = (text: string): string[] => {
  const sentences = text.match(/[^。！？\n]+[。！？\n]/g) || [];
  return sentences.map((s) => s.trim()).filter((s) => s.length > 0);
};

/**
 * 按字符数分割文本
 */
// @ts-ignore
export const splitTextByCharCount = (
  text: string,
  charCountPerSegment = 500
): string[] => {
  const segments: string[] = [];
  let currentSegment = '';

  for (let i = 0; i < text.length; i++) {
    currentSegment += text[i];

    if (currentSegment.length >= charCountPerSegment) {
      segments.push(currentSegment);
      currentSegment = '';
    }
  }

  if (currentSegment.length > 0) {
    segments.push(currentSegment);
  }

  return segments;
};

/**
 * 查找文本在PDF中的坐标
 */
export const findTextCoordinatesInPdf = (
  textItems: PDFTextItem[],
  searchText: string
): PDFCoordinate | null => {
  let startIndex = -1;
  let endIndex = -1;
  let currentText = '';

  // 查找匹配的文本范围
  for (let i = 0; i < textItems.length; i++) {
    currentText += textItems[i].text;

    if (currentText.includes(searchText)) {
      // 找到了匹配的文本
      const searchStartIndex = currentText.indexOf(searchText);
      const searchEndIndex = searchStartIndex + searchText.length;

      // 计算起始和结束的项索引
      let charCount = 0;
      for (let j = 0; j < textItems.length; j++) {
        if (charCount + textItems[j].text.length >= searchStartIndex) {
          startIndex = j;
          break;
        }
        charCount += textItems[j].text.length;
      }

      charCount = 0;
      for (let j = 0; j < textItems.length; j++) {
        if (charCount + textItems[j].text.length >= searchEndIndex) {
          endIndex = j;
          break;
        }
        charCount += textItems[j].text.length;
      }

      if (startIndex !== -1 && endIndex !== -1) {
        const startItem = textItems[startIndex];
        const endItem = textItems[endIndex];

        return {
          page: startItem.page,
          x1: Math.min(startItem.x, endItem.x),
          y1: Math.min(startItem.y, endItem.y),
          x2: Math.max(
            startItem.x + startItem.width,
            endItem.x + endItem.width
          ),
          y2: Math.max(
            startItem.y + startItem.height,
            endItem.y + endItem.height
          )
        };
      }
    }
  }

  return null;
};

/**
 * 从PDF生成分段
 */
export const generateSegmentsFromPdf = async (
  pdf: any,
  segmentationMethod: 'paragraph' | 'sentence' | 'charCount' = 'charCount',
  // @ts-ignore
  charCountPerSegment = 500
): Promise<PDFSegmentInfo[]> => {
  try {
    // 提取所有文本
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join('');
      fullText += pageText + '\n';
    }

    // 分割文本
    let segments: string[] = [];
    switch (segmentationMethod) {
      case 'paragraph':
        segments = splitTextIntoParagraphs(fullText);
        break;
      case 'sentence':
        segments = splitTextIntoSentences(fullText);
        break;
      case 'charCount':
      default:
        segments = splitTextByCharCount(fullText, charCountPerSegment);
        break;
    }

    // 提取文本项用于坐标计算
    const textItems = await extractTextItemsFromPdf(pdf);

    // 生成分段信息
    const segmentInfos: PDFSegmentInfo[] = segments.map((content, index) => {
      const coordinates = findTextCoordinatesInPdf(textItems, content);

      return {
        id: `seg_${String(index + 1).padStart(3, '0')}`,
        content,
        charCount: content.length,
        coordinates: coordinates || {
          page: 1,
          x1: 0,
          y1: 0,
          x2: 100,
          y2: 100
        },
        pageNumber: coordinates?.page || 1
      };
    });

    return segmentInfos;
  } catch (error) {
    console.error('Failed to generate segments from PDF:', error);
    throw error;
  }
};

/**
 * 从PDF提取文本
 */
export const extractFullTextFromPdf = async (pdf: any): Promise<string> => {
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
    console.error('Failed to extract full text from PDF:', error);
    throw error;
  }
};
