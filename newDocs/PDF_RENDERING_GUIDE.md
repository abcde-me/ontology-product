# PDF渲染和高亮功能实现指南

## 概述

本文档详细说明了如何在RAG分段列表中实现PDF渲染、高亮和分段联动功能。

---

## 功能特性

### 1. PDF渲染
- ✅ 使用pdf.js库进行PDF渲染
- ✅ 支持大文件优化（虚拟滚动）
- ✅ Canvas渲染，性能优化
- ✅ 支持多页PDF
- ✅ 平滑滚动

### 2. PDF高亮
- ✅ 点击分段时高亮PDF对应内容
- ✅ 使用Canvas绘制高亮矩形
- ✅ 支持多页高亮
- ✅ 自动滚动到高亮位置
- ✅ 高亮颜色可配置

### 3. 分段联动
- ✅ 点击分段时高亮PDF
- ✅ PDF自动滚动到高亮位置
- ✅ 支持分段编辑
- ✅ 支持分段选中状态

---

## 核心组件

### 1. PdfRenderer 组件

**位置**: `src/pages/ragDetail/components/PdfRenderer.tsx`

**功能**:
- 渲染PDF到Canvas
- 支持虚拟滚动（只渲染可见页面）
- 处理PDF高亮
- 管理Canvas原始图像数据

**Props**:
```typescript
interface PdfRendererProps {
  filePath: string;                    // PDF文件路径
  highlightCoordinates?: PDFCoordinate; // 高亮坐标
  onPageChange?: (pageNumber: number) => void; // 页码变化回调
  scale?: number;                      // 缩放比例（默认1.5）
}
```

**使用示例**:
```typescript
<PdfRenderer
  filePath="/rag/document.pdf"
  highlightCoordinates={highlightCoordinate}
  scale={1.5}
/>
```

### 2. PdfViewer 组件

**位置**: `src/pages/ragDetail/components/PdfViewer.tsx`

**功能**:
- 包装PdfRenderer
- 提供PDF查看器UI
- 显示文件名和信息

**Props**:
```typescript
interface PdfViewerProps {
  fileName?: string;                   // 文件名
  filePath?: string;                   // 文件路径
  highlightCoordinate?: PDFCoordinate;  // 高亮坐标
}
```

---

## 工具函数

### 1. pdfUtils.ts

**位置**: `src/pages/ragDetail/utils/pdfUtils.ts`

**主要函数**:

#### 加载PDF
```typescript
// 从文件路径加载
const pdf = await loadPdfFile('/path/to/file.pdf');

// 从URL加载
const pdf = await loadPdfFromUrl('https://example.com/file.pdf');

// 从Blob加载
const pdf = await loadPdfFromBlob(blob);
```

#### 渲染页面
```typescript
await renderPageToCanvas(pdf, pageNumber, canvas, scale);
```

#### 提取文本
```typescript
const text = await extractPdfText(pdf);
const itemsWithCoords = await extractPdfTextWithCoordinates(pdf);
```

#### 高亮操作
```typescript
// 保存原始图像
const imageData = saveCanvasImageData(canvas);

// 绘制高亮
drawHighlightRect(canvas, x1, y1, x2, y2, '#FF0000', 0.3);

// 恢复原始图像
clearCanvasHighlight(canvas, imageData);
```

### 2. pdfSegmentExtractor.ts

**位置**: `src/pages/ragDetail/utils/pdfSegmentExtractor.ts`

**主要函数**:

#### 提取文本项
```typescript
const items = await extractTextItemsFromPdf(pdf);
```

#### 分割文本
```typescript
// 按段落分割
const paragraphs = splitTextIntoParagraphs(text);

// 按句子分割
const sentences = splitTextIntoSentences(text);

// 按字符数分割
const segments = splitTextByCharCount(text, 500);
```

#### 查找文本坐标
```typescript
const coordinate = findTextCoordinatesInPdf(textItems, searchText);
```

#### 生成分段
```typescript
const segments = await generateSegmentsFromPdf(
  pdf,
  'charCount',  // 分割方法
  500           // 每个分段的字符数
);
```

---

## 数据结构

### PDFCoordinate

```typescript
interface PDFCoordinate {
  page: number;      // 页码（1-based）
  x1: number;        // 左上角X坐标
  y1: number;        // 左上角Y坐标
  x2: number;        // 右下角X坐标
  y2: number;        // 右下角Y坐标
}
```

### Segment（扩展）

```typescript
interface Segment {
  id: string;
  content: string;
  charCount: number;
  segmentIndex: number;
  createdAt: string;
  updatedAt: string;
  pdfCoordinate?: PDFCoordinate;  // PDF中的坐标信息
}
```

---

## Store状态管理

### 新增状态

```typescript
// PDF高亮坐标
highlightedPdfCoordinate?: PDFCoordinate;
```

### 新增Actions

```typescript
// 高亮PDF分段
highlightPdfSegment: (segmentId: string) => void;

// 清除PDF高亮
clearPdfHighlight: () => void;
```

### 使用示例

```typescript
const { highlightedPdfCoordinate, highlightPdfSegment } = useRagDetailStore();

// 点击分段时高亮PDF
const handleSegmentClick = (segmentId: string) => {
  highlightPdfSegment(segmentId);
};
```

---

## 工作流程

### 1. 初始化流程

```
1. 页面加载
   ↓
2. 从URL获取ragId
   ↓
3. 调用API获取RAG数据（包含分段和PDF坐标）
   ↓
4. Store初始化
   ↓
5. PdfRenderer加载PDF文件
   ↓
6. 渲染第一页
```

### 2. 分段高亮流程

```
1. 用户点击分段卡片
   ↓
2. SegmentCard调用highlightPdfSegment()
   ↓
3. Store更新highlightedPdfCoordinate
   ↓
4. MainContent传递坐标给PdfViewer
   ↓
5. PdfRenderer接收坐标
   ↓
6. 恢复原始图像
   ↓
7. 绘制高亮矩形
   ↓
8. 滚动到高亮位置
```

---

## 性能优化

### 1. 虚拟滚动

只渲染可见的页面，减少内存占用：

```typescript
// 计算可见页面
const newVisiblePages: number[] = [];
for (let i = 0; i < totalPages; i++) {
  const canvas = canvasRefs.current[i];
  if (!canvas) continue;

  const canvasTop = canvas.offsetTop;
  const canvasBottom = canvasTop + canvas.offsetHeight;

  if (canvasBottom >= scrollTop - containerHeight && 
      canvasTop <= scrollTop + containerHeight * 2) {
    newVisiblePages.push(i + 1);
  }
}
```

### 2. Canvas优化

- 使用`willReadFrequently: true`优化Canvas读取
- 禁用图像平滑以提高性能
- 保存原始图像数据以快速恢复

### 3. 内存管理

- 使用Map存储Canvas图像数据
- 及时清理不需要的数据
- 避免重复渲染

---

## Mock数据

### 分段坐标示例

```typescript
{
  id: 'seg_001',
  content: '分段内容...',
  charCount: 500,
  segmentIndex: 1,
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-15T10:30:00Z',
  pdfCoordinate: {
    page: 1,
    x1: 50,
    y1: 100,
    x2: 550,
    y2: 250
  }
}
```

### 坐标说明

- `page`: PDF页码（从1开始）
- `x1, y1`: 高亮矩形的左上角坐标
- `x2, y2`: 高亮矩形的右下角坐标
- 坐标单位：像素（相对于Canvas）

---

## 集成真实API

### 1. 修改API接口

```typescript
// src/pages/ragDetail/api/ragDetailApi.ts

export const fetchRagDetail = async (ragId: string): Promise<RagDetailData> => {
  const response = await fetch(`/api/rag/detail/${ragId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch RAG detail');
  }
  
  const data = await response.json();
  return data;
};
```

### 2. 后端返回格式

```json
{
  "ragId": "1001",
  "fileName": "document.pdf",
  "filePath": "/path/to/document.pdf",
  "sceneType": "text",
  "segments": [
    {
      "id": "seg_001",
      "content": "...",
      "charCount": 500,
      "segmentIndex": 1,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z",
      "pdfCoordinate": {
        "page": 1,
        "x1": 50,
        "y1": 100,
        "x2": 550,
        "y2": 250
      }
    }
  ]
}
```

---

## 常见问题

### Q: 如何自动生成PDF坐标？

A: 使用`generateSegmentsFromPdf()`函数自动提取PDF文本并生成坐标：

```typescript
const segments = await generateSegmentsFromPdf(pdf, 'charCount', 500);
```

### Q: 如何支持多页高亮？

A: 高亮功能已支持多页，只需在坐标中指定正确的`page`值。

### Q: 如何优化大文件性能？

A: 使用虚拟滚动，只渲染可见页面。PdfRenderer已内置此功能。

### Q: 如何修改高亮颜色？

A: 修改`drawHighlightRect()`函数的`color`参数：

```typescript
drawHighlightRect(canvas, x1, y1, x2, y2, '#00FF00', 0.3);
```

---

## 相关文件

- `src/pages/ragDetail/components/PdfRenderer.tsx` - PDF渲染组件
- `src/pages/ragDetail/components/PdfViewer.tsx` - PDF查看器
- `src/pages/ragDetail/utils/pdfUtils.ts` - PDF工具函数
- `src/pages/ragDetail/utils/pdfSegmentExtractor.ts` - 文本提取工具
- `src/pages/ragDetail/store/ragDetailStore.ts` - 状态管理
- `src/pages/ragDetail/types/index.ts` - 类型定义

---

## 总结

✅ 完整的PDF渲染功能
✅ 高效的虚拟滚动
✅ 灵活的高亮系统
✅ 完善的文本提取工具
✅ 易于集成真实API


