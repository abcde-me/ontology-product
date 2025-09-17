# 数据集树组件 (DataSetTree)

## 概述

DataSetTree 是一个用于展示和管理数据集的树形组件，支持搜索、动态加载文件列表等功能。

## 功能特性

1. **标题展示** - 显示"数据集"标题，支持返回按钮
2. **搜索功能** - 支持关键词搜索数据集
3. **树形结构** - 使用 Arco Design 的 Tree 组件展示数据集和文件
4. **动态加载** - 点击数据集节点时动态加载文件列表
5. **低耦合设计** - 组件间解耦，易于维护和扩展

## 组件结构

```
daset-tree/
├── index.tsx              # 主组件（包含标题、搜索框、树形结构）
├── index.scss             # 样式文件
├── README.md              # 文档
└── ../hooks/              # 自定义 hooks
    ├── useDasetTree.tsx           # 数据集数据管理
    └── useDatasetTreeState.tsx    # 树状态管理
```

## 使用方法

```tsx
import DataSetTree from '@/components/pyspark-data-directory-tree/components/daset-tree';

// 基本使用
<DataSetTree
  onBack={() => console.log('返回上一级')}
  onViewDatasetDetail={(dataset) => console.log('查看数据集详情', dataset)}
/>;
```

## Props

| 属性                | 类型                                 | 必填 | 默认值 | 说明               |
| ------------------- | ------------------------------------ | ---- | ------ | ------------------ |
| onBack              | `() => void`                         | 否   | -      | 返回按钮点击回调   |
| onViewDatasetDetail | `(dataset: DatasetListItem) => void` | 否   | -      | 查看数据集详情回调 |

## 依赖

- `@arco-design/web-react` - UI 组件库（Tree, Input, Button, Space, Typography）
- `@arco-design/web-react/icon` - 图标库（IconLeft, IconSearch）
- `@/types/datasetManagement` - 类型定义
- `@/api/datasetManagement` - API 接口

## 自定义 Hook

### useDasetTree

管理数据集数据的 hook，提供：

- `dasetList` - 数据集列表
- `searchKeyword` - 搜索关键词
- `setSearchKeyword` - 设置搜索关键词
- `getDasetList` - 获取数据集列表
- `getDasetVersionFile` - 获取数据集文件列表

### useDatasetTreeState

管理树状态的 hook，提供：

- `expandedKeys` - 展开的节点
- `selectedKeys` - 选中的节点
- `handleExpand` - 处理节点展开
- `handleSelect` - 处理节点选择
- `buildTreeData` - 构建树数据

## 样式定制

组件使用 SCSS 编写样式，支持以下 CSS 类：

- `.dataset-tree-container` - 主容器
- `.dataset-tree-header` - 标题区域（包含返回按钮和标题）
- `.dataset-tree-search` - 搜索区域
- `.dataset-tree-content` - 树内容区域
- `.dataset-tree` - 树组件样式
- `.back-button` - 返回按钮样式
- `.dataset-title` - 标题样式
- `.search-input` - 搜索输入框样式

## 响应式设计

组件支持响应式设计，在移动端会自动调整样式。

## 注意事项

1. 确保传入正确的 API 接口
2. 组件依赖 Arco Design 的 Tree 组件
3. 文件列表通过动态加载获取，避免一次性加载大量数据
4. 搜索功能会重新请求数据集列表
