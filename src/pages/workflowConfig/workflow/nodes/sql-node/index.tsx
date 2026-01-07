import React, { memo } from 'react';
import { Typography } from '@arco-design/web-react';
import { NodeProps } from '@/pages/workflowConfig/workflow/types';
import { SQLNodeConfig } from '@/pages/workflowConfig/workflow/nodes/sql-node/types';
import { useRequest } from 'ahooks';
import { getSQLListInSQLNode } from '@/api/workflowV2';
import { isNil } from 'lodash-es';

export default memo(function SQLNode(props: NodeProps<SQLNodeConfig>) {
  const { sql_id, raw_script } = props.data;
  const { data: sqlName = '未配置' } = useRequest(
    async () => {
      if (isNil(sql_id)) {
        if (raw_script) return '手动编写语句（非脚本引用）';
        return;
      }
      const slq_version = sql_id.split('_') || [];
      const [sql, version] = slq_version;
      if (sql && version) {
        const sqlList = await getSQLListInSQLNode();
        const sql_name = sqlList.find(
          ({ value }) => value.toString() === sql
        )?.label;
        if (sql_name && version) return `${sql_name}_V${version}`;
      }
      return;
    },
    {
      refreshDeps: [sql_id, raw_script]
    }
  );
  return (
    <div className={'p-3 pt-0'}>
      <div className={'break-all rounded-[4px] bg-[#F5F9FF] p-2'}>
        <div>
          <Typography.Text bold>SQL加工脚本</Typography.Text>
        </div>
        {sqlName}
      </div>
    </div>
  );
});
