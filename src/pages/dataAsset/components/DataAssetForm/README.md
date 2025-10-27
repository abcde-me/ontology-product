# 数据资产表单组件

## 概述

这是一个多步骤表单组件，用于创建或编辑数据资产。包含两个步骤：

1. **设置元数据字段** - 定义数据资产的字段结构
2. **设置字段映射** - 将源数据映射到数据资产字段

## 文件结构

```
form/
├── index.tsx                    # 导出入口
├── DataAssetFormContainer.tsx   # 主容器组件，管理步骤和状态
├── Step1MetadataFields.tsx      # 第一步：元数据字段设置
├── Step2FieldMapping.tsx        # 第二步：字段映射设置
├── FieldRow.tsx                 # 字段行组件（可复用）
├── MappingRow.tsx               # 映射行组件（可复用）
├── styles.less                  # 样式文件
└── README.md                    # 本文档
```

## 组件说明

### DataAssetFormContainer (主容器)

**职责：**

- 管理整个表单的状态（步骤、字段数据、映射数据等）
- 提供步骤导航（下一步、上一步、取消、完成）
- 渲染步骤指示器
- 传递数据给子组件

**关键状态：**

- `currentStep`: 当前步骤 (0 或 1)
- `metadataFields`: 元数据字段列表
- `dataSources`: 数据来源选择
- `mappings`: 字段映射列表
- `autoMapping`: 是否自动映射

### Step1MetadataFields (第一步)

**职责：**

- 管理元数据字段的增删改
- 管理数据来源的选择
- 验证表单数据
- 提供导入字段功能（待实现）

**功能：**

- 添加/删除字段行
- 配置字段属性（名称、类型、默认值等）
- 选择数据来源（数据集、卷、数据库、元数据目录）

### Step2FieldMapping (第二步)

**职责：**

- 管理字段映射的增删改
- 自动映射功能
- 导入字段功能（待实现）
- 根据第一步的数据来源动态显示列

**功能：**

- 添加/删除映射行
- 为每个字段选择对应的数据源
- 自动映射开关
- 动态列显示（根据选择的数据来源）

### FieldRow (字段行)

**可复用的字段行组件**

**职责：**

- 渲染单个字段行的所有输入项
- 处理字段属性的修改
- 提供删除功能

**字段属性：**

- 序号
- 中文名称
- 英文名称
- 字段类型（字符串、数字、布尔值、日期、对象）
- 默认值
- 必填（checkbox）
- 可修改（checkbox）

### MappingRow (映射行)

**可复用的映射行组件**

**职责：**

- 渲染单个映射行的所有输入项
- 根据数据来源动态显示列
- 处理映射数据的修改

**映射字段：**

- 序号
- 数据资产名称（输入框）
- 数据集（下拉选择，根据数据来源显示）
- 源数据目录-卷（下拉选择）
- 源数据目录-数据库（下拉选择）
- 源数据目录-元数据-目录（下拉选择）

## 数据流

```
DataAssetFormContainer
  ├─ currentStep (状态)
  ├─ metadataFields (状态)
  ├─ dataSources (状态)
  └─ mappings (状态)
      ├─> Step1MetadataFields (传递并更新 metadataFields, dataSources)
      │     └─> FieldRow (渲染每个字段)
      └─> Step2FieldMapping (传递并更新 mappings)
            └─> MappingRow (渲染每个映射)
```

## 使用方式

```tsx
import DataAssetForm from './components/form';

// 创建模式
<DataAssetForm isEditMode={false} />

// 编辑模式
<DataAssetForm isEditMode={true} id="asset-123" />
```

## Props 接口

### DataAssetFormContainer

```typescript
interface DataAssetFormContainerProps {
  isEditMode?: boolean; // 是否为编辑模式
  id?: string; // 编辑时的资产ID
}
```

### MetadataField

```typescript
interface MetadataField {
  id: string; // 唯一标识
  sequence: number; // 序号
  chineseName: string; // 中文名称
  englishName: string; // 英文名称
  fieldType: string; // 字段类型
  defaultValue: string; // 默认值
  required: boolean; // 是否必填
  editable: boolean; // 是否可修改
}
```

### FieldMapping

```typescript
interface FieldMapping {
  id: string; // 唯一标识
  sequence: number; // 序号
  assetName: string; // 数据资产名称
  dataset: string; // 数据集
  volume: string; // 卷
  database: string; // 数据库
  metadataDir: string; // 元数据目录
}
```

### DataSource

```typescript
interface DataSource {
  dataset: boolean; // 数据集
  volume: boolean; // 卷
  database: boolean; // 数据库
  metadataDir: boolean; // 元数据目录
}
```

## 待实现功能

- [ ] 导入字段功能（第一步、第二步）
- [ ] 自动映射逻辑（第二步）
- [ ] API 接口集成
- [ ] 编辑模式的数据回显
- [ ] 字段类型下拉选项的配置化
- [ ] 数据源下拉选项的动态加载

## 设计亮点

1. **模块化设计**：每个步骤独立组件，职责清晰
2. **可复用组件**：FieldRow 和 MappingRow 可作为独立组件复用
3. **状态管理**：父组件统一管理状态，便于数据传递和验证
4. **动态列**：第二步根据数据来源动态显示列
5. **渐进式验证**：每一步都可以独立验证

## 扩展建议

1. **添加更多字段类型**：可以在 FieldRow 的 Select 中添加更多选项
2. **支持嵌套字段**：可以扩展 MetadataField 支持嵌套结构
3. **导入导出功能**：实现 Excel/JSON 的导入导出
4. **智能映射**：基于字段名称的智能匹配
5. **预览功能**：添加数据预览功能
