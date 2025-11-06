# PPT场景实现总结

## 概述
为ragId=1004添加了PPT场景支持，实现了与PDF场景类似的布局结构，包括左侧PPT在线渲染、中间目录树（可选）和右侧分段列表。

**重要更新**: PPT查看器使用iframe + Office Online Viewer来渲染在线PPT文件，而不是自定义的"上一页/下一页"按钮。这与PDF查看器的实现方式保持一致。

## 实现的功能

### 1. PPT场景的Mock数据
- **文件**: `src/pages/ragDetail/utils/segmentDataByRagId.ts`
- **新增**: `SegmentData_1004` - 包含5个PPT分段的mock数据
- **特点**: 
  - 每个分段包含 `slideNumber`、`slideTitle`、`slideContent` 字段
  - 分段按照PPT页面顺序组织
  - 包含层级结构（level字段），用于目录树展示

### 2. PPT目录树Mock数据
- **文件**: `src/pages/ragDetail/utils/treeData.ts`
- **新增**: `TreeData_1004` - PPT场景的目录树数据
- **结构**: 
  - 根节点：2024年度工作总结与展望
  - 第一章：财务成果
  - 第二章：项目成果
  - 第三章：未来展望（包含2个子节点）

### 3. API层支持
- **文件**: `src/pages/ragDetail/api/ragDetailApi.ts`
- **修改**:
  - `fetchRagDetail`: 添加ragId=1004的处理逻辑，返回 `sceneType: 'ppt'`
  - `transformSegment`: 支持PPT特有字段（slideNumber, slideTitle, slideContent）的转换
  - 文件信息：`2024年度工作总结.pptx`，路径：`/知识库/演示文稿`

### 4. PPT场景组件重构
- **文件**: `src/pages/ragDetail/components/scenes/PptSceneContent.tsx`
- **改进**:
  - 参考 `PdfSceneContent` 的布局结构
  - 支持目录树显示（当有directory数据时）
  - 使用统一的 `SegmentList` 组件而不是专用的 `PptSegmentList`
  - 保持与PDF场景一致的布局：左侧PPT + 中间目录树 + 右侧分段列表
  - 支持显示/隐藏PPT查看器

### 5. PPT查看器重新设计
- **文件**: `src/pages/ragDetail/components/PptViewer.tsx`
- **实现方式**:
  - 类似 `PdfViewer` 的设计，接收 `fileName`、`filePath`、`pptData` 参数
  - 使用 iframe + Office Online Viewer 或 Google Docs Viewer 来渲染PPT
  - 支持二进制数据（pptData）和文件路径（filePath）两种方式
  - 自动检测URL是否已包含viewer，避免重复包装
- **查看器选择**:
  - 默认使用 Microsoft Office Online Viewer
  - 备选方案：Google Docs Viewer
  - 可通过修改 `getViewerUrl` 函数切换查看器

## 与PDF场景的区别

### 相同点
1. 布局结构完全一致（左侧内容查看器 + 中间目录树 + 右侧分段列表）
2. 支持目录树展示和交互
3. 支持分段列表展示和选择
4. 支持显示/隐藏左侧查看器

### 不同点
1. **渲染方式**:
   - PDF: 使用 `pdfjs-dist` 库在canvas上渲染PDF
   - PPT: 使用 iframe + Office Online Viewer 渲染在线PPT

2. **交互方式**:
   - PDF: 点击分段时高亮PDF中的特定区域（使用pdfCoordinates）
   - PPT: 点击分段时通过postMessage尝试跳转到对应幻灯片（取决于viewer支持）

3. **数据结构**:
   - PDF: 分段包含 `pdfCoordinates` 字段（页码 + 坐标）
   - PPT: 分段包含 `slideNumber`、`slideTitle`、`slideContent` 字段

4. **文件加载**:
   - PDF: 支持本地文件路径和二进制数据
   - PPT: 需要公开可访问的URL（或通过Office Online Viewer包装）

## 文件修改清单

1. ✅ `src/pages/ragDetail/utils/segmentDataByRagId.ts`
   - 添加 `SegmentData_1004` 常量
   - 更新 `getSegmentDataByRagId` 函数

2. ✅ `src/pages/ragDetail/utils/treeData.ts`
   - 添加 `TreeData_1004` 常量
   - 更新 `getTreeDataByRagId` 函数

3. ✅ `src/pages/ragDetail/api/ragDetailApi.ts`
   - 更新 `fetchRagDetail` 函数，添加ragId=1004的处理
   - 更新 `transformSegment` 函数，支持PPT字段

4. ✅ `src/pages/ragDetail/components/scenes/PptSceneContent.tsx`
   - 重构组件，参考PdfSceneContent的布局
   - 添加目录树支持
   - 使用统一的SegmentList组件

5. ✅ `src/pages/ragDetail/components/PptViewer.tsx`
   - 添加selectedSegmentId监听
   - 实现自动页面跳转功能

## 使用方法

访问以下URL即可查看PPT场景：
```
http://localhost:3000/rag-detail?ragId=1004
```

## 测试要点

1. ✅ PPT渲染是否正常
2. ✅ 目录树是否正确显示
3. ✅ 分段列表是否正确显示
4. ⏳ 点击目录树节点时，PPT是否跳转到对应页面
5. ⏳ 点击分段列表项时，PPT是否跳转到对应页面
6. ⏳ 显示/隐藏PPT查看器功能是否正常
7. ⏳ 布局是否与PDF场景保持一致

## 注意事项

1. **不影响PDF场景**: 所有修改都是增量的，不会影响现有的PDF场景（ragId=1001, 1002, 1003）
2. **代码复用**: 尽可能复用现有组件（如DirectoryTree、SegmentList），保持代码一致性
3. **类型安全**: 所有新增字段都已在类型定义中声明（PptSegment接口）
4. **向后兼容**: transformSegment函数向后兼容，只在有slideNumber字段时才添加PPT特有字段
5. **PPT文件访问**:
   - PPT文件必须是公开可访问的URL
   - 如果是私有文件，需要通过后端代理或使用Office Online Viewer的认证机制
   - 本地文件需要先上传到服务器或转换为可访问的URL
6. **跨域问题**:
   - Office Online Viewer和Google Docs Viewer都需要文件URL可公开访问
   - iframe的sandbox属性已配置，但某些功能可能受限

## 后续优化建议

1. **更好的PPT渲染方案**:
   - 考虑使用专业的PPT渲染库（如pptxgenjs、reveal.js等）
   - 将PPT转换为HTML5格式以获得更好的交互体验
   - 支持PPT动画和过渡效果

2. **增强交互功能**:
   - 实现真正的幻灯片跳转（需要viewer支持）
   - 添加缩略图预览功能
   - 支持全屏播放模式

3. **性能优化**:
   - 预加载PPT文件
   - 缓存已加载的PPT
   - 支持懒加载大型PPT文件

4. **离线支持**:
   - 支持本地PPT文件预览
   - 实现PPT到图片的转换
   - 提供离线查看模式

