import { IconMenuFold } from '@arco-design/web-react/icon';
import { useDemoStore } from '../common/store';
import React from 'react';

function EdgePanel() {
  const setShowCustomEdgePanel = useDemoStore((s) => s.setShowCustomEdgePanel);
  const showCustomEdgePanel = useDemoStore((s) => s.showCustomEdgePanel);
  const sourceNode = useDemoStore((s) => s.sourceNode);
  const targetNode = useDemoStore((s) => s.targetNode);

  return (
    <div
      className="workflow-preview-ab flex w-[400px] flex-col overflow-auto rounded-[12px] bg-white"
      style={{ height: '100%' }}
    >
      <div className="flex items-center justify-between border-b border-gray-300 px-[16px] py-[20px] text-[16px]/[24px] font-semibold text-[#1E293B]">
        基本配置
        <div
          className="cursor-pointer p-1"
          onClick={() => setShowCustomEdgePanel(!showCustomEdgePanel)}
        >
          <IconMenuFold className="h-4 w-4 text-gray-500" />
        </div>
      </div>
      <div>
        <h3>Source Node:</h3>
        {sourceNode && JSON.stringify(sourceNode)}
      </div>
      <div className="mt-2">
        <h3>Target Node:</h3>
        {sourceNode && JSON.stringify(targetNode)}
      </div>
    </div>
  );
}

export default EdgePanel;
