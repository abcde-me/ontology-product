---
name: ui-to-code-improved
description: 根据 UI 描述、设计稿或截图生成符合团队规范的 React TypeScript 组件，包含完整的类型定义、样式和可访问性支持
argument-hint: [组件名称和UI描述]
---

# UI 还原组件生成规范

当用户提供 UI 设计描述、截图或设计稿时，按以下规范生成 React 组件。

## 🎯 核心原则

1. **类型安全优先** - 所有 Props 必须有完整的 TypeScript 类型定义，使用 `interface` 定义 Props
2. **可访问性** - 必须包含适当的 ARIA 属性和语义化标签
3. **样式方案** - 优先使用 Tailwind CSS，复杂样式使用 `.less` 或 `.css` 文件
4. **性能优化** - 使用 `React.memo` 包裹组件，避免不必要的重渲染
5. **响应式设计** - 使用 Tailwind 响应式类（mobile/tablet/pc）
6. **符合项目规范** - 优先使用 Arco Design 组件库，遵循项目现有代码风格

## 📋 工作流程

### 第一步：分析 UI 结构

**布局分析：**
- 识别主容器和子元素的层次关系
- 确定布局方式：Flexbox 或 Grid
- 识别间距、对齐方式
- 分析响应式断点需求

**组件拆分：**
- 判断是否需要拆分子组件（超过 3 层嵌套建议拆分）
- 识别可复用的 UI 模式
- 确定组件的职责边界
- 优先使用 Arco Design 现有组件

### 第二步：定义 TypeScript 接口

**Props 接口规范（使用 type 或 interface）：**
```typescript
// 推荐使用 type（项目常用）
export type ComponentNameProps = {
  // 必填属性（无默认值）
  title: string;
  
  // 可选属性（有 ? 标记）
  description?: string;
  
  // 回调函数（使用 void 或具体返回类型）
  onClick?: () => void;
  onSubmit?: (data: FormData) => Promise<void>;
  
  // 子元素
  children?: React.ReactNode;
  
  // 样式相关
  className?: string;
  style?: React.CSSProperties;
};

// 或使用 interface（也可以）
interface ComponentNameProps {
  title: string;
  description?: string;
  // ...
}
```

**命名规范：**
- Props 类型：`ComponentNameProps` 或 `IComponentNameProps`
- 事件处理函数：`handleEventName`（如 `handleClick`、`handleSearch`）
- 状态变量：使用描述性名称（如 `isLoading`、`hasError`、`value`）
- 文件命名：kebab-case（如 `user-card/index.tsx`）
- 组件命名：PascalCase（如 `UserCard`）
- 样式文件：`index.less` 或 `index.css`

### 第三步：创建组件文件

**文件结构：**
```
src/components/component-name/
├── index.tsx              # 组件逻辑（必须）
├── index.less             # 样式文件（可选，复杂样式时使用）
└── index.css              # 或使用 .css（可选）
```

**组件模板（推荐写法）：**
```typescript
import React, { useState, useCallback } from 'react';
import { Button } from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import cn from 'classnames'; // 用于合并类名
import './index.less'; // 如果有复杂样式

export type ComponentNameProps = {
  // Props 定义
  title: string;
  description?: string;
  onClick?: () => void;
  className?: string;
};

const ComponentName: React.FC<ComponentNameProps> = ({
  title,
  description,
  onClick,
  className,
}) => {
  // 状态管理
  const [isActive, setIsActive] = useState(false);
  
  // 事件处理函数（使用 useCallback 优化）
  const handleClick = useCallback(() => {
    setIsActive(!isActive);
    onClick?.();
  }, [isActive, onClick]);
  
  return (
    <div className={cn('flex flex-col gap-3 p-4', className)}>
      <h3 className="text-[14px] font-[600] text-[var(--color-text-2)]">
        {title}
      </h3>
      {description && (
        <p className="text-[12px] text-[var(--color-text-4)]">
          {description}
        </p>
      )}
      <Button type="primary" icon={<IconPlus />} onClick={handleClick}>
        点击按钮
      </Button>
    </div>
  );
};

export default React.memo(ComponentName);
```

**关键点：**
- 使用 `React.FC<Props>` 类型注解
- 优先使用 Tailwind CSS 类名
- 使用 `cn()` 或 `classnames` 合并类名
- 使用 `React.memo` 包裹组件导出
- 导出 Props 类型供外部使用

### 第四步：编写样式

**样式方案选择：**

1. **优先使用 Tailwind CSS**（90% 的场景）
```tsx
// ✅ 推荐：直接使用 Tailwind 类名
<div className="flex items-center gap-3 p-4 bg-white rounded-[4px] shadow-sm">
  <h3 className="text-[14px] font-[600] text-[var(--color-text-2)]">标题</h3>
  <p className="text-[12px] text-[var(--color-text-4)]">描述</p>
</div>
```

2. **复杂样式使用 .less 或 .css**（10% 的场景）
```less
// index.less
.component-name {
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: #ffffff;
  border-radius: 4px;
  
  &:hover {
    background-color: #f0f0f0;
  }
  
  .title {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-2);
  }
}
```

**项目颜色和尺寸规范：**

**颜色变量（使用 CSS 变量）：**
```css
/* 文字颜色 */
--color-text-2: #1e293b;  /* 主要文字 */
--color-text-4: #6e7b8d;  /* 次要文字 */

/* 主色 */
--primary-1: #eef6ff;     /* 浅色背景 */
--primary-6: #007dfa;     /* 主色 */

/* 边框 */
--color-border-2: #e2e8f0;

/* 使用方式 */
color: var(--color-text-2);
background: var(--primary-1);
```

**Tailwind 颜色类：**
```tsx
// 文字颜色
text-[var(--color-text-2)]  // 主要文字
text-[var(--color-text-4)]  // 次要文字

// 背景颜色
bg-[var(--primary-1)]       // 浅色背景
bg-[var(--primary-6)]       // 主色背景

// 边框颜色
border-[var(--color-border-2)]
```

**字体大小：**
```tsx
text-[12px]  // 次要文字
text-[14px]  // 主要文字（默认）
text-[16px]  // 标题
text-[18px]  // 大标题
```

**间距规范（使用 Tailwind）：**
```tsx
gap-1    // 4px
gap-2    // 8px
gap-3    // 12px
gap-4    // 16px
gap-6    // 24px

p-2      // padding: 8px
p-4      // padding: 16px
m-2      // margin: 8px
m-4      // margin: 16px
```

**圆角：**
```tsx
rounded-[4px]   // 小圆角（常用）
rounded-[8px]   // 中圆角
rounded-[12px]  // 大圆角
```

**响应式设计：**
```tsx
// 项目自定义断点
mobile:hidden    // 100px+
tablet:flex      // 640px+
pc:grid          // 769px+

// 示例
<div className="mobile:flex-col tablet:flex-row pc:grid pc:grid-cols-3">
  {/* 内容 */}
</div>
```

### 第五步：添加可访问性

**必须包含的 ARIA 属性：**

1. **语义化标签：**
```tsx
// ✅ 使用语义化标签
<article>
<section>
<nav>
<header>
<footer>

// ✅ 按钮使用 <button>
<button onClick={handleClick}>点击</button>

// ❌ 不要用 div 作为按钮
<div onClick={handleClick}>点击</div>
```

2. **ARIA 标签：**
```tsx
// 描述性标签
<div role="article" aria-label="用户卡片">

// 按钮状态
<button aria-pressed={isActive}>

// 图片替代文本
<img src={url} alt="描述性文字" />

// 表单标签
<label htmlFor="input-id">标签</label>
<input id="input-id" aria-required="true" />

// 加载状态
<div aria-busy={isLoading} aria-live="polite">
```

3. **键盘导航：**
- 确保所有交互元素可通过 Tab 键访问
- 添加 `tabIndex` 属性（如需要）
- 处理 Enter 和 Space 键事件

### 第六步：性能优化

**优化清单：**
```typescript
// 1. 图片懒加载
<img src={url} alt={alt} loading="lazy" />

// 2. 避免不必要的重渲染
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
const memoizedCallback = useCallback(() => doSomething(a, b), [a, b]);

// 3. 条件渲染优化
{isVisible && <Component />}  // ✅ 好
{isVisible ? <Component /> : null}  // ❌ 避免

// 4. 列表渲染使用 key
{items.map(item => <Item key={item.id} {...item} />)}

// 5. 使用 React.memo（适用于纯展示组件）
export default React.memo(ComponentName);
```

### 第七步：国际化支持

**使用 i18next：**
```typescript
import { useTranslation } from 'react-i18next';

const ComponentName: React.FC<Props> = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('component.title')}</h1>
      <p>{t('component.description')}</p>
      <Button>{t('common.confirm')}</Button>
    </div>
  );
};
```

**翻译文件位置：**
- 中文：`locales/zh/plugin__console-plugin-appforge.json`
- 英文：`locales/en/plugin__console-plugin-appforge.json`

**翻译文件格式：**
```json
{
  "component": {
    "title": "标题",
    "description": "描述"
  },
  "common": {
    "confirm": "确认",
    "cancel": "取消"
  }
}
```

## 📝 导出规范

**不需要单独的 index.ts 导出文件**

项目中组件直接在 `index.tsx` 中定义和导出：

```typescript
// src/components/component-name/index.tsx
export type ComponentNameProps = {
  // ...
};

const ComponentName: React.FC<ComponentNameProps> = (props) => {
  // ...
};

export default React.memo(ComponentName);
```

**使用方式：**
```typescript
// 导入组件
import ComponentName from '@/components/component-name';
// 导入类型
import type { ComponentNameProps } from '@/components/component-name';
```

## ✅ 检查清单

生成组件后，确保：

- [ ] TypeScript 类型完整，使用 `type` 或 `interface` 定义 Props
- [ ] 优先使用 Tailwind CSS 类名，复杂样式才用 `.less` 文件
- [ ] 使用 `cn()` 或 `classnames` 合并类名
- [ ] 包含语义化 HTML 标签
- [ ] 添加必要的 ARIA 属性
- [ ] 图片有 alt 文本和 loading="lazy"
- [ ] 响应式设计（使用 mobile/tablet/pc 断点）
- [ ] 交互元素有 hover/active/disabled 状态
- [ ] 文件结构符合项目规范（index.tsx + index.less）
- [ ] 优先使用 Arco Design 组件和图标
- [ ] 支持国际化（使用 i18next）
- [ ] 使用 `React.memo` 包裹组件导出
- [ ] 代码可以直接运行，无需修改

## 🚫 禁止事项

- ❌ 不要使用 inline styles（除非动态计算）
- ❌ 不要使用 `any` 类型
- ❌ 不要使用 CSS Modules（项目不使用）
- ❌ 不要使用 SCSS Modules（项目使用 .less 或 .css）
- ❌ 不要忽略可访问性
- ❌ 不要硬编码尺寸（使用 Tailwind 或相对单位）
- ❌ 不要使用 `<div>` 作为按钮
- ❌ 不要硬编码文案（使用 i18next）
- ❌ 不要重复造轮子（优先使用 Arco Design 组件）
- ❌ 不要创建单独的 types.ts 文件（直接在 index.tsx 中定义）

## 💡 示例

**好的组件示例（符合项目规范）：**

```typescript
// src/components/user-card/index.tsx
import React, { useState, useCallback } from 'react';
import { Button, Image } from '@arco-design/web-react';
import { IconUser } from '@arco-design/web-react/icon';
import { useTranslation } from 'react-i18next';
import cn from 'classnames';
import './index.less';

export type UserCardProps = {
  name: string;
  email: string;
  avatar?: string;
  onFollow?: (userId: string) => void;
  className?: string;
};

const UserCard: React.FC<UserCardProps> = ({
  name,
  email,
  avatar,
  onFollow,
  className,
}) => {
  const { t } = useTranslation();
  const [isFollowing, setIsFollowing] = useState(false);
  
  const handleFollowClick = useCallback(() => {
    setIsFollowing(!isFollowing);
    onFollow?.(email);
  }, [email, isFollowing, onFollow]);
  
  return (
    <article 
      className={cn(
        'user-card',
        'flex flex-col items-center gap-3 p-6',
        'bg-white rounded-[4px] shadow-sm',
        'hover:shadow-md transition-shadow',
        className
      )}
      aria-label={`${name}${t('common.userCard')}`}
    >
      {avatar ? (
        <Image
          src={avatar}
          alt={`${name}${t('common.avatar')}`}
          className="w-[80px] h-[80px] rounded-[50%] object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex items-center justify-center w-[80px] h-[80px] rounded-[50%] bg-[var(--primary-1)]">
          <IconUser className="text-[32px] text-[var(--primary-6)]" />
        </div>
      )}
      
      <h3 className="text-[14px] font-[600] text-[var(--color-text-2)]">
        {name}
      </h3>
      
      <p className="text-[12px] text-[var(--color-text-4)]">
        {email}
      </p>
      
      <Button
        type={isFollowing ? 'default' : 'primary'}
        onClick={handleFollowClick}
        aria-pressed={isFollowing}
        className="w-full"
      >
        {isFollowing ? t('common.followed') : t('common.follow')}
      </Button>
    </article>
  );
};

export default React.memo(UserCard);
```

**对应的样式文件（仅用于复杂样式）：**
```less
// src/components/user-card/index.less
.user-card {
  // 只在这里写 Tailwind 无法实现的复杂样式
  // 大部分样式应该使用 Tailwind 类名
  
  &:hover {
    .user-avatar {
      transform: scale(1.05);
      transition: transform 0.3s ease;
    }
  }
}
```

**使用示例：**
```typescript
import UserCard from '@/components/user-card';
import type { UserCardProps } from '@/components/user-card';

function App() {
  return (
    <UserCard
      name="张三"
      email="zhangsan@example.com"
      avatar="/avatar.jpg"
      onFollow={(userId) => console.log('关注用户:', userId)}
    />
  );
}
```

---

**记住：生成的代码必须是生产级别的质量，符合项目现有规范，可以直接部署使用。**
