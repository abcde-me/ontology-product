import React, { useState } from 'react';
import { Button } from '@arco-design/web-react';
import { CollapsibleSection } from '../index';

/**
 * 受控模式示例
 *
 * 外部控制展开/收起状态，适合需要同步多个组件状态的场景
 */
export default function ControlledDemo() {
  const [expanded1, setExpanded1] = useState(false);
  const [expanded2, setExpanded2] = useState(false);
  const [allExpanded, setAllExpanded] = useState(false);

  // 展开/收起所有
  const toggleAll = () => {
    const newState = !allExpanded;
    setAllExpanded(newState);
    setExpanded1(newState);
    setExpanded2(newState);
  };

  return (
    <div className="p-4">
      <h2 className="mb-4 text-lg font-bold">受控模式</h2>

      {/* 控制按钮 */}
      <div className="mb-4 flex gap-2">
        <Button onClick={toggleAll}>
          {allExpanded ? '全部收起' : '全部展开'}
        </Button>
        <Button onClick={() => setExpanded1(!expanded1)}>切换区域1</Button>
        <Button onClick={() => setExpanded2(!expanded2)}>切换区域2</Button>
      </div>

      {/* 受控的折叠区域 */}
      <CollapsibleSection
        title="受控区域 1"
        expanded={expanded1}
        onExpandedChange={setExpanded1}
      >
        <div className="rounded bg-green-50 p-4">
          <p>这是受控的内容区域 1</p>
          <p>当前状态：{expanded1 ? '展开' : '收起'}</p>
        </div>
      </CollapsibleSection>

      <div className="my-4" />

      <CollapsibleSection
        title="受控区域 2"
        expanded={expanded2}
        onExpandedChange={setExpanded2}
      >
        <div className="rounded bg-purple-50 p-4">
          <p>这是受控的内容区域 2</p>
          <p>当前状态：{expanded2 ? '展开' : '收起'}</p>
        </div>
      </CollapsibleSection>

      {/* 状态显示 */}
      <div className="mt-4 rounded bg-gray-100 p-4">
        <h3 className="mb-2 font-semibold">当前状态：</h3>
        <ul className="space-y-1">
          <li>区域1：{expanded1 ? '✅ 展开' : '❌ 收起'}</li>
          <li>区域2：{expanded2 ? '✅ 展开' : '❌ 收起'}</li>
        </ul>
      </div>
    </div>
  );
}
