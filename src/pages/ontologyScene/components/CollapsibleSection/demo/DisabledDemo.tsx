import React, { useState } from 'react';
import { Button, Switch } from '@arco-design/web-react';
import { CollapsibleSection } from '../index';

/**
 * 禁用状态示例
 *
 * 禁用展开/收起功能
 */
export default function DisabledDemo() {
  const [disabled, setDisabled] = useState(true);

  return (
    <div className="p-4">
      <h2 className="mb-4 text-lg font-bold">禁用状态</h2>

      {/* 控制开关 */}
      <div className="mb-4 flex items-center gap-2">
        <span>禁用状态：</span>
        <Switch checked={disabled} onChange={setDisabled} />
        <span className="text-gray-500">{disabled ? '已禁用' : '已启用'}</span>
      </div>

      {/* 禁用的折叠区域 - 收起状态 */}
      <CollapsibleSection
        title="禁用的区域（收起状态）"
        disabled={disabled}
        defaultExpanded={false}
      >
        <div className="rounded bg-gray-50 p-4">
          <p>这是禁用状态下的内容</p>
          <p>无法展开/收起</p>
        </div>
      </CollapsibleSection>

      <div className="my-4" />

      {/* 禁用的折叠区域 - 展开状态 */}
      <CollapsibleSection
        title="禁用的区域（展开状态）"
        disabled={disabled}
        defaultExpanded={true}
      >
        <div className="rounded bg-blue-50 p-4">
          <p>这个区域默认是展开的</p>
          <p>禁用后无法收起</p>
        </div>
      </CollapsibleSection>

      <div className="my-4" />

      {/* 始终禁用 */}
      <CollapsibleSection
        title="始终禁用的区域"
        disabled={true}
        defaultExpanded={true}
      >
        <div className="rounded bg-red-50 p-4">
          <p>⚠️ 这个区域始终禁用</p>
          <p>设置 disabled={true} 即可</p>
          <p>注意：禁用状态下，标题会显示为半透明且鼠标指针变为禁止样式</p>
        </div>
      </CollapsibleSection>

      {/* 使用场景说明 */}
      <div className="mt-4 rounded bg-yellow-50 p-4">
        <h3 className="mb-2 font-semibold">💡 使用场景：</h3>
        <ul className="list-inside list-disc space-y-1">
          <li>权限不足时禁用某些区域</li>
          <li>数据加载中临时禁用</li>
          <li>表单验证失败时禁用</li>
          <li>只读模式下禁用交互</li>
        </ul>
      </div>

      {/* 无障碍说明 */}
      <div className="mt-4 rounded bg-green-50 p-4">
        <h3 className="mb-2 font-semibold">♿ 无障碍支持：</h3>
        <ul className="list-inside list-disc space-y-1">
          <li>禁用状态会设置 aria-disabled 属性</li>
          <li>禁用时 tabIndex 设为 -1，无法通过键盘聚焦</li>
          <li>视觉上显示为半透明，鼠标指针变为禁止样式</li>
        </ul>
      </div>
    </div>
  );
}
