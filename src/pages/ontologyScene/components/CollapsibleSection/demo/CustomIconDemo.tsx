import React from 'react';
import {
  IconDown,
  IconRight,
  IconPlus,
  IconMinus
} from '@arco-design/web-react/icon';
import { CollapsibleSection } from '../index';

/**
 * 自定义图标示例
 *
 * 使用自定义图标替换默认的展开/收起图标
 */
export default function CustomIconDemo() {
  return (
    <div className="p-4">
      <h2 className="mb-4 text-lg font-bold">自定义图标</h2>

      {/* 使用 Arco 图标 - 箭头 */}
      <CollapsibleSection
        title="使用箭头图标"
        expandIcon={<IconDown />}
        collapseIcon={<IconRight />}
      >
        <div className="rounded bg-gray-50 p-4">
          <p>使用 IconDown 和 IconRight</p>
        </div>
      </CollapsibleSection>

      <div className="my-4" />

      {/* 使用 Arco 图标 - 加减号 */}
      <CollapsibleSection
        title="使用加减号图标"
        expandIcon={
          <IconMinus className="text-blue-500" style={{ fontSize: 16 }} />
        }
        collapseIcon={
          <IconPlus className="text-blue-500" style={{ fontSize: 16 }} />
        }
      >
        <div className="rounded bg-blue-50 p-4">
          <p>使用 IconMinus 和 IconPlus</p>
          <p>还可以自定义图标颜色和大小</p>
        </div>
      </CollapsibleSection>

      <div className="my-4" />

      {/* 使用文本作为图标 */}
      <CollapsibleSection
        title="使用文本作为图标"
        expandIcon={<span className="text-lg">▼</span>}
        collapseIcon={<span className="text-lg">▶</span>}
      >
        <div className="rounded bg-green-50 p-4">
          <p>可以使用任何 ReactNode 作为图标</p>
          <p>包括文本、Emoji、自定义组件等</p>
        </div>
      </CollapsibleSection>

      <div className="my-4" />

      {/* 使用 Emoji */}
      <CollapsibleSection
        title="使用 Emoji 图标"
        expandIcon={<span className="text-xl">👇</span>}
        collapseIcon={<span className="text-xl">👉</span>}
      >
        <div className="rounded bg-yellow-50 p-4">
          <p>使用 Emoji 让界面更有趣</p>
          <p>👇 展开 / 👉 收起</p>
        </div>
      </CollapsibleSection>

      <div className="my-4" />

      {/* 自定义 SVG 图标 */}
      <CollapsibleSection
        title="使用自定义 SVG"
        expandIcon={
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="text-purple-500"
          >
            <path d="M8 11L3 6h10l-5 5z" />
          </svg>
        }
        collapseIcon={
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="text-purple-500"
          >
            <path d="M11 8L6 3v10l5-5z" />
          </svg>
        }
      >
        <div className="rounded bg-purple-50 p-4">
          <p>使用自定义 SVG 图标</p>
          <p>完全自定义图标样式</p>
        </div>
      </CollapsibleSection>

      {/* 说明 */}
      <div className="mt-4 rounded bg-blue-50 p-4">
        <h3 className="mb-2 font-semibold">💡 提示：</h3>
        <ul className="list-inside list-disc space-y-1">
          <li>expandIcon: 展开状态显示的图标</li>
          <li>collapseIcon: 收起状态显示的图标</li>
          <li>可以使用任何 ReactNode（文本、图标、组件等）</li>
        </ul>
      </div>
    </div>
  );
}
