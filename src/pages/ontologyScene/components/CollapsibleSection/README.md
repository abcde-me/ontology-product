# CollapsibleSection 组件

可折叠展开的内容区域组件，支持受控和非受控两种模式。

## 特性

- ✅ 支持受控和非受控两种模式
- ✅ 完整的 TypeScript 类型定义
- ✅ 支持自定义图标和样式
- ✅ 内置加载状态支持
- ✅ 完整的无障碍支持（键盘导航、屏幕阅读器）
- ✅ 支持禁用状态
- ✅ 性能优化（useCallback）

## 安装

```bash
# 依赖 @arco-design/web-react
npm install @arco-design/web-react
```

## 基础用法

查看 [demo/BasicDemo.tsx](./demo/BasicDemo.tsx)

```tsx
import { CollapsibleSection } from './CollapsibleSection';

function App() {
  return (
    <CollapsibleSection title="基本信息" defaultExpanded={true}>
      <div>这是内容区域</div>
    </CollapsibleSection>
  );
}
```

## API

### Props

| 属性               | 类型                          | 默认值  | 说明                       |
| ------------------ | ----------------------------- | ------- | -------------------------- |
| `title`            | `string`                      | -       | 标题文本（必填）           |
| `defaultExpanded`  | `boolean`                     | `false` | 是否默认展开（非受控模式） |
| `expanded`         | `boolean`                     | -       | 是否展开（受控模式）       |
| `onExpandedChange` | `(expanded: boolean) => void` | -       | 展开状态变化回调           |
| `children`         | `ReactNode`                   | -       | 内容区域（必填）           |
| `loading`          | `boolean`                     | `false` | 是否显示加载状态           |
| `expandIcon`       | `ReactNode`                   | -       | 自定义展开图标             |
| `collapseIcon`     | `ReactNode`                   | -       | 自定义收起图标             |
| `titleClassName`   | `string`                      | -       | 自定义标题样式类名         |
| `className`        | `string`                      | -       | 自定义容器样式类名         |
| `contentClassName` | `string`                      | -       | 自定义内容区域样式类名     |
| `disabled`         | `boolean`                     | `false` | 是否禁用展开/收起功能      |

## 示例

### 1. 基础用法

查看 [demo/BasicDemo.tsx](./demo/BasicDemo.tsx)

非受控模式，组件内部管理展开/收起状态。

### 2. 受控模式

查看 [demo/ControlledDemo.tsx](./demo/ControlledDemo.tsx)

外部控制展开/收起状态，适合需要同步多个组件状态的场景。

### 3. 加载状态

查看 [demo/LoadingDemo.tsx](./demo/LoadingDemo.tsx)

展开时显示加载动画，适合异步加载数据的场景。

### 4. 自定义图标

查看 [demo/CustomIconDemo.tsx](./demo/CustomIconDemo.tsx)

使用自定义图标替换默认的展开/收起图标。

### 5. 自定义样式

查看 [demo/CustomStyleDemo.tsx](./demo/CustomStyleDemo.tsx)

自定义标题、容器和内容区域的样式。

### 6. 禁用状态

查看 [demo/DisabledDemo.tsx](./demo/DisabledDemo.tsx)

禁用展开/收起功能。

## 无障碍支持

- 支持键盘导航（Tab 键聚焦，Enter/Space 键切换）
- 支持屏幕阅读器（aria-expanded、aria-disabled）
- 语义化标记（role="button"）

## 注意事项

1. **受控模式**：当同时提供 `expanded` 和 `onExpandedChange` 时，组件进入受控模式，`defaultExpanded` 将被忽略
2. **图标依赖**：默认图标依赖项目中的 SVG 文件，可通过 `expandIcon` 和 `collapseIcon` 自定义
3. **样式定制**：组件使用 Tailwind CSS 类名，确保项目已配置 Tailwind

## License

MIT
