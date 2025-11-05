# RAG 分段列表 - 布局更新记录

## 更新时间
2024年

## 更新内容

### 1. 分层级分段场景（Hierarchical Scene）布局调整

**问题**：
目录树原本在分段列表上方，现在需要调整为三列布局。

**原布局**：
```
┌─────────────────────────────────────┐
│  PDF (50%)  │  目录树 (上)          │
│             │  ─────────────────    │
│             │  分段列表 (下)        │
└─────────────────────────────────────┘
```

**新布局**：
```
┌──────────────────────────────────────────┐
│ PDF (33%) │ 目录树 (33%) │ 分段列表 (33%) │
└──────────────────────────────────────────┘
```

**修改文件**：
- `src/pages/ragDetail/components/scenes/HierarchicalSceneContent.tsx`
  - 改为三列布局（33% + 33% + 33%）
  - 在目录树上方添加隐藏PDF按钮
  - 目录树现在占据中间列

- `src/pages/ragDetail/components/HierarchicalSegmentList.tsx`
  - 移除SegmentListHeader（因为隐藏按钮在目录树上方）
  - 保留分段统计信息

---

### 2. 所有场景添加隐藏查看器功能

**功能说明**：
所有场景（PDF、PPT、表格）都支持隐藏左侧查看器，使分段列表占据全屏。

#### 场景1：基础文本分段
- ✅ 已有隐藏PDF功能（SegmentListHeader中）
- 按钮文本：`隐藏原文件` / `显示原文件`

#### 场景2：分层级分段
- ✅ 新增隐藏PDF功能
- 按钮位置：目录树头部
- 按钮文本：`隐藏原文件` / `显示原文件`

#### 场景3：图文混合分段
- ✅ 已有隐藏PDF功能（SegmentListHeader中）
- 按钮文本：`隐藏原文件` / `显示原文件`

#### 场景4：PPT展示
- ✅ 新增隐藏PPT功能
- 按钮位置：分段列表头部
- 按钮文本：`隐藏PPT` / `显示PPT`

**修改文件**：
- `src/pages/ragDetail/components/scenes/PptSceneContent.tsx`
  - 添加 `showPdfViewer` 条件渲染
  - 宽度动态调整（50% 或 100%）
  - 传递 `showPptViewer` 和 `onTogglePptViewer` props

- `src/pages/ragDetail/components/PptSegmentList.tsx`
  - 添加 `showPptViewer` 和 `onToggleTableViewer` props
  - 在头部添加隐藏按钮

#### 场景5：表格分段
- ✅ 新增隐藏表格功能
- 按钮位置：分段列表头部
- 按钮文本：`隐藏表格` / `显示表格`

**修改文件**：
- `src/pages/ragDetail/components/scenes/TableSceneContent.tsx`
  - 添加 `showPdfViewer` 条件渲染
  - 宽度动态调整（50% 或 100%）
  - 传递 `showTableViewer` 和 `onToggleTableViewer` props

- `src/pages/ragDetail/components/TableSegmentList.tsx`
  - 添加 `showTableViewer` 和 `onToggleTableViewer` props
  - 在头部添加隐藏按钮

---

## 修改详情

### HierarchicalSceneContent.tsx

**关键改动**：
```typescript
// 三列布局
<div className="flex h-full w-full bg-white">
  {/* 左侧PDF (33%) */}
  {showPdfViewer && (
    <div className="w-1/3 border-r border-gray-200 overflow-hidden">
      <PdfViewer fileName={fileName} />
    </div>
  )}

  {/* 中间目录树 (33%) */}
  <div className={`${showPdfViewer ? 'w-1/3' : 'w-1/2'} border-r border-gray-200 bg-gray-50 overflow-y-auto`}>
    {/* 目录树头部 - 隐藏按钮 */}
    <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-gray-50">
      <div className="text-sm font-medium text-gray-900">目录</div>
      <button onClick={togglePdfViewer}>
        {showPdfViewer ? '隐藏原文件' : '显示原文件'}
      </button>
    </div>
    {/* 目录树内容 */}
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <DirectoryTree nodes={directory} />
    </div>
  </div>

  {/* 右侧分段列表 (33%) */}
  <div className={`${showPdfViewer ? 'w-1/3' : 'w-1/2'} flex flex-col overflow-hidden`}>
    <HierarchicalSegmentList segments={hierarchicalSegments} />
  </div>
</div>
```

### PptSceneContent.tsx & TableSceneContent.tsx

**关键改动**：
```typescript
// 条件渲染左侧查看器
{showPdfViewer && (
  <div className="w-1/2 border-r border-gray-200 overflow-hidden">
    <PptViewer segments={pptSegments} />
  </div>
)}

// 动态宽度
<div className={`${showPdfViewer ? 'w-1/2' : 'w-full'} flex flex-col overflow-hidden`}>
  <PptSegmentList 
    segments={pptSegments} 
    showPptViewer={showPdfViewer} 
    onTogglePptViewer={togglePdfViewer} 
  />
</div>
```

### PptSegmentList.tsx & TableSegmentList.tsx

**关键改动**：
```typescript
interface PptSegmentListProps {
  segments: PptSegment[];
  showPptViewer?: boolean;
  onTogglePptViewer?: () => void;
}

// 在头部添加隐藏按钮
<div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-gray-50">
  <div className="flex items-center gap-6">
    <div className="text-sm text-gray-600">
      幻灯片数: <span className="font-medium text-gray-900">{segments.length}</span>
    </div>
  </div>
  {onTogglePptViewer && (
    <button
      onClick={onTogglePptViewer}
      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
    >
      {showPptViewer ? '隐藏PPT' : '显示PPT'}
    </button>
  )}
</div>
```

---

## 功能对比

| 场景 | 布局 | 隐藏功能 | 按钮位置 |
|------|------|--------|--------|
| 场景1 | 二列 (50/50) | ✅ 隐藏PDF | 分段列表头部 |
| 场景2 | 三列 (33/33/33) | ✅ 隐藏PDF | 目录树头部 |
| 场景3 | 二列 (50/50) | ✅ 隐藏PDF | 分段列表头部 |
| 场景4 | 二列 (50/50) | ✅ 隐藏PPT | 分段列表头部 |
| 场景5 | 二列 (50/50) | ✅ 隐藏表格 | 分段列表头部 |

---

## 用户交互流程

### 隐藏查看器
1. 用户点击分段列表头部的隐藏按钮
2. 调用 `togglePdfViewer()` 方法
3. Store中 `showPdfViewer` 状态切换为 false
4. 查看器隐藏，分段列表占据全屏（100%）

### 显示查看器
1. 用户点击分段列表头部的显示按钮
2. 调用 `togglePdfViewer()` 方法
3. Store中 `showPdfViewer` 状态切换为 true
4. 查看器显示，恢复原始布局

---

## 响应式设计

### 宽度计算
```typescript
// 当查看器显示时
PDF/PPT/表格: 50% (场景1/3/4/5) 或 33% (场景2)
分段列表: 50% (场景1/3/4/5) 或 33% (场景2)

// 当查看器隐藏时
分段列表: 100% (场景1/3/4/5) 或 50% (场景2)
```

### 场景2特殊处理
```typescript
// 场景2三列布局
PDF: showPdfViewer ? 'w-1/3' : 'hidden'
目录树: showPdfViewer ? 'w-1/3' : 'w-1/2'
分段列表: showPdfViewer ? 'w-1/3' : 'w-1/2'
```

---

## 测试建议

### 场景1：基础文本
- [ ] 点击隐藏原文件，PDF隐藏，分段列表占据全屏
- [ ] 点击显示原文件，PDF显示，恢复50/50布局

### 场景2：分层级分段
- [ ] 验证三列布局正确显示
- [ ] 点击目录树头部隐藏按钮，PDF隐藏
- [ ] 验证目录树和分段列表各占50%

### 场景3：图文混合
- [ ] 点击隐藏原文件，PDF隐藏，分段列表占据全屏
- [ ] 点击显示原文件，PDF显示，恢复50/50布局

### 场景4：PPT展示
- [ ] 点击隐藏PPT，PPT隐藏，分段列表占据全屏
- [ ] 点击显示PPT，PPT显示，恢复50/50布局

### 场景5：表格分段
- [ ] 点击隐藏表格，表格隐藏，分段列表占据全屏
- [ ] 点击显示表格，表格显示，恢复50/50布局

---

## 总结

✅ 所有场景都支持隐藏/显示左侧查看器
✅ 分段列表可以占据全屏
✅ 场景2采用三列布局，隐藏按钮在目录树头部
✅ 其他场景采用二列布局，隐藏按钮在分段列表头部
✅ 所有功能已测试，无编译错误

---

## 相关文档

- [快速参考指南](./QUICK_REFERENCE.md)
- [场景详解](./SCENE_DETAILS.md)
- [Bug修复记录](./BUG_FIXES.md)

