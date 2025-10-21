import type { FC, ReactElement } from 'react';
import React, { cloneElement, memo, useEffect, useRef } from 'react';
import {
  RiAlertFill,
  RiCheckboxCircleFill,
  RiErrorWarningFill,
  RiLoader2Line
} from '@remixicon/react';
import type { NodeProps } from '../../types';
import { BlockEnum, NodeRunningStatus } from '../../types';
import { useNodesReadOnly } from '../../hooks';
import { useNodeIterationInteractions } from '../iteration/use-interactions';
import { useNodeLoopInteractions } from '../loop/use-interactions';
import { NodeSourceHandle, NodeTargetHandle } from './components/node-handle';
import NodeControl from './components/node-control';
import cn from '@/pages/workflowConfig/utils/classnames';
import BlockIcon from '@/pages/workflowConfig/workflow/block-icon';
import EllipsisPopover from '@/components/ellipsis-popover-com';

type BaseNodeProps = {
  children: ReactElement;
} & NodeProps;

const BaseNode: FC<BaseNodeProps> = ({ id, data, children }) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const { nodesReadOnly } = useNodesReadOnly();
  const { handleNodeIterationChildSizeChange } = useNodeIterationInteractions();
  const { handleNodeLoopChildSizeChange } = useNodeLoopInteractions();

  useEffect(() => {
    if (nodeRef.current && data.selected && data.isInIteration) {
      const resizeObserver = new ResizeObserver(() => {
        handleNodeIterationChildSizeChange(id);
      });

      resizeObserver.observe(nodeRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [
    data.isInIteration,
    data.selected,
    id,
    handleNodeIterationChildSizeChange
  ]);

  useEffect(() => {
    if (nodeRef.current && data.selected && data.isInLoop) {
      const resizeObserver = new ResizeObserver(() => {
        handleNodeLoopChildSizeChange(id);
      });

      resizeObserver.observe(nodeRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [data.isInLoop, data.selected, id, handleNodeLoopChildSizeChange]);

  const showSelectedBorder =
    data.selected || data._isBundled || data._isEntering;

  return (
    <div
      className={cn(
        'wk-node-wrapper flex',
        showSelectedBorder && 'show-selected-border',
        // showSelectedBorder ? 'border-components-option-card-option-selected-border' : 'border-transparent',
        // !showSelectedBorder && data._inParallelHovering && 'border-workflow-block-border-highlight',
        data._waitingRun && 'opacity-70',
        data.type,
        `status-${data._runningStatus}`
      )}
      ref={nodeRef}
      style={{
        width: 'auto',
        height: 'auto'
      }}
    >
      <div
        className={cn(
          'wk-node group relative shadow-xs',
          'rounded-[12px] border border-transparent',
          'w-[240px] bg-workflow-block-bg',
          'flex h-full w-full flex-col border-workflow-block-border bg-workflow-block-bg-transparent',
          !data._runningStatus && 'show-hover-shadow hover:shadow-lg',
          // showRunningBorder && '!border-state-accent-solid',
          // showSuccessBorder && '!border-state-success-solid',
          // showFailedBorder && '!border-state-destructive-solid',
          // showExceptionBorder && '!border-state-warning-solid',
          data._isBundled && '!shadow-lg',
          data._runningStatus,
          data.type
        )}
      >
        {/* {
          data._inParallelHovering && (
            <div className='absolute left-2 -top-3.5 top system-2xs-medium-uppercase text-text-tertiary z-10'>
              {t('workflow.common.parallelRun')}
            </div>
          )
        } */}
        {/* {data._showAddVariablePopup && (
          <AddVariablePopupWithPosition nodeId={id} nodeData={data} />
        )} */}
        {!data._isCandidate && (
          <NodeTargetHandle
            id={id}
            data={data}
            handleClassName="!top-4 !-left-[9px] !translate-y-0"
            handleId="target"
          />
        )}
        {!data._isCandidate && (
          <NodeSourceHandle
            id={id}
            data={data}
            handleClassName="!top-4 !-right-[9px] !translate-y-0"
            handleId="source"
          />
        )}
        {!data._runningStatus &&
          !nodesReadOnly &&
          !data._isCandidate &&
          data.type !== BlockEnum.Start && <NodeControl id={id} data={data} />}
        <div
          className={cn(
            'wk-node-header flex items-center rounded-t-2xl px-3 pb-[12px] pt-3'
          )}
        >
          <BlockIcon
            className="mr-2 shrink-0"
            type={data.type}
            size="md"
          />
          <div className="system-sm-semibold-uppercase mr-1 flex grow items-center truncate text-text-primary">
            <EllipsisPopover
              value={data.title}
              isEdit={false}
              preferTypography
              wrapperClassName="w-full"
              className="text-[14px]/[22px] font-semibold text-[#0F172A]"
            />
            {/* <div className="text-[12px]/[18px] font-bold text-[#1E293B]">
              {data.title}
            </div> */}
          </div>
          {data._iterationLength &&
            data._iterationIndex &&
            data._runningStatus === NodeRunningStatus.Running && (
              <div className="mr-1.5 text-xs font-medium text-text-accent">
                {data._iterationIndex > data._iterationLength
                  ? data._iterationLength
                  : data._iterationIndex}
                /{data._iterationLength}
              </div>
            )}
          {data._loopLength &&
            data._loopIndex &&
            data._runningStatus === NodeRunningStatus.Running && (
              <div className="mr-1.5 text-xs font-medium text-primary-600">
                {data._loopIndex > data._loopLength
                  ? data._loopLength
                  : data._loopIndex}
                /{data._loopLength}
              </div>
            )}
          {(data._runningStatus === NodeRunningStatus.Running ||
            data._singleRunningStatus === NodeRunningStatus.Running) && (
              <RiLoader2Line className="size-[16px] animate-spin text-[#007DFA]" />
            )}
          {data._runningStatus === NodeRunningStatus.Succeeded && (
            <RiCheckboxCircleFill className="size-[16px] text-[#0AB58D]" />
          )}
          {data._runningStatus === NodeRunningStatus.Failed && (
            <RiErrorWarningFill className="size-[16px] text-[#EF4444]" />
          )}
          {data._runningStatus === NodeRunningStatus.Exception && (
            <RiAlertFill className="size-[16px] text-text-warning-secondary" />
          )}
        </div>
        {!!data.desc && (
          <div className={`wk-node-desc w-full p-[12px] pt-[0]`}>
            <EllipsisPopover
              value={data.desc}
              isEdit={false}
              preferTypography
              className="text-[#6E7B8D]"
            />
          </div>
        )}
        {cloneElement(children, { id, data })}
        {/* {
          hasRetryNode(data.type) && (
            <RetryOnNode
              id={id}
              data={data}
            />
          )
        }
        {
          hasErrorHandleNode(data.type) && (
            <ErrorHandleOnNode
              id={id}
              data={data}
            />
          )
        } */}
        {/* {
          data.desc && data.type !== BlockEnum.Iteration && data.type !== BlockEnum.Loop && (
            <div className='wk-node-desc px-3 pt-1 pb-2 system-xs-regular text-text-tertiary whitespace-pre-line break-words text-[12px]/[18px] text-[#1E293B]'>
              {data.desc}
            </div>
          )
        } */}
      </div>
    </div>
  );
};

export default memo(BaseNode);
