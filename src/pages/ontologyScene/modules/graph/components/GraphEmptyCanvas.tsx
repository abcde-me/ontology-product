import React from 'react';
import ReactFlow, { Background, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import { useGraphCreate } from '../context/GraphCreateContext';
import GraphContextMenuHandler from './GraphContextMenuHandler';
import graphStyles from '../index.module.scss';

/**
 * 无对象类型/链接时的图谱占位：保留可交互画布（右键、缩放），避免 AIWorkflow 空数据白屏。
 */
export default function GraphEmptyCanvas() {
  const { canCreate, openCreateObjectType } = useGraphCreate();

  return (
    <div
      className={`${graphStyles['ai-workflow']} relative h-full min-h-0 w-full flex-1`}
      style={{ minHeight: 'calc(100vh - 56px)' }}
    >
      <ReactFlowProvider>
        <ReactFlow
          className={graphStyles['edge-style']}
          style={{
            width: '100%',
            height: '100%',
            minHeight: 'calc(100vh - 56px)'
          }}
          nodes={[]}
          edges={[]}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag
          zoomOnScroll
          zoomOnPinch
          minZoom={0.2}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#A7BEE54D" gap={14} size={2} />
        </ReactFlow>
        <GraphContextMenuHandler />
      </ReactFlowProvider>

      <div className="pointer-events-none absolute inset-0 z-[2] flex flex-col items-center justify-center gap-[12px] px-[24px]">
        <div className="max-w-[420px] text-center text-[14px] leading-[22px] text-[#64748B]">
          暂无对象类型与链接
        </div>
        {canCreate ? (
          <Button
            type="primary"
            icon={<IconPlus />}
            className="pointer-events-auto"
            onClick={openCreateObjectType}
          >
            新建对象类型
          </Button>
        ) : null}
        <div className="text-center text-[12px] leading-[20px] text-[#94A3B8]">
          或在画布空白处右键选择「新建对象类型」
        </div>
      </div>
    </div>
  );
}
