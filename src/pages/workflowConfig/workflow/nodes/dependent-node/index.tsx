import React, { memo } from 'react';
import { Space, Tag, Tooltip, Typography } from '@arco-design/web-react';
import { NodeProps } from '@/pages/workflowConfig/workflow/types';
import { DependentNodeConfig } from '@/pages/workflowConfig/workflow/nodes/dependent-node/types';

export default memo(function DependentNode(
  props: NodeProps<DependentNodeConfig>
) {
  const { depend_item_list } = props.data;

  const renderTaskTag = () => {
    return (
      <div className={'flex gap-1 overflow-hidden'}>
        {depend_item_list.flatMap((task, index) => {
          if (index > 1) return [];
          return (
            <div
              key={task.definitionCode}
              className={
                'flex-1 flex-shrink-0 overflow-hidden text-ellipsis whitespace-nowrap rounded-[4px] bg-[#E7ECF0] p-1 text-[#0F172A]'
              }
            >
              <Tooltip content={task.title}>{task.title}</Tooltip>
            </div>
          );
        })}
        {depend_item_list.length > 2 && (
          <div
            className={
              'w-max flex-shrink-0 overflow-hidden text-ellipsis whitespace-nowrap rounded-[4px] bg-[#E7ECF0] p-1 text-[#0F172A]'
            }
          >
            <Tooltip
              content={depend_item_list
                .slice(2)
                .map(({ title }) => title)
                .join('、')}
            >
              +{depend_item_list.length - 2}
            </Tooltip>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={'p-3 pt-0'}>
      <div className={'rounded-[4px] bg-[#F5F9FF] p-2'}>
        <div>
          <Typography.Text bold>前置任务</Typography.Text>
        </div>
        {!!depend_item_list.length ? renderTaskTag() : '未配置'}
      </div>
    </div>
  );
});
