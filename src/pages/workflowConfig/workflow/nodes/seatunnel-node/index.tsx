import React, { memo } from 'react';
import { Typography } from '@arco-design/web-react';
import { NodeProps } from '@/pages/workflowConfig/workflow/types';
import {
  ConnectionItem,
  DatabaseConfig,
  SeatunnelConfig
} from '@/pages/workflowConfig/workflow/nodes/seatunnel-node/types';
import { useRequest } from 'ahooks';
import { getdetailList } from '@/api/connectionApi';
import { isEmpty, isNil } from 'lodash-es';

export default memo(function SeatunnelNode(props: NodeProps<SeatunnelConfig>) {
  const {
    source_table_name,
    source_database,
    target_table_name,
    target_datasource_id
  } = props.data;

  const { data: target_database_name } = useRequest(
    async () => {
      if (isNil(target_datasource_id)) return;
      const res = await getdetailList({ id: target_datasource_id });
      const { config = {}, name = '' } = (res.data as ConnectionItem) || {};
      if (isEmpty(config) || !name) return;
      return `${name}->${(config as DatabaseConfig).database}`;
    },
    {
      refreshDeps: [target_datasource_id]
    }
  );

  return (
    <div className={'p-3 pt-0'}>
      <div className={'mb-2 rounded-[4px] bg-[#F5F9FF] p-2'}>
        <div>
          <Typography.Text bold>来源表</Typography.Text>
        </div>
        {!source_table_name || !source_database
          ? '未配置'
          : `${source_database}->${source_table_name}`}
      </div>
      <div className={'break-all rounded-[4px] bg-[#F5F9FF] p-2'}>
        <div>
          <Typography.Text bold>目标表</Typography.Text>
        </div>
        {!target_database_name || !target_table_name
          ? '未配置'
          : `${target_database_name}->${target_table_name}`}
      </div>
    </div>
  );
});
