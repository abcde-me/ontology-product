import {
  Button,
  Form,
  Input,
  Typography,
  Cascader
} from '@arco-design/web-react';
import React, { useEffect } from 'react';
import { NodePanelProps } from '@/pages/workflowConfig/workflow/types';
import {
  SQLNodeConfig,
  SQLVersion
} from '@/pages/workflowConfig/workflow/nodes/sql-node/types';
import { IconDelete, IconPlus } from '@arco-design/web-react/icon';
import { SqlEditor } from '@/pages/workflowConfig/workflow/nodes/components';
import { useRequest } from 'ahooks';
import { getSQLListInSQLNode, getSQLVersionInSQLNode } from '@/api/workflowV2';
import useConfig from '@/pages/workflowConfig/workflow/nodes/sql-node/use-config';
import {
  NodeRunSetting,
  PrevNodes
} from '@/pages/workflowConfig/workflow/nodes/components';
import {
  parseLocalParams,
  pickParamsFromSQL
} from '@/pages/workflowConfig/utils';
import styles from './index.module.scss';

const { Item: FormItem, useForm, List: FormList } = Form;

const loadMore = (pathValue: string[]) => {
  return getSQLVersionInSQLNode(pathValue[0]);
};

export default React.memo(function SQLPanel(
  props: NodePanelProps<SQLNodeConfig>
) {
  const { readOnly, onValuesChange, inputs } = useConfig(props.id, props.data);
  const {
    data: allSQL,
    loading,
    run: getSQLList
  } = useRequest(
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
      refreshDeps: [inputs.sql_id],
      manual: true
    }
  );
  const [form] = useForm();
  useEffect(() => {
    const { sql_id, ...otherData } = inputs;
    if (!allSQL) {
      getSQLList();
    }
    form.setFieldsValue({
      sql_id: sql_id?.split('_'),
      ...otherData
    });
  }, [inputs]);
  return (
    <div
      className={`${styles['panel-container']} wk-node-panel-content code-panel-content date-cleaning-panel mt-4`}
    >
      <Typography.Text bold className={'mb-2'}>
        SQL任务
      </Typography.Text>
      <Form
        form={form}
        autoComplete="off"
        labelCol={{ span: 0 }}
        wrapperCol={{ span: 24 }}
        disabled={readOnly || props.readonly}
        initialValues={{ ...inputs, sql_id: inputs.sql_id?.split('_') }}
        layout="vertical"
        onValuesChange={(changedValues, v: any) => {
          if (Object.keys(changedValues).length > 2) return;
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
        <FormItem label={'SQL脚本语句'} field={'sql_id'}>
          <Cascader
            className={'w-full'}
            disabled={readOnly || loading || props.readonly}
            placeholder="请选择SQL加工脚本"
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
        <FormItem
          noStyle
          shouldUpdate={(p, c) => p.sql_id?.toString() !== c.sql_id?.toString()}
        >
          {({ sql_id }, {}) => {
            return (
              <FormItem field={'raw_script'} dependencies={['sql_id']}>
                <SqlEditor
                  placeholder={'请在此处编辑或选择SQL加工脚本'}
                  readOnly={readOnly || !!sql_id || props.readonly}
                  className={`${!!sql_id ? 'hover:cursor-not-allowed' : ''}`}
                  onChange={(value) => {
                    form.setFieldsValue({
                      local_params: parseLocalParams(
                        pickParamsFromSQL(value),
                        form.getFieldValue('local_params')
                      )
                    });
                  }}
                />
              </FormItem>
            );
          }}
        </FormItem>
        <FormItem
          noStyle
          shouldUpdate={(prevValues, currentValues) => {
            return (
              prevValues.raw_script !== currentValues.raw_script ||
              prevValues.sql_id !== currentValues.sql_id
            );
          }}
        >
          {({ raw_script, sql_id }, { getFieldValue }) => {
            return (
              <FormList field={'local_params'}>
                {(fields, { add, remove }) => {
                  return (
                    <>
                      <div
                        className={'flex w-full items-center justify-between'}
                      >
                        自定义参数
                        {!sql_id && (
                          <Button
                            type={'default'}
                            size={'mini'}
                            icon={<IconPlus />}
                            disabled={readOnly || props.readonly}
                            onClick={(e) => {
                              e.stopPropagation();
                              add({
                                prop: undefined,
                                value: undefined
                              });
                            }}
                          />
                        )}
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
                                        <Typography.Text bold>
                                          参数名
                                        </Typography.Text>
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
                                  <Input
                                    placeholder={'参数名'}
                                    disabled={readOnly || !!sql_id}
                                  />
                                </FormItem>
                                <FormItem
                                  field={`${field.field}.value`}
                                  label={
                                    index === 0 ? (
                                      <Form.Item noStyle>
                                        <Typography.Text bold>
                                          参数值
                                        </Typography.Text>
                                      </Form.Item>
                                    ) : undefined
                                  }
                                >
                                  <Input placeholder={'参数值'} />
                                </FormItem>
                              </div>
                              {!sql_id && (
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
                                    disabled={readOnly || props.readonly}
                                    icon={<IconDelete />}
                                    onClick={() => {
                                      remove(index);
                                      setTimeout(() => {
                                        form
                                          .validate(
                                            fields.map(
                                              ({ field }) => `${field}.key`
                                            )
                                          )
                                          .catch(console.error);
                                      }, 0);
                                    }}
                                  />
                                </FormItem>
                              )}
                            </div>
                          ))}
                      </Form.Item>
                    </>
                  );
                }}
              </FormList>
            );
          }}
        </FormItem>
        <NodeRunSetting />
      </Form>
      <PrevNodes node={props.id} />
    </div>
  );
});
