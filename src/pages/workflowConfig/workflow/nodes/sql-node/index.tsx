import React, { memo } from 'react';
import styled from '@emotion/styled';
import { Typography } from '@arco-design/web-react';
import { NodeProps } from '@/pages/workflowConfig/workflow/types';
import { SQLNodeConfig } from '@/pages/workflowConfig/workflow/nodes/sql-node/types';
import { useRequest } from 'ahooks';
import { getSQLListInSQLNode } from '@/api/workflowV2';

export default memo(function SQLNode(props: NodeProps<SQLNodeConfig>) {
  const { sql_id } = props.data;
  const { data: sqlName } = useRequest(
    async () => {
      const slq_version = sql_id?.split('_') || [];
      const [sql, version] = slq_version;
      if (sql && version) {
        const sqlList = await getSQLListInSQLNode();
        const sql_name = sqlList.find(
          ({ value }) => value.toString() === sql
        )?.label;
        if (sql_name && version) return `${sql_name}_V${version}`;
      }
      return '';
    },
    {
      refreshDeps: [sql_id]
    }
  );
  return (
    <NodeContainer className={'p-3 pt-0'}>
      <div className={'rounded-[4px] bg-[#F5F9FF] p-2'}>
        <div>
          <Typography.Text bold>SQL加工脚本</Typography.Text>
        </div>
        {sqlName || '未配置'}
      </div>
    </NodeContainer>
  );
});
const NodeContainer = styled.div``;
