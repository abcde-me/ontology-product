# 地图选点组件 Prompt（React + Arco Design + 高德地图）

## 角色设定

你是一名资深前端工程师，精通 React、Arco Design 组件库，并熟悉高德地图 JavaScript API 的使用与性能优化。

---

## 需求背景

实现一个 **地图选点组件（GeoPointPicker）**，用于在表单中选择地理坐标。

交互形式：

- 点击输入框或定位 icon
- 弹出地图弹窗
- 在地图中选择位置并返回经纬度

---

## 技术栈要求

- React（函数组件 + Hooks）
- TypeScript
- Arco Design（Input / Modal / Button / Icon 等）
- 高德地图 JavaScript API（支持地点搜索）
- 高性能实现，避免重复初始化

---

## 核心功能要求

### 1. 弹窗交互

- 点击输入框或定位 icon
- 弹出 Arco Design 的 Modal
- Modal 内展示高德地图

---

### 2. 地图选点

- 用户点击地图任意位置
- 在点击位置展示 Marker
- 实时获取并记录经纬度（lng, lat）
- 点击「确定」后：
  - 回填到输入框
  - 通过 onChange 向外部抛出坐标

---

### 3. 地点搜索

- 调用高德地图搜索 API（如 `AMap.PlaceSearch`）
- 支持关键词搜索
- 搜索结果点击后：
  - 地图自动移动到目标位置
  - Marker 同步更新

---

### 4. 加载状态控制（重要）

- 在 **高德地图 SDK 尚未加载完成前**：
  - 地图区域不可点击
  - 显示 Loading / Skeleton
- 防止因异步加载导致的空指针或报错

---

### 5. 性能要求

- 地图实例只初始化一次
- Modal 关闭时：
  - 不销毁地图实例
  - 仅隐藏弹窗
- Marker 复用，避免重复创建
- 事件监听只绑定一次
- 使用 `useRef` 管理地图、Marker、插件实例

---

### 6. 交互体验优化

- Hover 输入框或 icon 时显示「选择坐标」提示
- Marker 支持拖拽
- 拖拽结束后更新经纬度
- 支持初始值回显：
  - 传入已有经纬度时
  - 自动定位并渲染 Marker

---

## 组件设计建议

### 组件名

`GeoPointPicker`

### Props 设计

```ts
interface GeoPoint {
  lng: number;
  lat: number;
}

interface GeoPointPickerProps {
  value?: GeoPoint;
  onChange?: (value: GeoPoint) => void;
  placeholder?: string;
  disabled?: boolean;
}
```
