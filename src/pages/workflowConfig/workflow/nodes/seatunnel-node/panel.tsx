import {
  Button,
  Form,
  Input,
  Typography,
  Grid,
  Cascader
} from '@arco-design/web-react';
import React from 'react';
import { NodePanelProps } from '@/pages/workflowConfig/workflow/types';
import styles from './index.module.scss';
import {
  SQLNodeConfig,
  SQLVersion
} from '@/pages/workflowConfig/workflow/nodes/sql-node/types';
import { IconDelete, IconPlus } from '@arco-design/web-react/icon';
import { SqlEditor } from '@/pages/workflowConfig/workflow/nodes/sql-node/components';
import { useRequest } from 'ahooks';
import {
  getSourceDatabaseList,
  getSourceTable,
  getSQLListInSQLNode,
  getSQLVersionInSQLNode
} from '@/api/workflowV2';
import useConfig from '@/pages/workflowConfig/workflow/nodes/sql-node/use-config';
import { useNodesInteractions } from '@/pages/workflowConfig/workflow/hooks';
import {
  NodeRunSetting,
  PrevNodes
} from '@/pages/workflowConfig/workflow/nodes/components';
import { FieldSync } from '@/pages/workflowConfig/workflow/nodes/seatunnel-node/components';
import { getConnectionList, getdetailList } from '@/api/connectionApi';
import { ConnectionItem } from '@/pages/workflowConfig/workflow/nodes/seatunnel-node/types';
import { isEmpty, isNil } from 'lodash-es';

const { Item: FormItem, useForm, List: FormList } = Form;
const { Row, Col } = Grid;

const loadMore = (pathValue: string[], level: number) => {
  return getSourceTable(pathValue[0]);
};
const loadConnectionTable = (pathValue: string[], level: number) => {
  return getdetailList({ id: pathValue[0] })
    .then((res) => {
      const { config = {}, table_name = {} } = res.data || {};
      if (isEmpty(config)) return [];
      if (!config.database) return [];
      return [
        {
          ...config,
          label: config.database,
          value: config.database,
          children: table_name.map(({ title }) => ({
            label: title,
            value: title,
            isLeaf: true
          }))
        }
      ];
    })
    .catch(() => {
      return Promise.resolve([]);
    });
};

export default React.memo(function SeatunnelPanel(
  props: NodePanelProps<SQLNodeConfig>
) {
  const { readOnly, onValuesChange, inputs } = useConfig(props.id, props.data);
  const { data: allConnections, loading: connectorLoading } = useRequest(
    async () => {
      try {
        const res = await getConnectionList({
          page: 1,
          page_size: 999,
          sub_type: 'ELasticsearch,Doris'
        });
        const list = (res.data.items || []) as ConnectionItem[];
        return list.map((connection) => {
          const { name, id } = connection;
          return {
            ...connection,
            label: name,
            value: id
          };
        });
      } catch (e) {
        console.error('load connector error', e);
        return [];
      }
    },
    {
      refreshDeps: [inputs.sql_id]
    }
  );
  const { data: allSourceDatabase } = useRequest(async () => {
    return await getSourceDatabaseList();
  });
  useRequest(async () => {});
  const [form] = useForm();
  return (
    <div
      className={`${styles['panel-container']} wk-node-panel-content code-panel-content date-cleaning-panel mt-4`}
    >
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
          // const { local_params, sql_id, ...otherValue } = v;
          // onValuesChange({
          //   ...inputs,
          //   ...otherValue,
          //   sql_id: sql_id?.join('_'),
          //   local_params: local_params.map(({ prop, value }) => ({
          //     prop,
          //     value,
          //     direct: 'IN',
          //     type: 'VARCHAR'
          //   }))
          // });
        }}
      >
        <FormItem
          label={'来源表'}
          field={'source_database'}
          rules={[{ message: '请选择来源表', required: true }]}
        >
          <Cascader
            className={'w-full'}
            disabled={readOnly || allSourceDatabase}
            placeholder="请选择来源表"
            options={allSourceDatabase}
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
        {!connectorLoading && (
          <FormItem
            field={'raw_script'}
            dependencies={['sql_id']}
            label={'来源数据过滤'}
            tooltip={'编写带有引用参数的sql语句以增量查询和数据条件过滤'}
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
                <Form.Item className={styles['add-field-action']}>
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
                              <Typography.Text
                                bold
                                className={styles['label-hidden']}
                              >
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
          label={'目标表'}
          field={'target_datasource_id'}
          rules={[{ message: '请选择目标表', required: true }]}
        >
          <Cascader
            className={'w-full'}
            disabled={readOnly || connectorLoading}
            placeholder="请选择目标表"
            options={allConnections}
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
            loadMore={loadConnectionTable}
            showSearch
            allowClear
          />
        </FormItem>
        <FormItem noStyle shouldUpdate={true}>
          {({ target_datasource_id, source_database }) => {
            if ([target_datasource_id, source_database].some(isNil))
              return null;
            return (
              <FormItem field={'field_sync'} label={'同步字段信息'}>
                <FieldSync
                  source={source_database}
                  target={target_datasource_id}
                />
              </FormItem>
            );
          }}
        </FormItem>
        <NodeRunSetting />
      </Form>
      <PrevNodes node={props.id} />;
    </div>
  );
});
