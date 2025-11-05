# PDF渲染和高亮功能 - 实现总结

## 实现时间
2024年

## 功能完成情况

### ✅ 已完成的功能

#### 1. PDF渲染
- ✅ 使用pdf.js库加载和渲染PDF
- ✅ Canvas渲染，支持多页PDF
- ✅ 虚拟滚动优化，只渲染可见页面
- ✅ 支持缩放（默认1.5倍）
- ✅ 平滑滚动到指定位置

#### 2. PDF高亮
- ✅ Canvas高亮绘制（红色半透明矩形）
- ✅ 点击分段时自动高亮PDF对应内容
- ✅ 支持多页高亮
- ✅ 自动滚动到高亮位置
- ✅ 高亮后可恢复原始图像

#### 3. 分段联动
- ✅ 点击分段卡片时高亮PDF
- ✅ PDF自动滚动到高亮位置
- ✅ 分段选中状态管理
- ✅ 支持分段编辑

#### 4. 文本提取
- ✅ 从PDF提取全文
- ✅ 提取文本项及其坐标
- ✅ 按段落/句子/字符数分割文本
- ✅ 查找文本在PDF中的坐标

#### 5. 数据结构
- ✅ 添加PDFCoordinate类型
- ✅ 扩展Segment类型支持pdfCoordinate
- ✅ 完整的类型定义

---

## 创建的文件

### 核心组件

1. **PdfRenderer.tsx** (新建)
   - PDF渲染组件
   - 虚拟滚动实现
   - Canvas高亮管理
   - 位置: `src/pages/ragDetail/components/PdfRenderer.tsx`

2. **PdfViewer.tsx** (修改)
   - 包装PdfRenderer
   - 提供UI界面
   - 位置: `src/pages/ragDetail/components/PdfViewer.tsx`

### 工具函数

3. **pdfUtils.ts** (新建)
   - PDF加载函数
   - Canvas渲染函数
   - 文本提取函数
   - 高亮绘制函数
   - 位置: `src/pages/ragDetail/utils/pdfUtils.ts`

4. **pdfSegmentExtractor.ts** (新建)
   - 文本项提取
   - 文本分割函数
   - 坐标计算函数
   - 分段生成函数
   - 位置: `src/pages/ragDetail/utils/pdfSegmentExtractor.ts`

### 类型定义

5. **types/index.ts** (修改)
   - 添加PDFCoordinate接口
   - 扩展Segment接口
   - 扩展RagDetailState
   - 扩展RagDetailActions

### 状态管理

6. **store/ragDetailStore.ts** (修改)
   - 添加highlightedPdfCoordinate状态
   - 添加highlightPdfSegment()方法
   - 添加clearPdfHighlight()方法

### 组件更新

7. **SegmentCard.tsx** (修改)
   - 点击时调用highlightPdfSegment()
   - 支持PDF高亮

8. **MainContent.tsx** (修改)
   - 传递highlightedPdfCoordinate给PdfViewer

### Mock数据

9. **mockData.ts** (修改)
   - 为所有分段添加pdfCoordinate
   - 包含页码和坐标信息

### 文档

10. **PDF_RENDERING_GUIDE.md** (新建)
    - 详细的实现指南
    - API文档
    - 使用示例

11. **PDF_IMPLEMENTATION_SUMMARY.md** (新建)
    - 本文档

---

## 核心实现细节

### 1. PDF加载

```typescript
// 从文件路径加载
const pdf = await loadPdfFile(filePath);

// 获取总页数
const totalPages = pdf.numPages;
```

### 2. Canvas渲染

```typescript
// 渲染页面到Canvas
await renderPageToCanvas(pdf, pageNumber, canvas, scale);

// 保存原始图像（用于恢复）
const imageData = saveCanvasImageData(canvas);
```

### 3. 高亮绘制

```typescript
// 恢复原始图像
clearCanvasHighlight(canvas, imageData);

// 绘制高亮矩形
drawHighlightRect(canvas, x1, y1, x2, y2, '#FF0000', 0.3);

// 滚动到高亮位置
container.scrollTo({ top: canvasTop + y1, behavior: 'smooth' });
```

### 4. 虚拟滚动

```typescript
// 计算可见页面范围
const newVisiblePages: number[] = [];
for (let i = 0; i < totalPages; i++) {
  const canvas = canvasRefs.current[i];
  const canvasTop = canvas.offsetTop;
  const canvasBottom = canvasTop + canvas.offsetHeight;

  // 如果页面在可见范围内，加入列表
  if (canvasBottom >= scrollTop - containerHeight && 
      canvasTop <= scrollTop + containerHeight * 2) {
    newVisiblePages.push(i + 1);
  }
}

// 只渲染可见页面
setVisiblePages(newVisiblePages);
```

### 5. 分段高亮流程

```typescript
// 1. 用户点击分段
const handleClick = () => {
  selectSegment(segment.id);
  highlightPdfSegment(segment.id);  // 高亮PDF
};

// 2. Store更新高亮坐标
highlightPdfSegment: (segmentId: string) => {
  const segment = segments.find((s) => s.id === segmentId);
  if (segment && segment.pdfCoordinate) {
    set({ highlightedPdfCoordinate: segment.pdfCoordinate });
  }
};

// 3. PdfRenderer接收坐标并高亮
useEffect(() => {
  if (!highlightCoordinates) return;
  
  const { page, x1, y1, x2, y2 } = highlightCoordinates;
  const canvas = canvasRefs.current[page - 1];
  
  // 恢复原始图像
  clearCanvasHighlight(canvas, imageData);
  
  // 绘制高亮
  drawHighlightRect(canvas, x1, y1, x2, y2, '#FF0000', 0.3);
  
  // 滚动到位置
  container.scrollTo({ top: canvasTop + y1, behavior: 'smooth' });
}, [highlightCoordinates]);
```

---

## 性能优化

### 1. 虚拟滚动
- 只渲染可见页面
- 减少DOM节点数量
- 降低内存占用

### 2. Canvas优化
- 使用`willReadFrequently: true`
- 禁用图像平滑
- 保存原始图像数据

### 3. 内存管理
- 使用Map存储图像数据
- 及时清理不需要的数据
- 避免重复渲染

---

## Mock数据示例

### 分段坐标

```typescript
{
  id: 'seg_001',
  content: '分段内容...',
  charCount: 886,
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

- `page`: PDF页码（1-based）
- `x1, y1`: 左上角坐标
- `x2, y2`: 右下角坐标
- 单位: 像素（相对于Canvas）

---

## 测试清单

- [ ] 访问 `?ragId=1001` 加载PDF
- [ ] 验证PDF正确显示
- [ ] 点击分段卡片，验证PDF高亮
- [ ] 验证PDF自动滚动到高亮位置
- [ ] 验证高亮颜色为红色半透明
- [ ] 点击其他分段，验证高亮更新
- [ ] 验证虚拟滚动性能
- [ ] 验证多页PDF高亮
- [ ] 验证分段编辑功能
- [ ] 验证隐藏/显示PDF功能

---

## 集成真实API

### 1. 修改API端点

```typescript
// src/pages/ragDetail/api/ragDetailApi.ts
export const fetchRagDetail = async (ragId: string): Promise<RagDetailData> => {
  const response = await fetch(`/api/rag/detail/${ragId}`);
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

## 自动生成PDF坐标

### 使用文本提取工具

```typescript
import { generateSegmentsFromPdf } from './utils/pdfSegmentExtractor';

// 从PDF自动生成分段和坐标
const segments = await generateSegmentsFromPdf(
  pdf,
  'charCount',  // 分割方法
  500           // 每个分段的字符数
);
```

---

## 常见问题

### Q: 如何修改高亮颜色？

A: 修改`drawHighlightRect()`的color参数：
```typescript
drawHighlightRect(canvas, x1, y1, x2, y2, '#00FF00', 0.3);
```

### Q: 如何支持更多分割方法？

A: 在`pdfSegmentExtractor.ts`中添加新的分割函数。

### Q: 如何优化大文件性能？

A: 虚拟滚动已内置，只需确保PDF文件不超过100MB。

---

## 相关文档

- [PDF渲染指南](./PDF_RENDERING_GUIDE.md)
- [快速参考](./QUICK_REFERENCE.md)
- [API设计](./API_DESIGN.md)

---

## 总结

✅ 完整的PDF渲染功能
✅ 高效的虚拟滚动
✅ 灵活的高亮系统
✅ 完善的文本提取工具
✅ 易于集成真实API
✅ 详细的文档和示例


