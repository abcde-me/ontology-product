import {
  Button,
  Form,
  Input,
  Radio,
  Select,
  Typography,
  Grid,
  Cascader,
  Empty,
  Popover,
  InputNumber
} from '@arco-design/web-react';
import React, { useEffect, useState } from 'react';
import {
  NodePanelProps,
  NodeProps
} from '@/pages/workflowConfig/workflow/types';
import {
  SQLNodeConfig,
  SQLVersion
} from '@/pages/workflowConfig/workflow/nodes/sql-node/types';
import { IconDelete, IconPlus } from '@arco-design/web-react/icon';
import styled from '@emotion/styled';
import { PRIORITY_OPTIONS } from '@/pages/workflowList/types';
import { SqlEditor } from '@/pages/workflowConfig/workflow/nodes/sql-node/components';
import { useRequest } from 'ahooks';
import { getSQLListInSQLNode, getSQLVersionInSQLNode } from '@/api/workflowV2';
import BlockIcon from '@/pages/workflowConfig/workflow/block-icon';
import useConfig from '@/pages/workflowConfig/workflow/nodes/sql-node/use-config';
import { useNodesInteractions } from '@/pages/workflowConfig/workflow/hooks';
import {
  NodeRunSetting,
  PrevNodes
} from '@/pages/workflowConfig/workflow/nodes/components';
import node from '@/pages/workflowConfig/workflow/nodes/end/node';

const { Item: FormItem, useForm, useWatch, List: FormList } = Form;
const { Row, Col } = Grid;

const loadMore = (pathValue: string[], level: number) => {
  return getSQLVersionInSQLNode(pathValue[0]);
};

export default React.memo(function SQLPanel(
  props: NodePanelProps<SQLNodeConfig>
) {
  const { readOnly, onValuesChange, inputs } = useConfig(props.id, props.data);
  const { data: allSQL, loading } = useRequest(
    async () => {
      try {
        const sqlList = await getSQLListInSQLNode();
        const sql_id = inputs.sql_id?.split('_') || [];
        if (sql_id.length > 1) {
          const sqlId = sql_id[0].toString();
          const sqlVersions = await getSQLVersionInSQLNode(+sqlId);
          sqlList.forEach((sql) => {
            if (sql.value.toString() === sqlId) {
              sql.children = sqlVersions;
            }
          });
        }
        return sqlList;
      } catch (e) {
        console.error(e);
        return [];
      }
    },
    {
      refreshDeps: [inputs.sql_id]
    }
  );
  const [form] = useForm();
  return (
    <PanelContainer className="panel-container wk-node-panel-content code-panel-content date-cleaning-panel mt-4">
      <Form
        form={form}
        autoComplete="off"
        labelCol={{ span: 0 }}
        wrapperCol={{ span: 24 }}
        disabled={readOnly}
        initialValues={{ ...inputs, sql_id: inputs.sql_id?.split('_') }}
        layout="vertical"
        onValuesChange={(_, v: any) => {
          const { local_params, sql_id, ...otherValue } = v;
          onValuesChange({
            ...inputs,
            ...otherValue,
            sql_id: sql_id?.join('_'),
            local_params: local_params.map(({ prop, value }) => ({
              prop,
              value,
              direct: 'IN',
              type: 'VARCHAR'
            }))
          });
        }}
      >
        <NodeRunSetting />
      </Form>
      <PrevNodes node={props.id} />
    </PanelContainer>
  );
});
const PanelContainer = styled.div`
  .label-hidden {
    visibility: hidden;
  }

  .arco-cascader {
    width: 100% !important;
    margin-bottom: 0 !important;
  }

  .dependent-item {
    border: 1px solid #cbd5e1;

    &:hover {
      border: 1px solid #007dfa;
    }
  }
`;
