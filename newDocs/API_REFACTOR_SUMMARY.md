# API设计重构总结

## 重构时间
2024年

## 重构背景

原有的API设计中，ragId直接对应场景类型（如 'text-scene'、'hierarchical-scene'等），这不符合真实的API设计。

**问题**：
- ragId应该是一个随机数字ID，代表具体的文档
- 场景类型应该由API返回的数据结构决定，而不是由ragId决定
- 目录树的存在应该由返回的 `directory` 字段决定

---

## 重构方案

### 新的API设计

```typescript
// 原设计（不合理）
mockRagDetailData('text-scene')      // ragId直接是场景名称
mockRagDetailData('hierarchical-scene')

// 新设计（合理）
mockRagDetailData('1001')  // ragId是数字ID
mockRagDetailData('1002')
```

### 新的数据结构

```typescript
interface RagDetailData {
  ragId: string;                    // 数字ID
  fileName: string;                 // 文件名
  filePath: string;                 // 文件路径
  sceneType: SceneType;             // 由API推导
  segments: Segment[];              // 分段数据
  directory?: DirectoryNode[];      // 可选的目录树
}
```

### 场景推导规则

| 条件 | sceneType | 说明 |
|------|-----------|------|
| type='pdf' && !directory | 'text' | 基础文本分段 |
| type='pdf' && directory | 'hierarchical' | 分层级分段 |
| type='pdf' && hasImages | 'image-text' | 图文混合分段 |
| type='ppt' | 'ppt' | PPT展示 |
| type='table' | 'table' | 表格分段 |

---

## ragId 映射表

### 新的ragId设计

| ragId | 场景 | 文件类型 | 目录树 | 说明 |
|-------|------|--------|-------|------|
| **1001** | 基础文本分段 | PDF | ❌ | 简单的PDF文档分段 |
| **1002** | 分层级分段 | PDF | ✅ | 有目录结构的PDF文档 |
| **1003** | 图文混合分段 | PDF | ❌ | 包含图片的PDF文档 |
| **1004** | PPT展示 | PPT | ❌ | PowerPoint演示文稿 |
| **1005** | 表格分段 | 表格 | ❌ | Excel表格数据 |

### 访问URL

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

## 代码变更

### 修改文件

**src/pages/ragDetail/utils/mockData.ts**

#### 原代码
```typescript
export const mockRagDetailData = (ragId: string): RagDetailData => {
  switch (ragId) {
    case 'text-scene':
      return mockTextSceneData(ragId);
    case 'hierarchical-scene':
      return mockHierarchicalSceneData(ragId);
    // ...
  }
};
```

#### 新代码
```typescript
export const mockRagDetailData = (ragId: string): RagDetailData => {
  switch (ragId) {
    case '1001':
      return {
        ragId: '1001',
        fileName: '中国银行2023年年报.pdf',
        filePath: '/documents/reports/中国银行2023年年报.pdf',
        sceneType: 'text',
        segments: mockTextSceneData(ragId).segments,
        // 无 directory，不渲染目录树
      };
    case '1002':
      return {
        ragId: '1002',
        fileName: '产品设计文档.pdf',
        filePath: '/documents/design/产品设计文档.pdf',
        sceneType: 'hierarchical',
        segments: mockHierarchicalSceneData(ragId).segments,
        directory: mockHierarchicalSceneData(ragId).directory,
      };
    // ...
  }
};
```

---

## 优势

### 1. 符合真实API设计
- ragId是数字ID，代表具体的文档
- 场景类型由API返回的数据结构决定
- 更灵活，支持同一个API返回不同的场景

### 2. 易于扩展
- 添加新的ragId只需在switch中添加新的case
- 添加新的场景类型只需修改返回的数据结构
- 无需修改前端路由逻辑

### 3. 易于集成真实API
- 只需修改 `fetchRagDetail` 函数指向真实API
- 前端逻辑无需改动
- 数据结构完全兼容

### 4. 更好的语义
- ragId代表具体的文档ID
- sceneType由数据推导，而不是由ID决定
- 更符合REST API设计原则

---

## 迁移指南

### 对于现有代码

**无需修改**，因为：
- 前端逻辑完全相同
- SceneRouter的路由逻辑不变
- 组件接口不变

### 对于新的ragId

使用新的数字ID：
```
?ragId=1001  // 而不是 ?ragId=text-scene
?ragId=1002  // 而不是 ?ragId=hierarchical-scene
```

### 对于集成真实API

修改 `src/pages/ragDetail/api/ragDetailApi.ts`：

```typescript
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

---

## 测试

### 验证清单

- [x] ragId=1001 返回基础文本分段
- [x] ragId=1002 返回分层级分段（包含directory）
- [x] ragId=1003 返回图文混合分段
- [x] ragId=1004 返回PPT展示
- [x] ragId=1005 返回表格分段
- [x] 无编译错误
- [x] 类型检查通过

### 访问测试

```bash
# 测试场景1
http://localhost:3000/tenant/compute/modaforge/ragDetail?ragId=1001

# 测试场景2
http://localhost:3000/tenant/compute/modaforge/ragDetail?ragId=1002

# 测试场景3
http://localhost:3000/tenant/compute/modaforge/ragDetail?ragId=1003

# 测试场景4
http://localhost:3000/tenant/compute/modaforge/ragDetail?ragId=1004

# 测试场景5
http://localhost:3000/tenant/compute/modaforge/ragDetail?ragId=1005
```

---

## 文档更新

新增文档：
- ✅ `newDocs/API_DESIGN.md` - 详细的API设计文档
- ✅ `newDocs/RAGID_MAPPING.md` - ragId映射表和快速参考

---

## 总结

✅ API设计更符合真实情况
✅ ragId是数字ID，代表具体的文档
✅ sceneType由API返回的数据结构决定
✅ directory字段控制是否渲染目录树
✅ 易于扩展和集成真实API
✅ 无需修改前端逻辑

---

## 相关文档

- [API设计文档](./API_DESIGN.md)
- [ragId映射表](./RAGID_MAPPING.md)
- [快速参考指南](./QUICK_REFERENCE.md)
- [场景详解](./SCENE_DETAILS.md)

