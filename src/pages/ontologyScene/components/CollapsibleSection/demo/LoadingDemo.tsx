import React, { useState, useEffect } from 'react';
import { Button } from '@arco-design/web-react';
import { CollapsibleSection } from '../index';

/**
 * 加载状态示例
 *
 * 展开时显示加载动画，适合异步加载数据的场景
 */
export default function LoadingDemo() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);

  // 模拟异步加载数据
  useEffect(() => {
    if (expanded && data.length === 0) {
      setLoading(true);
      // 模拟 API 请求
      setTimeout(() => {
        setData(['数据项 1', '数据项 2', '数据项 3', '数据项 4', '数据项 5']);
        setLoading(false);
      }, 2000);
    }
  }, [expanded, data.length]);

  const handleReset = () => {
    setData([]);
    setExpanded(false);
  };

  return (
    <div className="p-4">
      <h2 className="mb-4 text-lg font-bold">加载状态</h2>

      <div className="mb-4">
        <Button onClick={handleReset}>重置数据</Button>
      </div>

      {/* 带加载状态的折叠区域 */}
      <CollapsibleSection
        title="异步加载的数据"
        expanded={expanded}
        onExpandedChange={setExpanded}
        loading={loading}
      >
        {data.length > 0 ? (
          <div className="space-y-2">
            {data.map((item, index) => (
              <div
                key={index}
                className="rounded border border-gray-200 bg-white p-3"
              >
                {item}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400">暂无数据</div>
        )}
      </CollapsibleSection>

      <div className="my-4" />

      {/* 始终显示加载状态 */}
      <CollapsibleSection
        title="持续加载中..."
        defaultExpanded={true}
        loading={true}
      >
        <div className="rounded bg-gray-50 p-4">
          <p>这个区域始终显示加载状态</p>
          <p>设置 loading={true} 即可</p>
        </div>
      </CollapsibleSection>

      {/* 说明 */}
      <div className="mt-4 rounded bg-blue-50 p-4">
        <h3 className="mb-2 font-semibold">💡 使用场景：</h3>
        <ul className="list-inside list-disc space-y-1">
          <li>展开时异步加载数据</li>
          <li>数据加载中显示加载动画</li>
          <li>提升用户体验</li>
        </ul>
      </div>
    </div>
  );
}
