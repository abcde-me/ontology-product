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
  Popover
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

const { Item: FormItem, useForm, useWatch, List: FormList } = Form;
const { Row, Col } = Grid;

const loadMore = (pathValue: string[], level: number) => {
  return getSQLVersionInSQLNode(pathValue[0]);
};

export default React.memo(function SeatunnelPanel(
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
  const { handleNodeSelect } = useNodesInteractions();
  return (
    <PanelContainer className="panel-container wk-node-panel-content code-panel-content date-cleaning-panel mt-4">
      <Typography.Text bold className={'mb-2'}>
        来源数据
      </Typography.Text>
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
        <FormItem
          label={'来源表'}
          field={'sql_id'}
          rules={[{ message: '请选择来源表', required: true }]}
        >
          <Cascader
            className={'w-full'}
            disabled={readOnly || loading}
            placeholder="请选择来源表"
            style={{ width: 300, marginBottom: 20 }}
            options={allSQL}
            onChange={(_, selectedOptions) => {
              const versionData: SQLVersion = selectedOptions?.pop() || {};
              const { script_context = '', script_params = [] } = versionData;
              form.setFieldsValue({
                raw_script: script_context || '',
                local_params: script_params.map(
                  ({ config_key, config_value }) => ({
                    prop: config_key,
                    value: config_value
                  })
                )
              });
            }}
            loadMore={loadMore}
            showSearch
            allowClear
          />
        </FormItem>
        {!loading && (
          <FormItem
            field={'raw_script'}
            dependencies={['sql_id']}
            label={'来源数据过滤'}
          >
            <SqlEditor
              placeholder={
                "只填写WHERE 后面的过滤条件(含 WHERE关键字)，如： WHERE  year = '2025'"
              }
            />
          </FormItem>
        )}
        <FormList field={'local_params'}>
          {(fields, { add, remove }) => {
            return (
              <>
                <div className={'flex w-full items-center justify-between'}>
                  自定义参数
                  <Button
                    type={'default'}
                    size={'mini'}
                    icon={<IconPlus />}
                    onClick={(e) => {
                      e.stopPropagation();
                      add();
                    }}
                  />
                </div>
                <Form.Item className={'add-field-action'}>
                  {!!fields.length &&
                    fields.map((field, index) => (
                      <div key={field.key} className={'flex flex-1'}>
                        <div className={'fields-item flex flex-1 gap-3'}>
                          <FormItem
                            field={`${field.field}.prop`}
                            label={
                              index === 0 ? (
                                <Form.Item noStyle>
                                  <Typography.Text bold>参数名</Typography.Text>
                                </Form.Item>
                              ) : undefined
                            }
                            rules={[
                              {
                                validator(v, onInValid) {
                                  const sameKey = form
                                    .getFieldValue('params')
                                    .filter(({ key }) => key === v);
                                  if (sameKey.length > 1) {
                                    onInValid('参数名重复');
                                    return;
                                  }
                                }
                              }
                            ]}
                            dependencies={fields.flatMap((f) =>
                              field.key === f.key ? [] : `${f.field}.key`
                            )}
                          >
                            <Input placeholder={'参数名'} />
                          </FormItem>
                          <FormItem
                            field={`${field.field}.value`}
                            label={
                              index === 0 ? (
                                <Form.Item noStyle>
                                  <Typography.Text bold>参数值</Typography.Text>
                                </Form.Item>
                              ) : undefined
                            }
                          >
                            <Input placeholder={'参数值'} />
                          </FormItem>
                        </div>
                        <FormItem
                          className={'w-auto flex-shrink-0'}
                          label={
                            index === 0 ? (
                              <Typography.Text bold className={'label-hidden'}>
                                删
                              </Typography.Text>
                            ) : undefined
                          }
                        >
                          <Button
                            type={'text'}
                            className={'p-0'}
                            icon={<IconDelete />}
                            onClick={() => {
                              remove(index);
                              setTimeout(() => {
                                form
                                  .validate(
                                    fields.map(({ field }) => `${field}.key`)
                                  )
                                  .catch(console.error);
                              }, 0);
                            }}
                          />
                        </FormItem>
                      </div>
                    ))}
                </Form.Item>
              </>
            );
          }}
        </FormList>
        <Typography.Text bold className={'mb-2'}>
          目标数据
        </Typography.Text>
        <FormItem
          label={'来源表'}
          field={'sql_id'}
          rules={[{ message: '请选择来源表', required: true }]}
        >
          <Cascader
            className={'w-full'}
            disabled={readOnly || loading}
            placeholder="请选择来源表"
            style={{ width: 300, marginBottom: 20 }}
            options={allSQL}
            onChange={(_, selectedOptions) => {
              const versionData: SQLVersion = selectedOptions?.pop() || {};
              const { script_context = '', script_params = [] } = versionData;
              form.setFieldsValue({
                raw_script: script_context || '',
                local_params: script_params.map(
                  ({ config_key, config_value }) => ({
                    prop: config_key,
                    value: config_value
                  })
                )
              });
            }}
            loadMore={loadMore}
            showSearch
            allowClear
          />
        </FormItem>
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
