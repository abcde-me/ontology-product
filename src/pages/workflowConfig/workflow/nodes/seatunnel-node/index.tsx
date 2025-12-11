import React, { memo } from 'react';
import { Typography } from '@arco-design/web-react';
import { NodeProps } from '@/pages/workflowConfig/workflow/types';
import { SeatunnelConfig } from '@/pages/workflowConfig/workflow/nodes/seatunnel-node/types';

export default memo(function SeatunnelNode(props: NodeProps<SeatunnelConfig>) {
  const { source_table_name, target_table_name } = props.data;
  return (
    <div className={'p-3 pt-0'}>
      <div className={'mb-2 rounded-[4px] bg-[#F5F9FF] p-2'}>
        <div>
          <Typography.Text bold>来源表</Typography.Text>
        </div>
        {source_table_name || '未配置'}
      </div>
      <div className={'rounded-[4px] bg-[#F5F9FF] p-2'}>
        <div>
          <Typography.Text bold>目标表</Typography.Text>
        </div>
        {target_table_name || '未配置'}
      </div>
    </div>
  );
});
