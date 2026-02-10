# 级联远端加载 + 虚拟滚动选择器 Prompt（Arco Design + ahooks）

## 角色设定

你是一名资深前端工程师，精通 React、TypeScript、Arco Design 组件库，
并熟练使用 ahooks 处理异步请求、状态管理与性能优化。

---

## 需求背景

实现一个 **对象实例选择器（ObjectReference / ObjectSet Selector）** 组件，
用于从远端数据源中选择一个或多个对象实例。

组件需支持：

- 大数据量
- 远端分页加载
- 级联选择
- 高性能虚拟滚动

交互与视觉风格参考 Arco Design。

---

## 技术栈要求

- React（函数组件 + Hooks）
- TypeScript
- Arco Design（Select / Dropdown / Input / Checkbox / Spin 等）
- ahooks（`useRequest` / `useDebounce` / `useThrottle` / `useMemoizedFn`）
- 不依赖第三方虚拟列表库（可自行实现或基于 Arco 内部能力）

---

## 核心功能要求

### 1. 下拉选择器基础能力

- 点击输入框弹出下拉面板
- 支持单选 / 多选（可配置）
- 已选择项以 Tag / Checkbox 状态展示
- 输入框中回显选中路径或对象名称

---

### 2. 数据虚拟滚动（重点）

- 下拉列表支持 **虚拟滚动**
- 可处理 **上千 / 上万条数据**
- 仅渲染可视区域数据
- 下拉面板高度固定，内部列表滚动
- 滚动到底部自动触发下一页数据加载

---

### 3. 远端数据加载

- 所有数据均来自远端接口
- 支持分页加载（page / pageSize）
- 使用 ahooks `useRequest` 管理请求状态
- 支持 loading / error / empty 状态展示
- 支持接口返回结构变化的适配

---

### 4. 级联加载能力（重点）

- 数据存在层级关系（如：省 → 市 → 区 / 目录 → 子目录）
- 初始仅加载第一层数据
- 用户点击某一项后：
  - 异步加载其子级数据
  - 子级数据插入到当前列表结构中
- 支持多层级递归加载
- 已加载节点需缓存，避免重复请求

---

### 5. 搜索能力

- 输入关键字触发远端搜索
- 使用 ahooks `useDebounce` 防抖请求
- 搜索时：
  - 可平铺展示匹配结果
  - 或仅展示命中节点及其路径
- 搜索为空时展示 Empty 状态

---

### 6. 性能与体验要求

- 使用虚拟列表避免大规模 DOM 渲染
- 请求与渲染逻辑解耦
- 避免重复请求相同节点
- 列表项高度可配置或固定
- 下拉面板宽度与选择器保持一致（最小宽度限制）

---

## 数据结构示例

```ts
interface RemoteNode {
  id: string;
  label: string;
  hasChildren: boolean;
  parentId?: string;
}
```
