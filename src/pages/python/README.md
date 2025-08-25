# Python模块重构 - 第一阶段

## 概述

这是Python模块重构的第一阶段，主要完成了基础架构的搭建，包括状态管理、类型定义和核心Hooks的创建。

## 重构内容

### 1. 类型系统 (Types)

- **FileTab**: 文件标签页类型定义
- **FileData**: 文件数据类型定义
- **EditorState**: 编辑器状态类型定义
- **ExecutionState**: 执行状态类型定义
- **PythonState**: 全局状态类型定义
- **PythonAction**: Action类型定义

### 2. 状态管理 (Context & Reducer)

- **PythonContext**: 主状态管理Context
- **pythonReducer**: 状态更新逻辑
- **PythonProvider**: Context Provider组件

### 3. 自定义Hooks

- **useFileManager**: 文件管理核心Hook

## 架构设计

```
src/pages/python/
├── context/
│   └── PythonContext.tsx          # 主状态管理
├── reducers/
│   └── pythonReducer.ts           # 状态更新逻辑
├── hooks/
│   └── useFileManager.ts          # 文件管理Hook
├── types/
│   └── index.ts                   # 类型定义
├── components/                     # 现有组件（待重构）
├── index.tsx                      # 主入口（已更新）
└── index.ts                       # 模块导出
```

## 使用方法

### 1. 在组件中使用Context

```tsx
import { usePythonContext } from './context/PythonContext';

const MyComponent = () => {
  const { state, openFile, saveFile } = usePythonContext();

  // 使用状态和操作方法
  const handleOpenFile = () => {
    openFile('file-id');
  };

  return (
    <div>
      <p>当前文件: {state.files.currentFileId}</p>
      <button onClick={handleOpenFile}>打开文件</button>
    </div>
  );
};
```

### 2. 使用文件管理Hook

```tsx
import { useFileManager } from './hooks/useFileManager';

const FileComponent = () => {
  const { currentFile, hasUnsavedChanges, createNewTab, closeFile } =
    useFileManager();

  return (
    <div>
      <p>当前文件: {currentFile?.title}</p>
      <p>有未保存更改: {hasUnsavedChanges ? '是' : '否'}</p>
      <button onClick={() => createNewTab()}>新建标签页</button>
    </div>
  );
};
```

## 状态结构

### 文件状态 (files)

```typescript
{
  currentFileId: string | null;    // 当前文件ID
  fileTabs: FileTab[];             // 文件标签页列表
  activeTab: string;               // 当前活动标签页
  isLoading: boolean;              // 加载状态
  error: Error | null;             // 错误信息
}
```

### 编辑器状态 (editor)

```typescript
{
  content: string; // 编辑器内容
  isDirty: boolean; // 是否有未保存更改
  lastSaved: string; // 最后保存时间
  readOnly: boolean; // 是否只读
  cursorPosition: {
    // 光标位置
    line: number;
    ch: number;
  }
}
```

### 执行状态 (execution)

```typescript
{
  status: RunningStatus; // 执行状态
  execId: string; // 执行ID
  startTime: Date | null; // 开始时间
  duration: number; // 执行时长
  result: string; // 执行结果
  log: string; // 执行日志
  error: Error | null; // 错误信息
}
```

## 主要特性

1. **统一状态管理**: 使用Context + useReducer管理所有状态
2. **类型安全**: 完整的TypeScript类型定义
3. **逻辑分离**: 业务逻辑与UI组件分离
4. **可复用性**: 自定义Hooks可在多个组件中复用
5. **性能优化**: 使用useCallback优化函数引用

## 下一步计划

### 第二阶段：核心功能重构

- [ ] 实现useEditor hook
- [ ] 实现useExecution hook
- [ ] 实现useAutoSave hook
- [ ] 重构EditorWorkspace组件

### 第三阶段：组件重构

- [ ] 重构标签页管理组件
- [ ] 优化组件间的数据流
- [ ] 添加性能优化

### 第四阶段：测试和优化

- [ ] 功能测试和bug修复
- [ ] 性能优化
- [ ] 代码审查和文档更新

## 注意事项

1. **向后兼容**: 重构过程中保持现有功能不中断
2. **渐进式重构**: 采用小步快跑的方式
3. **充分测试**: 每个重构步骤都要有相应的测试验证
4. **性能监控**: 重构过程中持续监控性能指标

## 贡献指南

1. 遵循现有的代码风格和架构设计
2. 新增功能需要添加相应的类型定义
3. 重要更改需要更新文档
4. 提交前进行充分的测试
