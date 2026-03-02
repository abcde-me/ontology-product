# 行为测试功能架构设计方案

## 📋 功能概述

在本体库的"行为测试"Tab下实现一个可视化的行为编排与测试系统，支持从行为库中选择行为、拖拽编排、配置参数并执行测试。

## ✅ 实现状态：已完成

所有功能已完整实现，包括：

- ✅ 空状态页面
- ✅ 三列布局（左侧行为列表、中间编排区、右侧参数配置）
- ✅ 动态参数配置系统（支持10种控件类型）
- ✅ 节点配置状态实时显示
- ✅ 表单验证与保存
- ✅ 测试执行与历史记录

## 🎯 核心功能

### 1. 空状态页面

- 默认展示空状态提示："您还没有行为，暂不能进行行为测试"
- 提供"创建行为"按钮，点击后进入三列布局

### 2. 三列布局

- **左侧**：行为卡片列表（Behavior Card List）
- **中间**：行为编排区域（Orchestration Canvas）
- **右侧**：参数配置面板（Config Panel）- 动态表单系统

### 3. 交互流程

1. 从左侧选择行为卡片 → 中间编排区添加节点
2. 点击中间节点 → 右侧显示对应参数配置表单
3. 配置参数并保存 → 节点卡片实时回显配置信息
4. 所有节点配置完成 → 测试按钮激活
5. 点击测试 → 执行编排流程并显示结果

## 🏗️ 项目结构设计

### 完整目录结构（避免与"行为列表"冲突）

```
src/pages/ontologyScene/modules/behaviorActions/
├── index.tsx                          # 主入口（Tab 切换）
├── index.module.scss                  # 主样式
├── components/
│   ├── ActionList/                    # 行为列表 Tab（其他人开发）
│   │   ├── index.tsx
│   │   └── ...
│   ├── BehaviorDetail/                # 行为详情（已存在）
│   │   └── ...
│   └── BehaviorTest/                  # 🆕 行为测试 Tab（你开发）
│       ├── index.tsx                  # 测试页面主容器
│       ├── index.module.scss          # 主容器样式
│       ├── components/                # 测试页面的子组件
│       │   ├── EmptyState/            # 空状态组件
│       │   │   ├── index.tsx
│       │   │   └── index.module.scss
│       │   ├── BehaviorCardList/      # 左侧：行为卡片列表
│       │   │   ├── index.tsx
│       │   │   ├── index.module.scss
│       │   │   ├── BehaviorCard.tsx   # 单个行为卡片
│       │   │   └── BehaviorCard.module.scss
│       │   ├── OrchestrationCanvas/   # 中间：编排画布
│       │   │   ├── index.tsx
│       │   │   ├── index.module.scss
│       │   │   ├── OrchestrationNode.tsx  # 编排节点卡片
│       │   │   ├── OrchestrationNode.module.scss
│       │   │   └── AddNodePlaceholder.tsx # 添加节点占位符
│       │   └── ConfigPanel/           # 右侧：参数配置面板
│       │       ├── index.tsx
│       │       ├── index.module.scss
│       │       ├── DynamicForm/       # 动态表单渲染器
│       │       │   ├── index.tsx
│       │       │   └── FormFieldRenderer.tsx
│       │       └── EmptyConfig.tsx    # 未选中节点时的空状态
│       ├── hooks/                     # 测试页面的 hooks
│       │   ├── useBehaviorList.ts     # 获取行为列表数据
│       │   ├── useOrchestration.ts    # 编排逻辑（添加/删除/排序节点）
│       │   └── useNodeConfig.ts       # 节点配置管理
│       ├── store/                     # 测试页面的状态管理
│       │   └── behaviorTestStore.ts   # Zustand 状态管理
│       ├── types/                     # 测试页面的类型
│       │   └── index.ts               # 类型定义
│       └── utils/                     # 测试页面的工具函数
│           ├── configValidator.ts     # 配置验证工具
│           └── testExecutor.ts        # 测试执行工具
├── types/                             # 共享类型
│   └── behaviorActions.ts             # 已存在（共享）
└── utils/                             # 共享工具函数（如果需要）
```

### 关键说明

1. **完全隔离**：所有行为测试相关代码都在 `components/BehaviorTest/` 下
2. **不影响他人**：其他人的 `ActionList` 代码不受影响
3. **自包含**：hooks、store、types、utils 都在 BehaviorTest 内部
4. **共享类型**：可以使用外层的 `types/behaviorActions.ts`

## 📦 状态管理设计（Zustand）

### Store 结构

```typescript
// store/behaviorTestStore.ts
interface BehaviorTestStore {
  // ===== 行为库数据 =====
  behaviorList: BehaviorItem[]; // 左侧行为卡片列表
  loadingBehaviors: boolean;
  fetchBehaviors: () => Promise<void>;

  // ===== 编排节点数据 =====
  orchestrationNodes: OrchestrationNode[]; // 中间编排的节点列表
  addNode: (behavior: BehaviorItem) => void;
  removeNode: (nodeId: string) => void;
  updateNodeConfig: (nodeId: string, config: any) => void;
  reorderNodes: (startIndex: number, endIndex: number) => void;

  // ===== 当前选中节点 =====
  selectedNodeId: string | null;
  selectNode: (nodeId: string | null) => void;

  // ===== 配置状态 =====
  nodeConfigs: Record<string, NodeConfig>; // 每个节点的配置数据
  isNodeConfigured: (nodeId: string) => boolean;

  // ===== 测试执行 =====
  isTestRunning: boolean;
  testResults: TestResult[];
  executeTest: () => Promise<void>;

  // ===== UI 状态 =====
  isEmpty: boolean; // 是否显示空状态
  setIsEmpty: (isEmpty: boolean) => void;

  // ===== 重置 =====
  reset: () => void;
}
```

### 状态分层设计

1. **数据层**：`behaviorList`、`orchestrationNodes`、`nodeConfigs`
2. **UI 层**：`selectedNodeId`、`isEmpty`、`loadingBehaviors`
3. **业务层**：`isTestRunning`、`testResults`
4. **操作层**：各种 action 方法

## 🎨 组件拆分设计（详细版）

### 组件层级结构

```
BehaviorTest (容器)
├── EmptyState (空状态)
│   └── EmptyIcon (空状态图标)
├── TestLayout (三列布局容器)
│   ├── LeftPanel (左侧面板)
│   │   ├── PanelHeader (面板头部)
│   │   │   ├── SearchInput (搜索框)
│   │   │   └── FilterDropdown (筛选下拉)
│   │   └── BehaviorCardList (卡片列表)
│   │       └── BehaviorCard (单个卡片) ⭐
│   │           ├── CardBorder (左侧彩色边框)
│   │           ├── CardHeader (卡片头部)
│   │           │   ├── CardTitle (标题)
│   │           │   └── CopyButton (复制按钮)
│   │           ├── CardDescription (描述)
│   │           └── CardFooter (底部标签)
│   │               └── ObjectTypeTag (对象类型标签)
│   ├── MiddlePanel (中间面板)
│   │   ├── CanvasHeader (画布头部)
│   │   │   ├── CanvasTitle (标题)
│   │   │   ├── RefreshButton (刷新按钮)
│   │   │   ├── HistoryButton (历史按钮)
│   │   │   └── TestButton (测试按钮)
│   │   └── OrchestrationCanvas (编排画布)
│   │       ├── OrchestrationNode (编排节点) ⭐
│   │       │   ├── NodeHeader (节点头部)
│   │       │   │   ├── NodeTitle (节点标题)
│   │       │   │   ├── ExpandButton (展开按钮)
│   │       │   │   └── DeleteButton (删除按钮)
│   │       │   ├── NodeBody (节点内容)
│   │       │   │   ├── ConfigField (配置字段)
│   │       │   │   └── ConfigStatus (配置状态)
│   │       │   └── NodeBorder (节点边框 - 选中高亮)
│   │       ├── NodeConnector (节点连接线)
│   │       └── AddNodePlaceholder (添加节点占位符)
│   └── RightPanel (右侧面板)
│       ├── PanelHeader (面板头部)
│       │   ├── PanelTitle (标题)
│       │   ├── CollapseButton (收起按钮)
│       │   └── ExpandButton (展开按钮)
│       └── ConfigPanel (配置面板)
│           ├── EmptyConfig (空状态 - 未选中节点)
│           ├── ConfigHeader (配置头部 - 显示节点名称)
│           └── DynamicForm (动态表单) ⭐
│               ├── FormField (表单字段容器)
│               │   ├── FieldLabel (字段标签)
│               │   ├── RequiredMark (必填标记)
│               │   └── FieldInput (字段输入)
│               └── FormFieldRenderer (字段渲染器)
│                   ├── InputField (文本输入)
│                   ├── SelectField (下拉选择)
│                   ├── SwitchField (开关)
│                   ├── DateField (日期选择)
│                   ├── UploadField (文件上传)
│                   └── CustomField (自定义组件)
```

---

## 📦 组件详细设计

### 🏗️ 容器组件（3个）

#### 1. BehaviorTest（主容器）

**职责**：

- 管理整体布局
- 控制空状态/内容状态切换
- 初始化数据加载

**Props**：无（从 store 获取状态）

**状态**：

```typescript
const isEmpty = useBehaviorTestStore((state) => state.isEmpty);
const orchestrationNodes = useBehaviorTestStore(
  (state) => state.orchestrationNodes
);
```

**渲染逻辑**：

```typescript
return isEmpty ? <EmptyState / > : <TestLayout / >;
```

---

#### 2. TestLayout（三列布局容器）

**职责**：

- 管理三列布局（Grid/Flex）
- 处理面板宽度调整（可选）
- 提供响应式布局

**Props**：无

**样式**：

```scss
.test-layout {
  display: grid;
  grid-template-columns: 320px 1fr 360px;
  height: 100%;
  gap: 0;

  .left-panel {
    border-right: 1px solid #e5e6eb;
  }

  .middle-panel {
    background: #f7f8fa;
  }

  .right-panel {
    border-left: 1px solid #e5e6eb;
  }
}
```

---

#### 3. EmptyState（空状态）

**职责**：

- 展示空状态提示
- 提供"创建行为"按钮

**Props**：

```typescript
interface EmptyStateProps {
  onCreateBehavior?: () => void; // 可选，默认切换到内容状态
}
```

**子组件**：

- `EmptyIcon`：空状态图标（SVG）
- `EmptyText`：提示文字
- `CreateButton`：创建按钮

---

### 📋 左侧面板组件（5个）

#### 4. LeftPanel（左侧面板容器）

**职责**：

- 包裹左侧所有内容
- 管理滚动区域

**结构**：

```tsx
<div className="left-panel">
  <PanelHeader />
  <BehaviorCardList />
</div>
```

---

#### 5. PanelHeader（面板头部）

**职责**：

- 显示"行为卡片"标题
- 提供搜索和筛选功能

**Props**：

```typescript
interface PanelHeaderProps {
  title: string;
  onSearch?: (keyword: string) => void;
  onFilter?: (filters: any) => void;
}
```

**子组件**：

- `SearchInput`：搜索框（Arco Input.Search）
- `FilterDropdown`：筛选下拉（Arco Dropdown）

---

#### 6. BehaviorCardList（卡片列表）

**职责**：

- 渲染行为卡片列表
- 处理虚拟滚动（如果数据量大）
- 管理加载状态

**Props**：无（从 store 获取）

**关键逻辑**：

```typescript
const { behaviorList, loading, addNode } = useBehaviorTestStore();

const handleCardClick = (behavior: BehaviorItem) => {
  addNode(behavior);
};
```

---

#### 7. BehaviorCard（行为卡片）⭐ 核心组件

**职责**：

- 展示单个行为信息
- 处理点击事件（添加到编排区）
- 显示详情按钮（打开行为详情抽屉）

**Props**：

```typescript
interface BehaviorCardProps {
  behavior: BehaviorItem;
  onClick: (behavior: BehaviorItem) => void;
  onViewDetail: (behavior: BehaviorItem) => void; // 🆕 查看详情
  className?: string;
}
```

**结构**：

```tsx
<div className="behavior-card" onClick={() => onClick(behavior)}>
  <CardBorder color={behavior.color} />
  <CardHeader>
    <CardTitle>{behavior.name}</CardTitle>
    <div className="actions">
      <IconInfoCircle
        onClick={(e) => {
          e.stopPropagation(); // 阻止冒泡
          onViewDetail(behavior);
        }}
      />
    </div>
  </CardHeader>
  <CardDescription>{behavior.description}</CardDescription>
  <CardFooter>
    <ObjectTypeTag type={behavior.objectType} />
  </CardFooter>
</div>
```

**子组件**：

- `CardBorder`：左侧彩色边框（绝对定位）
- `CardHeader`：头部（标题 + 详情按钮）
- `CardTitle`：标题（支持省略）
- `CardDescription`：描述（支持多行省略）
- `CardFooter`：底部标签区
- `ObjectTypeTag`：对象类型标签（Arco Tag）

---

#### 8. ObjectTypeTag（对象类型标签）

**职责**：

- 显示对象类型
- 根据类型显示不同颜色

**Props**：

```typescript
interface ObjectTypeTagProps {
  type: string;
  icon?: ReactNode;
}
```

**颜色映射**：

```typescript
const colorMap = {
  多媒体情报: 'purple',
  作战单元: 'orange',
  作战编队: 'magenta',
  战术预案: 'cyan'
};
```

---

### 🎨 中间面板组件（7个）

#### 9. MiddlePanel（中间面板容器）

**职责**：

- 包裹中间所有内容
- 管理画布滚动

**结构**：

```tsx
<div className="middle-panel">
  <CanvasHeader />
  <OrchestrationCanvas />
</div>
```

---

#### 10. CanvasHeader（画布头部）

**职责**：

- 显示"行为编排"标题
- 提供刷新、历史、测试按钮

**Props**：

```typescript
interface CanvasHeaderProps {
  onRefresh: () => void; // 🆕 刷新按钮
  onHistory: () => void; // 🆕 历史记录按钮
  onTest: () => void;
  testDisabled: boolean;
  testLoading: boolean;
}
```

**布局**：

```tsx
<div className="canvas-header">
  <CanvasTitle>行为编排</CanvasTitle>
  <div className="actions">
    <Tooltip content="刷新">
      <IconRefresh onClick={onRefresh} />
    </Tooltip>
    <Tooltip content="历史记录">
      <IconHistory onClick={onHistory} />
    </Tooltip>
    <Button
      type="primary"
      icon={<IconPlayArrow />}
      onClick={onTest}
      disabled={testDisabled}
      loading={testLoading}
    >
      测试
    </Button>
  </div>
</div>
```

---

#### 11. OrchestrationCanvas（编排画布）

**职责**：

- 渲染编排节点列表
- 显示节点连接线
- 提供添加节点占位符

**Props**：无（从 store 获取）

**关键逻辑**：

```typescript
const { orchestrationNodes, selectedNodeId, selectNode, removeNode } = useBehaviorTestStore();

return (
  <div className = "orchestration-canvas" >
    {
      orchestrationNodes.map((node, index) => (
        <React.Fragment key = { node.id } >
        <OrchestrationNode
          node = { node }
      isSelected = { selectedNodeId === node.id
    }
onClick = {()
=>
selectNode(node.id)
}
onDelete = {()
=>
removeNode(node.id)
}
/>
{
  index < orchestrationNodes.length - 1 && <NodeConnector / >
}
</React.Fragment>
))
}
<AddNodePlaceholder / >
</div>
)
;
```

---

#### 12. OrchestrationNode（编排节点）⭐ 核心组件

**职责**：

- 展示节点信息
- 支持展开/收起
- 显示配置状态
- 处理选中/删除

**Props**：

```typescript
interface OrchestrationNodeProps {
  node: OrchestrationNode;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}
```

**状态**：

```typescript
const [isExpanded, setIsExpanded] = useState(node.isExpanded);
```

**结构**：

```tsx
<div
  className={cn('orchestration-node', {
    selected: isSelected,
    configured: node.isConfigured
  })}
  onClick={onClick}
>
  <NodeBorder isSelected={isSelected} />
  <NodeHeader>
    <NodeTitle>{node.behavior.name}</NodeTitle>
    <div className="actions">
      <ExpandButton
        expanded={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
      />
      <DeleteButton onClick={onDelete} />
    </div>
  </NodeHeader>
  {isExpanded && (
    <NodeBody>
      <ConfigField label="目标编队" value={config.target || '未配置'} />
      {/* 更多配置字段 */}
    </NodeBody>
  )}
</div>
```

**子组件**：

- `NodeBorder`：节点边框（选中时高亮）
- `NodeHeader`：节点头部
- `NodeTitle`：节点标题
- `ExpandButton`：展开/收起按钮（IconRight/IconDown）
- `DeleteButton`：删除按钮（IconDelete）
- `NodeBody`：节点内容（展开时显示）
- `ConfigField`：配置字段展示

---

#### 13. NodeConnector（节点连接线）

**职责**：

- 显示节点间的连接线
- 可选：显示箭头

**Props**：

```typescript
interface NodeConnectorProps {
  type?: 'solid' | 'dashed';
}
```

**样式**：

```scss
.node-connector {
  width: 2px;
  height: 24px;
  background: #e5e6eb;
  margin: 0 auto;

  &::after {
    content: '';
    display: block;
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 6px solid #e5e6eb;
    margin: 0 auto;
  }
}
```

---

#### 14. AddNodePlaceholder（添加节点占位符）

**职责**：

- 显示虚线框
- 提示用户点击左侧添加节点

**Props**：无

**结构**：

```tsx
<div className="add-node-placeholder">
  <IconPlus className="icon" />
  <span className="text">点击左侧列表添加作节点</span>
</div>
```

**样式**：

```scss
.add-node-placeholder {
  border: 2px dashed #e5e6eb;
  border-radius: 8px;
  padding: 48px 24px;
  text-align: center;
  background: #f7f8fa;

  .icon {
    font-size: 32px;
    color: #c9cdd4;
    margin-bottom: 12px;
  }

  .text {
    font-size: 14px;
    color: #86909c;
  }
}
```

---

#### 15. BehaviorDetailDrawer（行为详情抽屉）🆕 核心组件

**职责**：

- 展示行为详细信息
- 支持编辑跳转

**Props**：

```typescript
interface BehaviorDetailDrawerProps {
  visible: boolean;
  behavior: BehaviorItem | null;
  onClose: () => void;
  onEdit?: (behavior: BehaviorItem) => void;
}
```

**结构**：

```tsx
<OsDrawer
  visible={visible}
  title="行为详情"
  onCancel={onClose}
  onEdit={() => onEdit?.(behavior)}
  width={720}
>
  <div className="behavior-detail">
    {/* 基本信息 */}
    <div className="basic-info">
      <InfoItem label="行为名称" value={behavior.name} />
      <InfoItem label="所属对象类型" value={behavior.objectType} tag />
      <InfoItem label="描述说明" value={behavior.description} />
      <InfoItem label="函数" value={behavior.functionName} />
      <InfoItem label="id" value={behavior.identifier} copyable />
    </div>

    {/* Tab 切换 */}
    <Tabs defaultActiveTab="params">
      <Tabs.TabPane title="参数配置 (5)" key="params">
        <ParamsTable params={behavior.configSchema?.fields || []} />
      </Tabs.TabPane>
      <Tabs.TabPane title="校验规则 (3)" key="validation">
        <ValidationRules rules={behavior.validationRules || []} />
      </Tabs.TabPane>
      <Tabs.TabPane title="函数" key="function">
        <FunctionCode code={behavior.functionCode || ''} />
      </Tabs.TabPane>
    </Tabs>
  </div>
</OsDrawer>
```

**子组件**：

- `InfoItem`：信息展示项（label + value）
- `ParamsTable`：参数列表表格
- `ValidationRules`：校验规则展示
- `FunctionCode`：函数代码展示

---

#### 16. TestHistoryDrawer（测试历史抽屉）🆕 核心组件

**职责**：

- 展示历史测试记录
- 支持恢复历史编排（可选）

**Props**：

```typescript
interface TestHistoryDrawerProps {
  visible: boolean;
  onClose: () => void;
  onRestore?: (historyItem: HistoryItem) => void; // 可选：恢复历史编排
}
```

**结构**：

```tsx
<Drawer visible={visible} title="测试历史" onCancel={onClose} width={600}>
  <div className="test-history">
    {historyList.map((item) => (
      <HistoryCard
        key={item.id}
        item={item}
        onClick={() => onRestore?.(item)}
      />
    ))}
  </div>
</Drawer>
```

**HistoryCard 结构**：

```tsx
<div className="history-card">
  <div className="header">
    <span className="time">{item.createdAt}</span>
    <Tag color={item.status === 'success' ? 'green' : 'red'}>
      {item.status === 'success' ? '成功' : '失败'}
    </Tag>
  </div>
  <div className="content">
    <div className="info">
      <span>节点数量：{item.nodeCount}</span>
      <span>执行时长：{item.duration}ms</span>
    </div>
    {onRestore && (
      <Button size="small" onClick={() => onRestore(item)}>
        恢复
      </Button>
    )}
  </div>
</div>
```

---

#### 17. ConfigField（配置字段展示）

**职责**：

- 在节点卡片中展示配置信息
- 支持未配置状态

**Props**：

```typescript
interface ConfigFieldProps {
  label: string;
  value: string | ReactNode;
  status?: 'configured' | 'unconfigured';
}
```

**结构**：

```tsx
<div className="config-field">
  <span className="label">{label}</span>
  <span className={cn('value', { unconfigured: status === 'unconfigured' })}>
    {value}
  </span>
</div>
```

---

### ⚙️ 右侧面板组件（由其他人实现）

> **注意**：右侧参数配置面板由其他人负责实现，这里只定义接口规范。

#### ConfigPanel 接口规范

**Props**：

```typescript
interface ConfigPanelProps {
  // 当前选中的节点 ID
  selectedNodeId: string | null;

  // 当前选中节点的配置 Schema
  configSchema?: ConfigSchema;

  // 当前配置值
  config: Record<string, any>;

  // 配置变化回调
  onConfigChange: (config: Record<string, any>) => void;

  // 配置完成回调（可选）
  onConfigComplete?: () => void;
}
```

**使用示例**：

```typescript
// 在 BehaviorTest 中使用
const { selectedNodeId, orchestrationNodes, nodeConfigs, updateNodeConfig } = useBehaviorTestStore();

const selectedNode = orchestrationNodes.find(n => n.id === selectedNodeId);

<ConfigPanel
  selectedNodeId = { selectedNodeId }
configSchema = { selectedNode?.behavior.configSchema
}
config = { nodeConfigs[selectedNodeId] || {} }
onConfigChange = {(config)
=>
{
  updateNodeConfig(selectedNodeId, config);
}
}
/>
```

**ConfigPanel 状态**：

1. **未选中节点**（默认状态）🆕

```tsx
<div className="config-panel-empty">
  <EmptyIcon />
  <span>请先选择行为</span>
</div>
```

2. **已选中节点**

- 显示节点名称
- 显示配置表单
- 右上角有 2 个 icon（功能待确定）

**ConfigPanel Header**：

```tsx
<div className="config-panel-header">
  <span className="title">参数配置</span>
  <div className="actions">
    <Tooltip content="功能待定">
      <IconQuestionCircle />
    </Tooltip>
    <Tooltip content="功能待定">
      <IconRight />
    </Tooltip>
  </div>
</div>
```

**ConfigSchema 数据结构**：

```typescript
interface ConfigSchema {
  fields: ConfigField[];
}

interface ConfigField {
  name: string; // 字段名
  label: string; // 字段标签
  type: 'input' | 'select' | 'switch' | 'date' | 'upload' | 'custom';
  required?: boolean; // 是否必填
  placeholder?: string; // 占位符
  options?: Array<{
    // 选项（select 类型）
    label: string;
    value: any;
  }>;
  defaultValue?: any; // 默认值
  validation?: (value: any) => boolean | string; // 验证函数
}
```

---

### 🔧 工具组件（4个）

#### 24. SearchInput（搜索框）

**职责**：

- 提供搜索功能
- 防抖处理

**Props**：

```typescript
interface SearchInputProps {
  placeholder?: string;
  onSearch: (keyword: string) => void;
  debounce?: number;
}
```

---

#### 25. RequiredMark（必填标记）

**职责**：

- 显示红色星号

**Props**：无

**结构**：

```tsx
<span className="required-mark">*</span>
```

---

#### 26. LoadingSpinner（加载动画）

**职责**：

- 显示加载状态

**Props**：

```typescript
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  tip?: string;
}
```

---

#### 27. ErrorBoundary（错误边界）

**职责**：

- 捕获组件错误
- 显示友好提示

**Props**：

```typescript
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}
```

---

## 📊 组件统计（更新）

| 类型           | 数量   | 组件列表                                                                                                          |
| -------------- | ------ | ----------------------------------------------------------------------------------------------------------------- |
| **容器组件**   | 3      | BehaviorTest, TestLayout, EmptyState                                                                              |
| **左侧面板**   | 5      | LeftPanel, PanelHeader, BehaviorCardList, BehaviorCard, ObjectTypeTag                                             |
| **中间面板**   | 7      | MiddlePanel, CanvasHeader, OrchestrationCanvas, OrchestrationNode, NodeConnector, AddNodePlaceholder, ConfigField |
| **抽屉组件**   | 2      | BehaviorDetailDrawer🆕, TestHistoryDrawer🆕                                                                       |
| **右侧面板**   | 1      | ConfigPanel（由其他人实现，只定义接口）                                                                           |
| **工具组件**   | 4      | SearchInput, RequiredMark, LoadingSpinner, ErrorBoundary                                                          |
| **你需要实现** | **22** | 容器(3) + 左侧(5) + 中间(7) + 抽屉(2) + 工具(4) + API/Store                                                       |

---

## 🎯 你需要实现的核心组件（优先级排序）

### Phase 1：基础框架（3个）

1. **BehaviorTest** - 主容器
2. **TestLayout** - 三列布局
3. **EmptyState** - 空状态

### Phase 2：左侧面板（5个）

4. **LeftPanel** - 面板容器
5. **PanelHeader** - 头部（搜索/筛选）
6. **BehaviorCardList** - 卡片列表
7. ⭐ **BehaviorCard** - 单个卡片（核心，包含详情按钮）
8. **ObjectTypeTag** - 类型标签

### Phase 3：中间面板（7个）

9. **MiddlePanel** - 面板容器
10. **CanvasHeader** - 头部（刷新/历史/测试）
11. **OrchestrationCanvas** - 画布容器
12. ⭐ **OrchestrationNode** - 编排节点（核心）
13. **NodeConnector** - 连接线
14. **AddNodePlaceholder** - 添加节点占位符
15. **ConfigField** - 配置字段展示

### Phase 4：抽屉组件（2个）🆕

16. ⭐ **BehaviorDetailDrawer** - 行为详情抽屉（核心）
17. ⭐ **TestHistoryDrawer** - 测试历史抽屉（核心）

### Phase 5：工具组件（4个）

18. **SearchInput** - 搜索框
19. **RequiredMark** - 必填标记
20. **LoadingSpinner** - 加载动画
21. **ErrorBoundary** - 错误边界

### Phase 6：数据层（1个）

22. **API Service + Store** - 数据管理

---

## 🔗 Hooks 设计

### 1. useBehaviorList

**职责**：获取行为列表数据

```typescript
export const useBehaviorList = () => {
  const { behaviorList, loadingBehaviors, fetchBehaviors } =
    useBehaviorTestStore();

  useEffect(() => {
    fetchBehaviors();
  }, []);

  return {
    behaviorList,
    loading: loadingBehaviors,
    refresh: fetchBehaviors
  };
};
```

---

### 2. useOrchestration

**职责**：编排逻辑封装

```typescript
export const useOrchestration = () => {
  const {
    orchestrationNodes,
    addNode,
    removeNode,
    reorderNodes,
    selectedNodeId,
    selectNode
  } = useBehaviorTestStore();

  const handleAddNode = (behavior: BehaviorItem) => {
    const newNode = addNode(behavior);
    selectNode(newNode.id); // 自动选中新节点
  };

  const handleRemoveNode = (nodeId: string) => {
    removeNode(nodeId);
    if (selectedNodeId === nodeId) {
      selectNode(null); // 清除选中状态
    }
  };

  return {
    nodes: orchestrationNodes,
    addNode: handleAddNode,
    removeNode: handleRemoveNode,
    reorderNodes,
    selectedNodeId,
    selectNode
  };
};
```

---

### 3. useNodeConfig

**职责**：节点配置管理

```typescript
export const useNodeConfig = (nodeId: string | null) => {
  const { nodeConfigs, updateNodeConfig, isNodeConfigured } =
    useBehaviorTestStore();

  if (!nodeId) return null;

  const config = nodeConfigs[nodeId] || {};
  const isConfigured = isNodeConfigured(nodeId);

  const updateConfig = (field: string, value: any) => {
    updateNodeConfig(nodeId, { ...config, [field]: value });
  };

  return {
    config,
    isConfigured,
    updateConfig
  };
};
```

---

## 📐 类型定义

```typescript
// components/BehaviorTest/types/index.ts

// 复用外层的 BehaviorActionItem 类型
import { BehaviorActionItem } from '@/pages/ontologyScene/types/behaviorActions';

// 扩展行为项（添加测试相关字段）
export interface BehaviorItem extends BehaviorActionItem {
  icon?: string;
  color?: string;
  configSchema?: ConfigSchema; // 配置表单的 schema
  validationRules?: ValidationRule[]; // 🆕 校验规则
  functionCode?: string; // 🆕 函数代码
}

// 编排节点
export interface OrchestrationNode {
  id: string; // 节点唯一 ID（UUID）
  behaviorId: string; // 关联的行为 ID
  behavior: BehaviorItem; // 行为数据
  order: number; // 排序
  isConfigured: boolean; // 是否已配置
  isExpanded: boolean; // 是否展开详情
}

// 节点配置
export interface NodeConfig {
  [key: string]: any; // 动态配置字段
}

// 配置表单 Schema
export interface ConfigSchema {
  fields: ConfigField[];
}

export interface ConfigField {
  name: string;
  label: string;
  type: 'input' | 'select' | 'switch' | 'date' | 'upload' | 'custom';
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: any }[];
  defaultValue?: any;
  validation?: (value: any) => boolean | string;
  dataType?: string; // 🆕 数据类型（STRING, NUMBER, etc.）
  widget?: string; // 🆕 界面控件（数字选择器、下拉选择等）
}

// 🆕 校验规则
export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  expression: string;
}

// 测试结果
export interface TestResult {
  nodeId: string;
  nodeName: string;
  status: 'success' | 'error' | 'pending';
  output?: any;
  error?: string;
  duration?: number;
}

// 🆕 测试历史记录
export interface HistoryItem {
  id: string;
  createdAt: string;
  nodeCount: number;
  status: 'success' | 'error';
  duration: number;
  nodes: {
    behaviorId: string;
    config: NodeConfig;
  }[];
  results: TestResult[];
}
```

---

## 🎯 关键交互逻辑

### 1. 添加节点流程

```
用户点击左侧行为卡片
  ↓
调用 addNode(behavior)
  ↓
生成新的 OrchestrationNode（UUID + order）
  ↓
添加到 orchestrationNodes 数组
  ↓
自动选中新节点（selectNode）
  ↓
右侧配置面板更新
```

### 2. 查看行为详情流程（🆕）

```
用户点击左侧行为卡片的【详情 icon】
  ↓
打开右侧抽屉（使用 OSDrawer 组件）
  ↓
展示行为详情：
  - 基本信息（行为名称、对象类型、ID、描述、函数）
  - 参数配置 Tab（参数列表：参数显示名称、id、数据类型、界面控件）
  - 校验规则 Tab
  - 函数 Tab
  ↓
点击"编辑"按钮 → 跳转到行为编辑页面
```

### 3. 配置节点流程

```
用户点击中间节点
  ↓
调用 selectNode(nodeId)
  ↓
右侧配置面板根据 selectedNodeId 渲染
  ↓
用户填写配置
  ↓
调用 updateNodeConfig(nodeId, config)
  ↓
验证配置完整性
  ↓
更新节点 isConfigured 状态
  ↓
节点卡片回显配置信息
  ↓
检查所有节点是否配置完成 → 激活测试按钮
```

### 4. 刷新编排流程（🆕）

```
用户点击"刷新"按钮（测试按钮左侧第1个 icon）
  ↓
可能的行为：
  方案1：清空所有编排节点和配置（重置）
  方案2：重新加载行为列表
  方案3：刷新当前编排状态
  ↓
显示确认提示（如果会清空数据）
  ↓
执行刷新操作
```

### 5. 查看测试历史流程（🆕）

```
用户点击"历史"按钮（测试按钮左侧第2个 icon）
  ↓
打开历史记录抽屉/弹窗
  ↓
展示历史测试记录列表：
  - 测试时间
  - 节点数量
  - 测试结果（成功/失败）
  - 执行时长
  ↓
可能的交互：
  方案1：仅查看历史记录
  方案2：点击某条记录 → 恢复该次测试的编排和配置
  ↓
如果选择方案2：
  - 清空当前编排
  - 加载历史记录的节点和配置
  - 右侧配置面板更新
```

### 6. 测试执行流程

```
用户点击"测试"按钮
  ↓
验证所有节点已配置
  ↓
设置 isTestRunning = true
  ↓
按顺序执行每个节点
  ↓
收集执行结果
  ↓
更新 testResults
  ↓
设置 isTestRunning = false
  ↓
展示测试结果（弹窗/抽屉）
  ↓
保存测试历史记录
```

---

## 🎨 样式设计要点

### 布局

- 使用 CSS Grid 实现三列布局
- 左侧固定宽度 320px
- 右侧固定宽度 360px
- 中间自适应

### 行为卡片

- 左侧边框颜色区分类型
- Hover 效果：阴影 + 轻微上移
- 点击后添加到编排区（可添加动画）

### 编排节点

- 选中状态：蓝色边框 + 阴影
- 已配置：显示绿色勾选图标
- 未配置：显示灰色"未配置"标签
- 节点间连接线：虚线 + 箭头

### 配置面板

- 固定在右侧
- 滚动内容区域
- 表单字段间距统一

---

## 🔌 API 设计与 Mock 策略（按项目规范）

### 1. 在 endpoints.ts 中添加端点定义

```typescript
// src/api/endpoints.ts

export const ModaForgeResourceEndpoints = {
  // ... 现有端点

  // 🆕 行为测试相关端点
  // 获取行为列表
  behaviorList: PrefixAimdp + '/ListBehaviors',
  // 执行行为测试
  behaviorTest: PrefixAimdp + '/ExecuteBehaviorTest',
  // 保存编排方案（可选）
  behaviorOrchestration: PrefixAimdp + '/SaveBehaviorOrchestration',
  // 获取历史记录（可选）
  behaviorHistory: PrefixAimdp + '/ListBehaviorHistory'
};
```

---

### 2. 创建 API Service 文件

```typescript
// src/api/behaviorTest.ts

import UAPI from '@/api';

/**
 * 获取行为列表
 */
export function getBehaviorList(params: {
  keyword?: string;
  objectType?: string;
}) {
  return UAPI.RES.behaviorList({}).get(params).inRegion().do();
}

/**
 * 执行行为测试
 */
export function executeBehaviorTest(params: {
  nodes: {
    behaviorId: string;
    config: Record<string, any>;
  }[];
}) {
  return UAPI.RES.behaviorTest({}).post(params).inRegion().do();
}

/**
 * 保存编排方案（可选）
 */
export function saveBehaviorOrchestration(params: {
  name: string;
  description?: string;
  nodes: any[];
}) {
  return UAPI.RES.behaviorOrchestration({}).post(params).inRegion().do();
}

/**
 * 获取历史记录（可选）
 */
export function getBehaviorHistory(params: {
  page?: number;
  pageSize?: number;
}) {
  return UAPI.RES.behaviorHistory({}).get(params).inRegion().do();
}
```

---

### 3. Mock 数据层（开发阶段使用）

```typescript
// components/BehaviorTest/mocks/index.ts

import { BehaviorItem, TestResult } from '../types';

// 🔧 Mock 开关（开发时设为 true，接口就绪后设为 false）
export const USE_MOCK = process.env.NODE_ENV === 'development'; // 或者 true

// 延迟函数（模拟网络请求）
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock 行为列表数据
export const mockBehaviorList: BehaviorItem[] = [
  {
    id: '1',
    name: '实体识别',
    description: '从原始图片中识别 AF-101...',
    objectType: '多媒体情报',
    functionName: 'entityRecognition',
    identifier: 'entity_recognition',
    params: 2,
    color: '#722ED1',
    icon: '🔍',
    configSchema: {
      fields: [
        {
          name: 'targetTeam',
          label: '目标编队',
          type: 'select',
          required: true,
          placeholder: '请选择目标编队',
          options: [
            { label: '目标编队123', value: 'team_123' },
            { label: '目标编队456', value: 'team_456' }
          ]
        }
      ]
    }
  }
  // ... 更多 Mock 数据
];

// Mock API 函数
export const mockApi = {
  getBehaviorList: async (params) => {
    await delay(500);
    let list = [...mockBehaviorList];
    // 搜索/筛选逻辑
    return list;
  },
  executeBehaviorTest: async (params) => {
    await delay(2000);
    // 返回测试结果
    return [];
  }
};
```

---

### 4. API Service 包装层（支持 Mock 切换）

```typescript
// components/BehaviorTest/services/behaviorTestApi.ts

import * as api from '@/api/behaviorTest';
import { USE_MOCK, mockApi } from '../mocks';

/**
 * 获取行为列表
 */
export const fetchBehaviorList = async (params) => {
  if (USE_MOCK) {
    return mockApi.getBehaviorList(params);
  }

  // 真实 API 调用
  const response = await api.getBehaviorList(params);

  // 适配响应格式（如果需要）
  if (response.data?.list) {
    return response.data.list;
  }
  return response.data || response;
};
```

---

## 📦 Store 设计（双 Store 架构）

### 为什么使用双 Store？

**优势**：

1. ✅ **职责分离**：UI 状态和业务逻辑分离
2. ✅ **易于测试**：业务逻辑可以独立测试
3. ✅ **可维护性**：修改 UI 不影响业务逻辑
4. ✅ **可复用性**：业务 Store 可以在多个组件中使用

---

### Store 1：UI Store（界面状态）

```typescript
// components/BehaviorTest/store/uiStore.ts

import { create } from 'zustand';

interface UIStore {
  // ===== 选中状态 =====
  selectedNodeId: string | null;
  selectNode: (nodeId: string | null) => void;

  // ===== 展开/收起状态 =====
  expandedNodes: Set<string>;
  toggleNodeExpand: (nodeId: string) => void;

  // ===== 搜索/筛选状态 =====
  searchKeyword: string;
  setSearchKeyword: (keyword: string) => void;
  selectedObjectType: string | null;
  setSelectedObjectType: (type: string | null) => void;

  // ===== 加载状态 =====
  loadingBehaviors: boolean;
  setLoadingBehaviors: (loading: boolean) => void;
  isTestRunning: boolean;
  setIsTestRunning: (running: boolean) => void;

  // ===== 空状态 =====
  isEmpty: boolean;
  setIsEmpty: (empty: boolean) => void;

  // ===== 重置 =====
  resetUI: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  // 初始状态
  selectedNodeId: null,
  expandedNodes: new Set(),
  searchKeyword: '',
  selectedObjectType: null,
  loadingBehaviors: false,
  isTestRunning: false,
  isEmpty: true,

  // Actions
  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),
  toggleNodeExpand: (nodeId) =>
    set((state) => {
      const newExpanded = new Set(state.expandedNodes);
      if (newExpanded.has(nodeId)) {
        newExpanded.delete(nodeId);
      } else {
        newExpanded.add(nodeId);
      }
      return { expandedNodes: newExpanded };
    }),
  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),
  setSelectedObjectType: (type) => set({ selectedObjectType: type }),
  setLoadingBehaviors: (loading) => set({ loadingBehaviors: loading }),
  setIsTestRunning: (running) => set({ isTestRunning: running }),
  setIsEmpty: (empty) => set({ isEmpty: empty }),
  resetUI: () =>
    set({
      selectedNodeId: null,
      expandedNodes: new Set(),
      searchKeyword: '',
      selectedObjectType: null,
      loadingBehaviors: false,
      isTestRunning: false,
      isEmpty: true
    })
}));
```

---

### Store 2: Business Store（业务逻辑）

```typescript
// components/BehaviorTest/store/businessStore.ts

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { fetchBehaviorList, executeTest } from '../services/behaviorTestApi';

interface BusinessStore {
  // ===== 数据 =====
  behaviorList: BehaviorItem[];
  orchestrationNodes: OrchestrationNode[];
  nodeConfigs: Record<string, NodeConfig>;
  testResults: TestResult[];

  // ===== 业务操作 =====
  fetchBehaviors: (params?) => Promise<void>;
  addNode: (behavior: BehaviorItem) => string;
  removeNode: (nodeId: string) => void;
  updateNodeConfig: (nodeId: string, config: NodeConfig) => void;
  executeTest: () => Promise<void>;

  // ===== 查询方法 =====
  isNodeConfigured: (nodeId: string) => boolean;
  canExecuteTest: () => boolean;

  // ===== 重置 =====
  resetBusiness: () => void;
}

export const useBusinessStore = create<BusinessStore>((set, get) => ({
  // 初始状态
  behaviorList: [],
  orchestrationNodes: [],
  nodeConfigs: {},
  testResults: []

  // 实现略...
}));
```

---

### 组合使用两个 Store

```typescript
// components/BehaviorTest/index.tsx

import { useUIStore } from './store/uiStore';
import { useBusinessStore } from './store/businessStore';

export default function BehaviorTest() {
  // UI Store
  const { selectedNodeId, selectNode } = useUIStore();

  // Business Store
  const { behaviorList, addNode } = useBusinessStore();

  // 添加节点并自动选中
  const handleAddNode = (behavior) => {
    const nodeId = addNode(behavior);
    selectNode(nodeId); // UI 操作
  };

  return (/* ... */);
}
```

---

## 🎯 双 Store 架构优势

### UI Store 职责

- ✅ 选中状态、展开/收起状态
- ✅ 搜索/筛选状态
- ✅ 加载状态、空状态

### Business Store 职责

- ✅ 数据管理（行为列表、节点、配置）
- ✅ API 调用
- ✅ 业务逻辑（添加/删除节点、配置验证）

### 分离的好处

1. **UI 变化不影响业务**
2. **业务逻辑可测试**
3. **代码更清晰**
4. **性能优化**

---

## 🔄 最小成本切换真实接口

### 步骤 1：开发阶段

```typescript
export const USE_MOCK = true; // 使用 Mock 数据
```

### 步骤 2：接口就绪

```typescript
export const USE_MOCK = false; // 切换为真实接口
```

### 步骤 3：响应格式适配（如果需要）

```typescript
// 在 Service 层添加适配器
if (response.data?.list) return response.data.list;
if (response.data?.behaviors) return response.data.behaviors;
return response.data || response;
```

---

### API 接口定义（原始版本 - 已废弃）

#### 1. 获取行为列表

```typescript
GET / api / ontology / { osId }
/behaviors

Query
Parameters:
  -keyword ? : string        // 搜索关键词
  - objectType ? : string     // 对象类型筛选
  - page ? : number          // 分页（可选）
  - pageSize ? : number      // 每页数量（可选）

Response: {
  code: number;
  message: string;
  data: {
    list: BehaviorItem[];
    total: number;
  }
}

// BehaviorItem 结构
interface BehaviorItem {
  id: string;
  name: string;
  description: string;
  objectType: string;
  functionName: string;
  identifier: string;
  params: number;
  icon?: string;
  color?: string;
  configSchema?: ConfigSchema;  // 配置表单的 schema
}
```

#### 2. 执行测试

```typescript
POST / api / ontology / { osId }
/behaviors/
test

Body: {
  nodes: {
    behaviorId: string;
    config: Record<string, any>;
  }
  []
}

Response: {
  code: number;
  message: string;
  data: {
    results: TestResult[];
    totalDuration: number;
  }
}

// TestResult 结构
interface TestResult {
  nodeId: string;
  nodeName: string;
  status: 'success' | 'error' | 'pending';
  output?: any;
  error?: string;
  duration?: number;
}
```

#### 3. 保存编排方案（可选）

```typescript
POST / api / ontology / { osId }
/behaviors/
orchestration

Body: {
  name: string;
  description ? : string;
  nodes: {
    behaviorId: string;
    order: number;
    config: Record<string, any>;
  }
  []
}

Response: {
  code: number;
  message: string;
  data: {
    id: string;
    createdAt: string;
  }
}
```

#### 4. 获取历史记录（可选）

```typescript
GET / api / ontology / { osId }
/behaviors/
history

Query
Parameters:
  -page ? : number
  - pageSize ? : number

Response: {
  code: number;
  message: string;
  data: {
    list: {
      id: string;
      name: string;
      createdAt: string;
      nodes: any[];
    }
    [];
    total: number;
  }
}
```

---

### Mock 数据设计

#### Mock 行为列表数据

```typescript
// components/BehaviorTest/mocks/behaviorList.ts

export const mockBehaviorList: BehaviorItem[] = [
  {
    id: '1',
    name: '实体识别',
    description: '从原始图片中识别 AF-101...',
    objectType: '多媒体情报',
    functionName: 'entityRecognition',
    identifier: 'entity_recognition',
    params: 2,
    color: '#722ED1',
    icon: '🔍',
    configSchema: {
      fields: [
        {
          name: 'targetTeam',
          label: '目标编队',
          type: 'select',
          required: true,
          placeholder: '请选择目标编队',
          options: [
            { label: '目标编队123', value: 'team_123' },
            { label: '目标编队456', value: 'team_456' }
          ]
        },
        {
          name: 'confidence',
          label: '置信度阈值',
          type: 'input',
          required: false,
          placeholder: '请输入置信度（0-1）',
          defaultValue: '0.8'
        }
      ]
    }
  },
  {
    id: '2',
    name: '关联分析与印证',
    description: '输入目标坐标与归属编...',
    objectType: '作战单元',
    functionName: 'correlationAnalysis',
    identifier: 'correlation_analysis',
    params: 3,
    color: '#FA8C16',
    icon: '🔗',
    configSchema: {
      fields: [
        {
          name: 'infoSource',
          label: '情报源',
          type: 'select',
          required: true,
          options: [
            { label: '卫星图像', value: 'satellite' },
            { label: '雷达数据', value: 'radar' }
          ]
        },
        {
          name: 'position',
          label: '坐标位置',
          type: 'input',
          required: true,
          placeholder: '请输入坐标'
        }
      ]
    }
  },
  {
    id: '3',
    name: '威胁研判',
    description: '划定 1000km 威胁圈，排...',
    objectType: '作战编队',
    functionName: 'threatAssessment',
    identifier: 'threat_assessment',
    params: 1,
    color: '#EB2F96',
    icon: '⚠️',
    configSchema: {
      fields: [
        {
          name: 'radius',
          label: '威胁半径（km）',
          type: 'input',
          required: true,
          defaultValue: '1000'
        },
        {
          name: 'threatLevel',
          label: '威胁等级',
          type: 'select',
          required: true,
          options: [
            { label: '高', value: 'high' },
            { label: '中', value: 'medium' },
            { label: '低', value: 'low' }
          ]
        }
      ]
    }
  },
  {
    id: '4',
    name: '执行下发',
    description: '下发 Plan A，实施实体火...',
    objectType: '战术预案',
    functionName: 'executePlan',
    identifier: 'execute_plan',
    params: 2,
    color: '#13C2C2',
    icon: '🚀',
    configSchema: {
      fields: [
        {
          name: 'planName',
          label: '预案名称',
          type: 'select',
          required: true,
          options: [
            { label: 'Plan A', value: 'plan_a' },
            { label: 'Plan B', value: 'plan_b' }
          ]
        },
        {
          name: 'executeTime',
          label: '执行时间',
          type: 'date',
          required: true
        }
      ]
    }
  }
];
```

#### Mock 测试结果数据

```typescript
// components/BehaviorTest/mocks/testResults.ts

export const mockTestResults: TestResult[] = [
  {
    nodeId: 'node_1',
    nodeName: '实体识别',
    status: 'success',
    output: {
      entities: ['AF-101', 'AF-102'],
      confidence: 0.95
    },
    duration: 1200
  },
  {
    nodeId: 'node_2',
    nodeName: '关联分析与印证',
    status: 'success',
    output: {
      correlations: 5,
      verified: true
    },
    duration: 800
  }
];
```

---

### API Service 层设计（支持 Mock 切换）

#### 创建 API Service

```typescript
// components/BehaviorTest/services/behaviorTestApi.ts

import { mockBehaviorList } from '../mocks/behaviorList';
import { mockTestResults } from '../mocks/testResults';

// 配置：是否使用 Mock 数据
const USE_MOCK = true; // 🔧 切换这里即可

// 延迟函数（模拟网络请求）
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// API 基础配置
const API_BASE_URL = '/api/ontology';

// ===== API 接口 =====

/**
 * 获取行为列表
 */
export const fetchBehaviorList = async (params: {
  osId: string;
  keyword?: string;
  objectType?: string;
}): Promise<BehaviorItem[]> => {
  if (USE_MOCK) {
    await delay(500); // 模拟网络延迟

    let list = [...mockBehaviorList];

    // 模拟搜索
    if (params.keyword) {
      list = list.filter(
        (item) =>
          item.name.includes(params.keyword!) ||
          item.description.includes(params.keyword!)
      );
    }

    // 模拟筛选
    if (params.objectType) {
      list = list.filter((item) => item.objectType === params.objectType);
    }

    return list;
  }

  // 真实 API 调用
  const response = await fetch(
    `${API_BASE_URL}/${params.osId}/behaviors?` +
      new URLSearchParams(params as any)
  );
  const data = await response.json();
  return data.data.list;
};

/**
 * 执行测试
 */
export const executeTest = async (params: {
  osId: string;
  nodes: {
    behaviorId: string;
    config: Record<string, any>;
  }[];
}): Promise<TestResult[]> => {
  if (USE_MOCK) {
    await delay(2000); // 模拟测试执行时间

    // 根据传入的节点生成测试结果
    return params.nodes.map((node, index) => ({
      nodeId: `node_${index + 1}`,
      nodeName:
        mockBehaviorList.find((b) => b.id === node.behaviorId)?.name || '未知',
      status: Math.random() > 0.2 ? 'success' : 'error',
      output: { result: 'mock output' },
      error: Math.random() > 0.8 ? '模拟错误信息' : undefined,
      duration: Math.floor(Math.random() * 2000) + 500
    }));
  }

  // 真实 API 调用
  const response = await fetch(
    `${API_BASE_URL}/${params.osId}/behaviors/test`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodes: params.nodes })
    }
  );
  const data = await response.json();
  return data.data.results;
};

/**
 * 保存编排方案（可选）
 */
export const saveOrchestration = async (params: {
  osId: string;
  name: string;
  description?: string;
  nodes: any[];
}): Promise<{ id: string; createdAt: string }> => {
  if (USE_MOCK) {
    await delay(800);
    return {
      id: `orch_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
  }

  // 真实 API 调用
  const response = await fetch(
    `${API_BASE_URL}/${params.osId}/behaviors/orchestration`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    }
  );
  const data = await response.json();
  return data.data;
};
```

---

### 在 Store 中使用 API Service

```typescript
// components/BehaviorTest/store/behaviorTestStore.ts

import { create } from 'zustand';
import { fetchBehaviorList, executeTest } from '../services/behaviorTestApi';

interface BehaviorTestStore {
  // ... 其他状态

  // 获取行为列表
  fetchBehaviors: () => Promise<void>;

  // 执行测试
  executeTest: () => Promise<void>;
}

export const useBehaviorTestStore = create<BehaviorTestStore>((set, get) => ({
  // ... 其他状态

  behaviorList: [],
  loadingBehaviors: false,

  // 获取行为列表
  fetchBehaviors: async () => {
    set({ loadingBehaviors: true });
    try {
      const list = await fetchBehaviorList({
        osId: 'current_os_id' // 从路由或上下文获取
      });
      set({ behaviorList: list, loadingBehaviors: false });
    } catch (error) {
      console.error('Failed to fetch behaviors:', error);
      set({ loadingBehaviors: false });
    }
  },

  // 执行测试
  executeTest: async () => {
    const { orchestrationNodes, nodeConfigs } = get();

    set({ isTestRunning: true });
    try {
      const results = await executeTest({
        osId: 'current_os_id',
        nodes: orchestrationNodes.map((node) => ({
          behaviorId: node.behaviorId,
          config: nodeConfigs[node.id] || {}
        }))
      });
      set({ testResults: results, isTestRunning: false });
    } catch (error) {
      console.error('Failed to execute test:', error);
      set({ isTestRunning: false });
    }
  }
}));
```

---

### Mock 切换策略

#### 方式 1：环境变量控制（推荐）

```typescript
// .env.development
REACT_APP_USE_MOCK = true;

// .env.production
REACT_APP_USE_MOCK = false;

// services/behaviorTestApi.ts
const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';
```

#### 方式 2：配置文件控制

```typescript
// config/apiConfig.ts
export const API_CONFIG = {
  useMock: true, // 🔧 切换这里
  baseURL: '/api/ontology'
};

// services/behaviorTestApi.ts
import { API_CONFIG } from '@/config/apiConfig';

const USE_MOCK = API_CONFIG.useMock;
```

#### 方式 3：URL 参数控制（开发调试）

```typescript
// services/behaviorTestApi.ts
const urlParams = new URLSearchParams(window.location.search);
const USE_MOCK =
  urlParams.get('mock') === 'true' || process.env.NODE_ENV === 'development';

// 使用：http://localhost:3000/...?mock=true
```

---

### 最小成本切换真实接口

#### 步骤 1：开发阶段使用 Mock

```typescript
// services/behaviorTestApi.ts
const USE_MOCK = true; // 开发时设为 true
```

#### 步骤 2：接口就绪后切换

```typescript
// services/behaviorTestApi.ts
const USE_MOCK = false; // 切换为 false

// 或者使用环境变量
const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';
```

#### 步骤 3：调整真实接口路径（如果需要）

```typescript
// 只需修改 API_BASE_URL 和请求参数
const API_BASE_URL = '/api/v2/ontology'; // 修改这里

// 或者根据环境变量
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api/ontology';
```

#### 步骤 4：处理响应格式差异（如果有）

```typescript
// 添加响应适配器
const adaptResponse = (response: any): BehaviorItem[] => {
  // 如果后端返回格式不同，在这里转换
  if (response.data?.list) {
    return response.data.list;
  }
  return response; // 直接返回
};

export const fetchBehaviorList = async (params: any) => {
  if (USE_MOCK) {
    // ... mock 逻辑
  }

  const response = await fetch(/* ... */);
  const data = await response.json();
  return adaptResponse(data); // 使用适配器
};
```

---

### 优势总结

✅ **开发阶段**：使用 Mock 数据，不依赖后端  
✅ **接口就绪**：一行代码切换（`USE_MOCK = false`）  
✅ **灵活调试**：支持 Mock 和真实接口混用  
✅ **类型安全**：TypeScript 保证接口一致性  
✅ **易于维护**：API 逻辑集中在 Service 层  
✅ **测试友好**：Mock 数据可用于单元测试

---

## 🚀 开发优先级

### Phase 1：基础框架

1. ✅ 创建目录结构
2. ✅ 定义类型（types/behaviorTest.ts）
3. ✅ 实现 Zustand Store
4. ✅ 实现空状态组件

### Phase 2：核心功能

5. ✅ 实现行为卡片列表
6. ✅ 实现编排画布
7. ✅ 实现节点添加/删除
8. ✅ 实现节点选中逻辑

### Phase 3：配置系统

9. ✅ 实现配置面板
10. ✅ 实现动态表单渲染
11. ✅ 实现配置验证

### Phase 4：测试执行

12. ✅ 实现测试按钮激活逻辑
13. ✅ 实现测试执行流程
14. ✅ 实现结果展示

### Phase 5：优化

15. ✅ 添加动画效果
16. ✅ 添加错误处理
17. ✅ 性能优化
18. ✅ 单元测试

---

## 🎯 与"行为列表"Tab 解耦

### 解耦策略

1. **独立状态管理**
   - "行为列表"使用自己的 state
   - "行为测试"使用 `behaviorTestStore`
   - 两者不共享状态

2. **独立组件树**
   - `ActionList` 组件独立
   - `BehaviorTest` 组件独立
   - 通过 Tab 切换控制显示

3. **共享类型定义**
   - 共用 `BehaviorActionItem` 类型
   - 其他类型各自定义

4. **API 调用独立**
   - 各自调用自己需要的接口
   - 不互相依赖

### 主入口改造

```typescript
// src/pages/ontologyScene/modules/behaviorActions/index.tsx
import React, { useState } from 'react';
import { Tabs } from '@arco-design/web-react';
import styles from './index.module.scss';
import { ActionList, BehaviorDetail } from './components';
import BehaviorTest from './components/BehaviorTest'; // 🆕 引入行为测试组件
import { BehaviorActionItem } from '@/pages/ontologyScene/types/behaviorActions';

export default function OntologySceneBehaviorActions() {
  const [activeTab, setActiveTab] = useState('list');
  const [showDetail, setShowDetail] = useState(false);
  const [behaviorData, setBehaviorData] = useState<BehaviorActionItem>();

  return (
    <div className = {`flex h-full w-full flex-col gap-4 overflow-hidden bg-white ${styles['behavior']}`
}>
  <Tabs
    className = { 'flex-shrink-0' }
  activeTab = { activeTab }
  onChange = { setActiveTab }
  >
  <Tabs.TabPane title = { '行为列表' }
  key = { 'list' }
  />
  < Tabs.TabPane
  title = { '行为测试' }
  key = { 'test' }
  />
  < /Tabs>

  < div
  className = { styles['behavior-content'] } >
    { activeTab === 'list' && (
      <ActionList
        onViewDetail = {(data)
=>
  {
    setShowDetail(true);
    setBehaviorData(data);
  }
}
  />
)
}
  {
    activeTab === 'test' && <BehaviorTest / >
  }
  {/* 🆕 行为测试 Tab */
  }
  </div>

  {/* 行为详情抽屉（仅行为列表 Tab 使用） */
  }
  <BehaviorDetail
    show = { showDetail }
  onClose = {()
=>
  {
    setShowDetail(false);
    setBehaviorData(undefined);
  }
}
  data = { behaviorData }
  />
  < /div>
)
  ;
}
```

---

## 📝 注意事项

1. **性能优化**
   - 使用 `React.memo` 优化卡片渲染
   - 使用 Zustand 的 selector 避免不必要的重渲染
   - 虚拟滚动（如果行为列表很长）

2. **错误处理**
   - API 调用失败提示
   - 配置验证错误提示
   - 测试执行失败处理

3. **用户体验**
   - 添加 Loading 状态
   - 添加操作确认（删除节点）
   - 添加快捷键支持（删除、复制等）

4. **可扩展性**
   - 配置 Schema 支持自定义组件
   - 支持节点拖拽排序（可选）
   - 支持保存/加载编排方案（可选）

---

## 🎉 总结

这个架构设计具有以下优势：

✅ **清晰的职责分离**：组件、Hooks、Store 各司其职  
✅ **高度可维护**：模块化设计，易于扩展和修改  
✅ **类型安全**：完整的 TypeScript 类型定义  
✅ **状态管理优雅**：Zustand 简洁高效  
✅ **与现有代码解耦**：不影响"行为列表"功能  
✅ **用户体验优先**：流畅的交互和即时反馈

接下来可以按照 Phase 1-5 的优先级逐步实现！

---

## ⚠️ 重要考虑事项

### 1. 错误处理与边界情况

#### API 错误处理

```typescript
fetchBehaviors: async (params = {}) => {
  try {
    const list = await fetchBehaviorList(params);
    set({ behaviorList: list });
  } catch (error) {
    console.error('Failed to fetch behaviors:', error);
    Message.error({
      content: '获取行为列表失败，请稍后重试',
      duration: 3000,
    });
  }
},
```

#### 边界情况处理

- ❌ 空数据：显示空状态提示
- ❌ 网络错误：显示错误提示 + 重试按钮
- ❌ 配置不完整：禁用测试按钮 + 提示
- ❌ 删除最后一个节点：自动切换到空状态
- ❌ 重复添加同一行为：允许或提示？

---

### 2. 性能优化

#### 虚拟滚动（如果行为列表很长）

```typescript
import { Virtuoso } from 'react-virtuoso';

<Virtuoso
  data = { filteredBehaviorList }
itemContent = {(index, behavior)
=>
(
  <BehaviorCard key = { behavior.id }
behavior = { behavior }
/>
)
}
/>
```

#### React.memo 优化

```typescript
export const BehaviorCard = React.memo<BehaviorCardProps>(
  ({ behavior, onClick }) => {
    // ...
  },
  (prevProps, nextProps) => {
    return prevProps.behavior.id === nextProps.behavior.id;
  }
);
```

#### Zustand Selector 优化

```typescript
// ✅ 推荐：只订阅需要的状态
const selectedNodeId = useUIStore((state) => state.selectedNodeId);
const selectNode = useUIStore((state) => state.selectNode);

// ❌ 不推荐：会导致每次 store 变化都重渲染
const { selectedNodeId, selectNode, ...rest } = useUIStore();
```

---

### 3. 用户体验优化

#### 加载状态

```typescript
{
  loadingBehaviors && <BehaviorCardListSkeleton / >
}
```

#### 操作确认

```typescript
const handleDeleteNode = (nodeId: string) => {
  Modal.confirm({
    title: '确认删除',
    content: '删除后该节点的配置将丢失，确认删除吗？',
    onOk: () => removeNode(nodeId)
  });
};
```

#### 快捷键支持

```typescript
import { useHotkeys } from 'react-hotkeys-hook';

// 删除选中节点
useHotkeys('delete', () => {
  if (selectedNodeId) handleDeleteNode(selectedNodeId);
});

// ESC 取消选中
useHotkeys('esc', () => selectNode(null));
```

#### 拖拽排序（可选）

```typescript
import { ReactSortable } from 'react-sortablejs';

<ReactSortable
  list = { orchestrationNodes }
setList = {(newList)
=>
reorderNodes(newList)
}
>
{
  orchestrationNodes.map(node => (
    <OrchestrationNode key = { node.id }
  node = { node }
  />
))
}
</ReactSortable>
```

---

### 4. 数据持久化（可选）

#### LocalStorage 保存草稿

```typescript
// 保存到 LocalStorage
const saveDraft = () => {
  const { orchestrationNodes, nodeConfigs } = get();
  localStorage.setItem('behavior-test-draft', JSON.stringify({
    nodes: orchestrationNodes,
    configs: nodeConfigs,
    timestamp: Date.now(),
  }));
};

// 在添加/删除/配置节点时自动保存
addNode: (behavior) => {
  // ...
  saveDraft();
  return nodeId;
},
```

#### 提示用户恢复草稿

```typescript
useEffect(() => {
  const draft = localStorage.getItem('behavior-test-draft');
  if (draft) {
    Modal.confirm({
      title: '发现未保存的草稿',
      content: '是否恢复上次编辑的内容？',
      onOk: () => loadDraft(),
      onCancel: () => localStorage.removeItem('behavior-test-draft')
    });
  }
}, []);
```

---

### 5. 测试策略

#### 单元测试（使用 Jest）

```typescript
// components/BehaviorTest/store/__tests__/businessStore.test.ts

import { renderHook, act } from '@testing-library/react-hooks';
import { useBusinessStore } from '../businessStore';

describe('BusinessStore', () => {
  it('should add node correctly', () => {
    const { result } = renderHook(() => useBusinessStore());

    act(() => {
      const nodeId = result.current.addNode(mockBehavior);
      expect(result.current.orchestrationNodes).toHaveLength(1);
    });
  });
});
```

---

### 6. 权限控制（如果需要）

```typescript
import { usePermission } from '@/hooks/usePermission';

const { hasPermission } = usePermission();
const canTest = hasPermission('behavior:test');

<Button
  disabled = {!
canTest || !canExecuteTest()
}
onClick = { handleTest }
  >
  测试
  < /Button>
```

---

### 7. 响应式设计

```typescript
import { Grid } from '@arco-design/web-react';

const { useBreakpoint } = Grid;
const screens = useBreakpoint();

// 根据屏幕大小调整布局
const layoutColumns = screens.lg
  ? '320px 1fr 360px' // 大屏：三列
  : screens.md
    ? '280px 1fr 320px' // 中屏：三列（窄一点）
    : '1fr'; // 小屏：单列
```

---

### 8. Git 提交规范

```bash
# 功能开发
git commit -m "feat(behaviorTest): 实现行为卡片列表组件"

# Bug 修复
git commit -m "fix(behaviorTest): 修复节点删除后选中状态未清除的问题"

# 样式调整
git commit -m "style(behaviorTest): 调整卡片间距和阴影效果"

# 重构
git commit -m "refactor(behaviorTest): 拆分 Store 为 UI Store 和 Business Store"
```

---

## 📋 开发检查清单

### 开发前

- [ ] 确认设计稿细节
- [ ] 确认 API 接口格式
- [ ] 确认右侧配置面板接口
- [ ] 创建 feature 分支

### 开发中

- [ ] 类型定义完整
- [ ] Mock 数据准备
- [ ] 双 Store 实现
- [ ] 组件拆分合理
- [ ] 错误处理完善
- [ ] 加载状态处理
- [ ] 边界情况处理

### 开发后

- [ ] 代码 Review
- [ ] 单元测试覆盖
- [ ] 集成测试通过
- [ ] 性能优化
- [ ] 文档完善
- [ ] ESLint 无警告
- [ ] TypeScript 无错误

---

## 🎯 总结

这个架构设计具有以下优势：

✅ **清晰的职责分离**：组件、Hooks、Store 各司其职  
✅ **高度可维护**：模块化设计，易于扩展和修改  
✅ **类型安全**：完整的 TypeScript 类型定义  
✅ **状态管理优雅**：双 Store 架构，UI 和业务分离  
✅ **与现有代码解耦**：不影响"行为列表"功能  
✅ **用户体验优先**：流畅的交互和即时反馈  
✅ **遵循项目规范**：API 调用、代码风格、提交规范  
✅ **易于测试**：单元测试、集成测试支持  
✅ **性能优化**：虚拟滚动、React.memo、Selector 优化  
✅ **错误处理完善**：边界情况、网络错误、用户提示

接下来可以按照 Phase 1-5 的优先级逐步实现！

---

## 🆕 补充交互说明

### 1. 行为详情抽屉

**触发方式**：点击左侧行为卡片的【详情 icon】

**使用组件**：`src/pages/ontologyScene/componens/OSDrawer`

**展示内容**：

- **基本信息**：
  - 行为名称
  - 所属对象类型（带标签）
  - 描述说明
  - 函数
  - id（可复制）

- **Tab 切换**：
  - 参数配置 (5)：参数显示名称、id、数据类型、界面控件
  - 校验规则 (3)
  - 函数

**操作**：

- 右上角"编辑"按钮：跳转到行为编辑页面

---

### 2. 添加节点占位符

**展示内容**：

- 虚线框
- 加号图标
- 提示文字："点击左侧列表添加作节点"

**样式**：

- 背景色：#F7F8FA
- 边框：2px dashed #E5E6EB
- 居中显示

---

### 3. 画布头部操作按钮

**刷新按钮**（第1个 icon）：

- 图标：IconRefresh
- 功能：清空当前编排（待确认）
- 可能需要确认提示

**历史记录按钮**（第2个 icon）：

- 图标：IconHistory
- 功能：打开测试历史抽屉
- 展示历史测试记录
- 可能支持恢复历史编排（待确认）

**测试按钮**：

- 类型：primary
- 图标：IconPlayArrow
- 状态：根据节点配置情况启用/禁用

---

### 4. 参数配置面板状态

**未选中节点**（默认状态）：

- 显示空状态图标
- 提示文字："请先选择行为"
- 背景色：#FFFFFF

**已选中节点**：

- 显示节点名称
- 显示配置表单（由其他人实现）
- 右上角有 2 个 icon（功能待确定）

---

### 5. 测试历史抽屉

**展示内容**：

- 历史记录列表
- 每条记录包含：
  - 测试时间
  - 节点数量
  - 测试结果（成功/失败）
  - 执行时长

**可能的交互**（待确认）：

- 方案1：仅查看历史记录
- 方案2：点击某条记录 → 恢复该次测试的编排和配置

---

## 🎯 待确认的交互细节

1. **刷新按钮**：
   - 是清空所有编排？
   - 还是重新加载行为列表？
   - 需要确认提示吗？

2. **历史记录**：
   - 仅查看？
   - 还是可以恢复编排？
   - 恢复时是否需要确认？

3. **参数配置右上角 2 个 icon**：
   - 具体功能是什么？
   - 需要实现吗？

4. **重复添加同一行为**：
   - 允许添加多次？
   - 还是提示已存在？

---

---

## 🎨 动态参数配置系统实现详情

### 支持的控件类型

右侧参数配置面板根据节点的 `configSchema` 动态渲染表单，支持以下10种控件类型：

1. **单行文本框** - 基础文本输入
2. **文本域** - 多行文本输入（自动高度调整）
3. **数字步进器** - 整数输入（带加减按钮）
4. **高精度数字输入框** - 浮点数输入（支持精度设置）
5. **切换开关 (Switch)** - 布尔值选择
6. **日期选择器** - 日期选择
7. **日期时间选择器** - 日期+时间选择
8. **地图选择器** - 坐标输入（简化为文本输入）
9. **对象搜索选择器 / 对象集选择器 / 下拉选择** - 下拉选项选择
10. **文件上传区域** - 文件拖拽上传

### 节点配置状态显示

**OrchestrationNode 组件特性：**

- 节点头部显示行为名称
- 右侧显示运行按钮（播放图标）和删除按钮
- 节点内容区域显示所有参数及其配置状态：
  - 未配置：显示 "未配置"（灰色文字）
  - 已配置：显示实际配置值（黑色文字）
- 节点边框颜色：
  - 已配置完成：绿色边框 `#00b42a`
  - 选中状态：蓝色边框 `#165dff` + 阴影
  - 默认状态：灰色边框 `#e5e6eb`

### 配置流程

1. **选择节点**：点击中间编排区的节点
2. **显示表单**：右侧面板显示该节点的参数配置表单
3. **填写参数**：根据字段类型渲染对应控件
4. **实时验证**：表单字段支持必填校验和自定义校验规则
5. **保存配置**：点击"保存"按钮，配置写入 Store
6. **状态更新**：
   - 节点卡片实时显示配置值
   - 检查所有必填字段是否完成
   - 更新节点的 `isConfigured` 状态
   - 更新节点边框颜色
7. **激活测试**：所有节点配置完成后，测试按钮激活

### 表单验证规则

**字段级验证：**

- `required`: 必填校验
- `validation`: 自定义校验函数（返回 `true` 或错误信息字符串）

**示例：**

```typescript
{
  name: 'confidence',
    label
:
  '置信度阈值',
    type
:
  'input',
    required
:
  true,
    validation
:
  (value: any) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '请输入有效数字';
    if (num < 0 || num > 1) return '置信度必须在0-1之间';
    return true;
  },
}
```

**行为级验证规则：**

- 在 `validationRules` 数组中定义
- 在右侧面板底部显示为黄色提示框
- 用于提示用户注意事项

### Mock 数据结构

每个行为包含完整的配置定义：

```typescript
{
  id: '1',
    name
:
  '实体识别',
    description
:
  '从原始图片中识别 AF-101...',
    objectType
:
  '多媒体情报',
    configSchema
:
  {
    fields: [
      {
        name: 'targetTeam',
        label: '目标编队',
        type: 'select',
        required: true,
        placeholder: '请选择目标编队',
        dataType: 'STRING',
        widget: '对象搜索选择器',
        options: [...],
      },
      // ... 更多字段
    ],
  }
,
  validationRules: [
    {
      id: 'rule_1',
      name: '置信度范围校验',
      description: '置信度必须在0-1之间',
      expression: 'confidence >= 0 && confidence <= 1',
    },
  ],
}
```

### 关键实现文件

- **OrchestrationNode**: `components/OrchestrationNode/index.tsx`
  - 显示节点配置状态
  - 运行按钮（单节点执行）
  - 删除按钮
- **RightPanel**: `components/RightPanel/index.tsx`
  - 动态表单渲染
  - 10种控件类型支持
  - 表单验证与保存
  - 重置功能
- **businessStore**: `store/businessStore.ts`
  - `updateNodeConfig`: 更新节点配置
  - `isNodeConfigured`: 检查节点是否配置完成
  - `canExecuteTest`: 检查是否可以执行测试
- **Mock Data**: `mocks/index.ts`
  - 4个示例行为（实体识别、关联分析、威胁研判、执行下发）
  - 每个行为包含完整的字段定义和验证规则

### 样式规范

- 使用 Tailwind CSS 优先
- 三列头部统一高度：`h-14` (56px)
- 统一边框：`border-b border-[#e5e6eb]`
- 统一内边距：`px-4` (16px)
- 滚动区域隐藏滚动条：`scrollbar-hide`
- 颜色规范：
  - 主色：`#165dff`
  - 成功色：`#00b42a`
  - 警告色：`#f7ba1e`
  - 错误色：`#f53f3f`
  - 文字主色：`#1d2129`
  - 文字次色：`#4e5969`
  - 文字禁用：`#86909c`
  - 边框色：`#e5e6eb`

---

## 🚀 使用说明

### 开发模式

Mock 数据开关在 `mocks/index.ts` 中：

```typescript
export const USE_MOCK = process.env.NODE_ENV === 'development';
```

开发环境自动使用 Mock 数据，生产环境调用真实 API。

### 测试流程

1. 切换到"行为测试" Tab
2. 点击"创建行为"进入三列布局
3. 从左侧选择行为卡片（如"实体识别"）
4. 点击中间编排区的节点
5. 在右侧填写参数配置
6. 点击"保存"按钮
7. 节点显示配置值，边框变绿
8. 重复步骤3-7添加更多节点
9. 所有节点配置完成后，点击"测试"按钮
10. 查看测试结果或历史记录

### API 集成

API 端点已定义在 `src/api/endpoints.ts` 和 `src/api/behaviorTest.ts`：

- `getBehaviorList`: 获取行为列表
- `executeBehaviorTest`: 执行测试
- `getBehaviorHistory`: 获取历史记录

切换到生产环境时，将 `USE_MOCK` 设为 `false` 即可。

---

## 📝 总结

动态参数配置系统已完整实现，支持10种控件类型，具备完善的表单验证、实时状态更新和配置回显功能。节点配置状态通过颜色和文字清晰展示，用户体验流畅。
