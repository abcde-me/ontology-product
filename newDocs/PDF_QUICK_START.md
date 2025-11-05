# PDF功能快速开始指南

## 5分钟快速上手

### 1. 访问PDF功能

打开浏览器访问：
```
http://localhost:3000/tenant/compute/modaforge/ragDetail?ragId=1001
```

### 2. 看到的效果

- **左侧**: PDF文档显示（红色高亮）
- **右侧**: 分段列表
- **交互**: 点击分段时，PDF自动高亮并滚动

### 3. 核心功能

#### 功能1: 点击分段高亮PDF
```
1. 在右侧分段列表中点击任意分段
2. 左侧PDF会自动高亮该分段对应的内容
3. PDF会自动滚动到高亮位置
```

#### 功能2: 隐藏/显示PDF
```
1. 点击分段列表头部的"隐藏原文件"按钮
2. PDF隐藏，分段列表占据全屏
3. 点击"显示原文件"恢复
```

#### 功能3: 编辑分段
```
1. Hover分段卡片，显示操作按钮
2. 点击"编辑分段"按钮
3. 修改内容后点击外部自动保存
```

---

## 文件位置

### 核心文件

| 文件 | 位置 | 说明 |
|------|------|------|
| PdfRenderer | `src/pages/ragDetail/components/PdfRenderer.tsx` | PDF渲染组件 |
| PdfViewer | `src/pages/ragDetail/components/PdfViewer.tsx` | PDF查看器 |
| pdfUtils | `src/pages/ragDetail/utils/pdfUtils.ts` | PDF工具函数 |
| pdfSegmentExtractor | `src/pages/ragDetail/utils/pdfSegmentExtractor.ts` | 文本提取工具 |

### 修改的文件

| 文件 | 修改内容 |
|------|--------|
| types/index.ts | 添加PDFCoordinate类型 |
| store/ragDetailStore.ts | 添加PDF高亮状态和方法 |
| SegmentCard.tsx | 点击时高亮PDF |
| MainContent.tsx | 传递高亮坐标 |
| mockData.ts | 添加分段坐标 |

---

## 常用代码片段

### 1. 加载PDF

```typescript
import { loadPdfFile } from '../utils/pdfUtils';

const pdf = await loadPdfFile('/path/to/file.pdf');
console.log('总页数:', pdf.numPages);
```

### 2. 渲染页面

```typescript
import { renderPageToCanvas } from '../utils/pdfUtils';

const canvas = document.getElementById('pdf-canvas');
await renderPageToCanvas(pdf, 1, canvas, 1.5);
```

### 3. 高亮PDF

```typescript
import { drawHighlightRect, clearCanvasHighlight } from '../utils/pdfUtils';

// 恢复原始图像
clearCanvasHighlight(canvas, imageData);

// 绘制高亮
drawHighlightRect(canvas, 50, 100, 550, 250, '#FF0000', 0.3);
```

### 4. 提取文本

```typescript
import { extractPdfText, extractTextItemsFromPdf } from '../utils/pdfUtils';

// 提取全文
const text = await extractPdfText(pdf);

// 提取文本项及坐标
const items = await extractTextItemsFromPdf(pdf);
```

### 5. 生成分段

```typescript
import { generateSegmentsFromPdf } from '../utils/pdfSegmentExtractor';

const segments = await generateSegmentsFromPdf(pdf, 'charCount', 500);
console.log('生成的分段:', segments);
```

### 6. 高亮分段

```typescript
import { useRagDetailStore } from '../store/ragDetailStore';

const { highlightPdfSegment } = useRagDetailStore();

// 高亮指定分段
highlightPdfSegment('seg_001');
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
  pdfCoordinate?: PDFCoordinate;  // PDF坐标
}
```

---

## 配置选项

### PdfRenderer Props

```typescript
interface PdfRendererProps {
  filePath: string;                    // PDF文件路径
  highlightCoordinates?: PDFCoordinate; // 高亮坐标
  onPageChange?: (pageNumber: number) => void; // 页码变化回调
  scale?: number;                      // 缩放比例（默认1.5）
}
```

### 使用示例

```typescript
<PdfRenderer
  filePath="/rag/document.pdf"
  highlightCoordinates={{
    page: 1,
    x1: 50,
    y1: 100,
    x2: 550,
    y2: 250
  }}
  scale={1.5}
  onPageChange={(page) => console.log('当前页:', page)}
/>
```

---

## 性能提示

### 1. 虚拟滚动
- 自动启用，无需配置
- 只渲染可见页面
- 支持大文件（100MB+）

### 2. 缓存
- Canvas图像数据自动缓存
- 高亮后自动恢复
- 无需手动管理

### 3. 优化建议
- 使用合理的缩放比例（1.5-2.0）
- 避免频繁高亮切换
- 定期清理不需要的数据

---

## 故障排除

### 问题1: PDF无法加载

**症状**: 页面显示"加载PDF失败"

**解决方案**:
1. 检查文件路径是否正确
2. 确保PDF文件存在
3. 检查浏览器控制台错误信息

### 问题2: 高亮位置不对

**症状**: 高亮矩形位置错误

**解决方案**:
1. 检查坐标值是否正确
2. 确保坐标单位是像素
3. 验证页码是否正确（1-based）

### 问题3: 性能缓慢

**症状**: 滚动或高亮时卡顿

**解决方案**:
1. 检查虚拟滚动是否启用
2. 减少缩放比例
3. 检查浏览器内存使用

### 问题4: 高亮不显示

**症状**: 点击分段但PDF没有高亮

**解决方案**:
1. 检查分段是否有pdfCoordinate
2. 验证Store状态是否更新
3. 检查Canvas是否正确渲染

---

## 下一步

### 1. 集成真实API
修改 `src/pages/ragDetail/api/ragDetailApi.ts` 中的 `fetchRagDetail` 函数

### 2. 自动生成坐标
使用 `generateSegmentsFromPdf()` 自动提取PDF文本和坐标

### 3. 自定义高亮
修改 `drawHighlightRect()` 的颜色和透明度参数

### 4. 添加更多功能
- 搜索功能
- 注释功能
- 导出功能

---

## 相关文档

- [详细实现指南](./PDF_RENDERING_GUIDE.md)
- [实现总结](./PDF_IMPLEMENTATION_SUMMARY.md)
- [API设计](./API_DESIGN.md)

---

## 支持

如有问题，请查看：
1. 浏览器控制台错误信息
2. 详细实现指南
3. 代码注释


