import { Button } from '@arco-design/web-react';
import type { FC } from 'react';
import React, { useEffect } from 'react';
import { NodeTargetHandle } from '@ceai-front/workflow';
import { useStoreApi, useEdges } from 'reactflow';

const Node = ({ id, data }) => {
  const HandleTooltip = ({ handleId }: { handleId: string }) => {
    const store = useStoreApi();
    const { getNodes } = store.getState();
    const edges = useEdges();
    const sourceId = edges.find(
      (e) => e.target === id && e.targetHandle === handleId
    )?.source;
    const data = getNodes().find((n) => n.id === sourceId)?.data;

    return sourceId ? (
      <div className="absolute -top-1 left-1/2 hidden -translate-x-1/2 -translate-y-full rounded-[4px] border-[0.5px] border-components-panel-border bg-components-tooltip-bg p-1.5 shadow-lg group-hover/handle:block">
        <div className="system-xs-regular text-text-tertiary">
          <div className=" whitespace-nowrap">{data?.title}</div>
        </div>
      </div>
    ) : null;
  };

  return (
    <div className="wk-node-content mb-1 px-3 py-1">
      <div className="space-y-[6px]">
        My Node
        <Button type="primary">Click me</Button>
        <div className="relative mb-2 h-[24px] bg-gray-100">
          <NodeTargetHandle
            id={id}
            data={data}
            handleId="input1"
            showDefault
            handleClassName={(connected) =>
              'ml-[-1.0rem] hover:top-1 ' +
              (!connected ? 'before:left-[0.125rem]' : '')
            }
            tooltip={<HandleTooltip handleId="input1" />}
          />
        </div>
        <div className="relative mb-2 h-[24px] bg-gray-100">
          <NodeTargetHandle
            id={id}
            data={data}
            handleId="input2"
            showDefault
            handleClassName={(connected) =>
              'ml-[-1.0rem] hover:top-1 ' +
              (!connected ? 'before:left-[0.125rem]' : '')
            }
            tooltip={<HandleTooltip handleId="input2" />}
          />
        </div>
        <div className="relative mb-2 h-[24px] bg-gray-100">
          <NodeTargetHandle
            id={id}
            data={data}
            handleId="input3"
            handleClassName="ml-[-1.0rem] hover:top-1"
            tooltip={<HandleTooltip handleId="input3" />}
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(Node);
