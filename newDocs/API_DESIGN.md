# RAG 分段列表 - API设计文档

## 概述

本文档描述了RAG分段列表功能的API设计，包括请求参数、响应结构、以及不同场景的数据映射。

---

## API设计原则

### 1. 真实的API设计
- **ragId** 是一个随机数字ID，代表一个具体的知识库文档
- **type** 字段用于区分左侧内容类型（pdf、ppt、table等）
- **directory** 字段用于控制是否渲染目录树（有数据则渲染，无数据则不渲染）
- **sceneType** 字段由API根据type和directory自动推导

### 2. 灵活的场景支持
- 同一个API可以返回不同的场景类型
- 场景类型由返回的数据结构决定，而不是由URL参数决定
- 支持动态扩展新的场景类型

---

## API响应结构

### 基础响应格式

```typescript
interface RagDetailData {
  ragId: string;                    // 文档ID（数字字符串）
  fileName: string;                 // 文件名
  filePath: string;                 // 文件路径
  sceneType: SceneType;             // 场景类型（由API推导）
  segments: Segment[];              // 分段数据
  directory?: DirectoryNode[];      // 目录树数据（可选）
}
```

### 场景类型推导规则

| 条件 | sceneType | 说明 |
|------|-----------|------|
| type='pdf' && !directory | 'text' | 基础文本分段 |
| type='pdf' && directory | 'hierarchical' | 分层级分段 |
| type='pdf' && hasImages | 'image-text' | 图文混合分段 |
| type='ppt' | 'ppt' | PPT展示 |
| type='table' | 'table' | 表格分段 |

---

## ragId 映射表

### 测试用ragId

| ragId | 场景 | 文件类型 | 目录树 | 说明 |
|-------|------|--------|-------|------|
| **1001** | 基础文本分段 | PDF | ❌ | 简单的PDF文档分段 |
| **1002** | 分层级分段 | PDF | ✅ | 有目录结构的PDF文档 |
| **1003** | 图文混合分段 | PDF | ❌ | 包含图片的PDF文档 |
| **1004** | PPT展示 | PPT | ❌ | PowerPoint演示文稿 |
| **1005** | 表格分段 | 表格 | ❌ | Excel表格数据 |

### 访问URL示例

```
# 场景1：基础文本分段
http://localhost:3000/tenant/compute/modaforge/ragDetail?ragId=1001

# 场景2：分层级分段
http://localhost:3000/tenant/compute/modaforge/ragDetail?ragId=1002

# 场景3：图文混合分段
http://localhost:3000/tenant/compute/modaforge/ragDetail?ragId=1003

# 场景4：PPT展示
http://localhost:3000/tenant/compute/modaforge/ragDetail?ragId=1004

# 场景5：表格分段
http://localhost:3000/tenant/compute/modaforge/ragDetail?ragId=1005
```

---

## 详细的API响应示例

### 场景1：基础文本分段 (ragId=1001)

```json
{
  "ragId": "1001",
  "fileName": "中国银行2023年年报.pdf",
  "filePath": "/documents/reports/中国银行2023年年报.pdf",
  "sceneType": "text",
  "segments": [
    {
      "id": "seg_001",
      "content": "按照本次发行前的股份数计算...",
      "charCount": 886,
      "segmentIndex": 1,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    },
    ...
  ]
  // 无 directory 字段，不渲染目录树
}
```

### 场景2：分层级分段 (ragId=1002)

```json
{
  "ragId": "1002",
  "fileName": "产品设计文档.pdf",
  "filePath": "/documents/design/产品设计文档.pdf",
  "sceneType": "hierarchical",
  "segments": [
    {
      "id": "seg_001",
      "content": "第一章 产品概述...",
      "level": 1,
      "parentId": null,
      "charCount": 500,
      ...
    },
    ...
  ],
  "directory": [
    {
      "id": "dir_001",
      "label": "第一章 产品概述",
      "level": 1,
      "segmentIds": ["seg_001", "seg_002"],
      "children": [
        {
          "id": "dir_002",
          "label": "1.1 产品定位",
          "level": 2,
          "segmentIds": ["seg_002"],
          "children": []
        }
      ]
    },
    ...
  ]
}
```

### 场景3：图文混合分段 (ragId=1003)

```json
{
  "ragId": "1003",
  "fileName": "产品宣传册.pdf",
  "filePath": "/documents/marketing/产品宣传册.pdf",
  "sceneType": "image-text",
  "segments": [
    {
      "id": "seg_001",
      "content": "产品特性介绍...",
      "charCount": 300,
      "images": [
        {
          "id": "img_001",
          "url": "https://example.com/images/product-1.jpg",
          "caption": "产品外观"
        }
      ],
      ...
    },
    ...
  ]
  // 无 directory 字段
}
```

### 场景4：PPT展示 (ragId=1004)

```json
{
  "ragId": "1004",
  "fileName": "2024年度计划.pptx",
  "filePath": "/documents/presentations/2024年度计划.pptx",
  "sceneType": "ppt",
  "segments": [
    {
      "id": "seg_001",
      "content": "2024年度工作计划",
      "slideNumber": 1,
      "slideTitle": "封面",
      "slideContent": "2024年度工作计划",
      "charCount": 50,
      ...
    },
    ...
  ]
  // 无 directory 字段
}
```

### 场景5：表格分段 (ragId=1005)

```json
{
  "ragId": "1005",
  "fileName": "销售数据统计.xlsx",
  "filePath": "/documents/data/销售数据统计.xlsx",
  "sceneType": "table",
  "segments": [
    {
      "id": "seg_001",
      "content": "2024年Q1销售数据",
      "charCount": 100,
      "tableData": {
        "headers": ["产品", "销售额", "增长率"],
        "rows": [
          {"产品": "产品A", "销售额": "100万", "增长率": "10%"},
          {"产品": "产品B", "销售额": "200万", "增长率": "20%"}
        ]
      },
      ...
    },
    ...
  ]
  // 无 directory 字段
}
```

---

## 前端处理逻辑

### 1. 初始化流程

```typescript
// 1. 从URL获取ragId
const ragId = new URLSearchParams(location.search).get('ragId');

// 2. 调用API获取数据
const data = await fetchRagDetail(ragId);

// 3. 根据返回的sceneType自动选择场景
// SceneRouter会根据sceneType自动渲染对应的场景组件

// 4. 根据directory是否存在决定是否渲染目录树
if (data.directory && data.directory.length > 0) {
  // 渲染目录树
}
```

### 2. 场景路由逻辑

```typescript
const SceneRouter = ({ sceneType }) => {
  switch (sceneType) {
    case 'text':
      return <MainContent />;
    case 'hierarchical':
      return <HierarchicalSceneContent />;
    case 'image-text':
      return <ImageTextSceneContent />;
    case 'ppt':
      return <PptSceneContent />;
    case 'table':
      return <TableSceneContent />;
    default:
      return <MainContent />;
  }
};
```

---

## 集成真实API的步骤

### 1. 修改API接口

```typescript
// src/pages/ragDetail/api/ragDetailApi.ts

export const fetchRagDetail = async (ragId: string): Promise<RagDetailData> => {
  // 替换为真实的API端点
  const response = await fetch(`/api/rag/detail/${ragId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch RAG detail');
  }
  
  const data = await response.json();
  return data;
};
```

### 2. 后端API设计

```
GET /api/rag/detail/{ragId}

响应：
{
  "code": 200,
  "message": "success",
  "data": {
    "ragId": "1001",
    "fileName": "...",
    "filePath": "...",
    "sceneType": "text",
    "segments": [...],
    "directory": null
  }
}
```

---

## 扩展新场景的步骤

### 1. 定义新的sceneType

```typescript
// types/index.ts
export type SceneType = 'text' | 'hierarchical' | 'image-text' | 'ppt' | 'table' | 'new-scene';
```

### 2. 创建新的Segment类型

```typescript
export interface NewSceneSegment extends Segment {
  // 新的字段
  customField: string;
}
```

### 3. 创建新的场景组件

```typescript
// components/scenes/NewSceneContent.tsx
const NewSceneContent: React.FC = () => {
  // 实现新场景的UI
};
```

### 4. 在SceneRouter中添加路由

```typescript
case 'new-scene':
  return <NewSceneContent />;
```

### 5. 在mockData中添加Mock数据

```typescript
case '1006':
  return {
    ragId: '1006',
    fileName: '新场景文档.xxx',
    filePath: '/documents/new-scene.xxx',
    sceneType: 'new-scene',
    segments: mockNewSceneData(ragId).segments,
  };
```

---

## 总结

✅ ragId是数字ID，代表具体的文档
✅ API根据返回的数据结构自动推导sceneType
✅ directory字段控制是否渲染目录树
✅ 支持5种场景，可轻松扩展
✅ 前端通过SceneRouter自动路由到对应的场景组件

---

## 相关文档

- [快速参考指南](./QUICK_REFERENCE.md)
- [场景详解](./SCENE_DETAILS.md)
- [实现教程](./RAG_SEGMENT_IMPLEMENTATION_GUIDE.md)

