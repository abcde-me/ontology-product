import {
  Button,
  Form,
  Input,
  Typography,
  Divider,
  Radio
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
import { NoDataCard } from '@ceai-front/arco-material';
import { CascaderWithNoData } from '@/components/new-no-data-comps';

const { Item: FormItem, useForm, List: FormList } = Form;

const loadMore = (pathValue: string[]) => {
  return getSQLVersionInSQLNode(+pathValue[0]);
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
        const sql_id = inputs.sql_id?.split('_') || [];
        const sqlList = await getSQLListInSQLNode(sql_id[0]);
        if (sql_id.length > 1) {
          const sqlId = sql_id[0].toString();
          const sqlVersions = await getSQLVersionInSQLNode(+sqlId);
          sqlList.forEach((sql) => {
            if (sql.value === sqlId) {
              sql.children = sqlVersions;
            }
          });
        }
        console.log(123, sqlList);
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
    const { sql_id, script_type, ...otherData } = inputs;
    if (!allSQL) {
      getSQLList();
    }
    form.setFieldsValue({
      sql_id: sql_id?.split('_'),
      script_type: script_type || 'select',
      ...otherData
    });
  }, [inputs]);
  return (
    <div
      className={`${styles['panel-container']} wk-node-panel-content code-panel-content date-cleaning-panel mt-4`}
    >
      <div
        className={
          'font-[PingFang SC] mb-2 text-[14px] font-[600] text-[#1E293B]'
        }
      >
        SQL开发
      </div>
      <Form
        form={form}
        autoComplete="off"
        labelCol={{ span: 0 }}
        wrapperCol={{ span: 24 }}
        disabled={readOnly || props.readonly}
        initialValues={{ ...inputs, sql_id: inputs.sql_id?.split('_') }}
        layout="vertical"
        onValuesChange={(changedValues, v: any) => {
          // 首次批量进行赋值，不触发保存
          if (Object.keys(changedValues).length >= 5) return;
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
          label={
            <div
              className={
                'font-[PingFang SC] text-[14px] font-[400] text-[#1E293B]'
              }
            >
              SQL脚本语句:
            </div>
          }
          className={'mb-0'}
        >
          <FormItem field={'script_type'} className={'mb-2'}>
            <Radio.Group
              options={[
                { value: 'select', label: '从已有脚本中选择' },
                { value: 'custom', label: '手动填写脚本' }
              ]}
              onChange={(v) => {
                form.setFieldsValue({
                  sql_id: undefined,
                  raw_script: undefined,
                  local_params: [],
                  script_type: v
                });
              }}
            />
          </FormItem>
          <FormItem
            noStyle
            shouldUpdate={(p, c) => p.script_type !== c.script_type}
          >
            {({ script_type }) => {
              if (script_type === 'custom') {
                return null;
              }
              return (
                <FormItem field={'sql_id'} className={'mb-2'}>
                  <CascaderWithNoData
                    className={`w-full`}
                    disabled={readOnly || loading || props.readonly}
                    notFoundContent={
                      <div
                        className={
                          'flex h-full w-full items-center justify-center'
                        }
                      >
                        <NoDataCard type={'block'} />
                      </div>
                    }
                    placeholder="请选择SQL加工脚本"
                    style={{ width: 300, marginBottom: 20 }}
                    options={allSQL}
                    dropdownMenuClassName={styles['script-cascader-render']}
                    renderOption={(option, level) => {
                      if (level > 0) {
                        return (
                          <div
                            className={`font-[PingFang SC] text-[12px] ${styles['label-container']}`}
                          >
                            <div
                              className={`text-[#0F172A] ${styles['son-label']}`}
                            >
                              {option.label}
                            </div>
                            {(option as any).script_desc && (
                              <div
                                className={`text-[#334155] ${styles['son-label']} w-max-[160px] overflow-hidden text-ellipsis whitespace-nowrap`}
                              >
                                {option.script_desc}
                              </div>
                            )}
                          </div>
                        );
                      }
                      return option.label;
                    }}
                    onChange={(_, selectedOptions) => {
                      const versionData: SQLVersion =
                        selectedOptions?.pop() || {};
                      const { script_context = '', script_params = [] } =
                        versionData;
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
              );
            }}
          </FormItem>
        </FormItem>
        <FormItem
          noStyle
          shouldUpdate={(p, c) => p.sql_id?.toString() !== c.sql_id?.toString()}
        >
          {({ sql_id, script_type }, {}) => {
            if (script_type === 'select' && !sql_id) {
              return null;
            }
            return (
              <FormItem field={'raw_script'} dependencies={['sql_id']}>
                <SqlEditor
                  placeholder={'请在此处编辑或选择SQL加工脚本'}
                  editorTitle={'SQL脚本语句'}
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
          {({ raw_script, script_type, sql_id }, { getFieldValue }) => {
            if (script_type !== 'custom' && !sql_id && !raw_script) {
              return null;
            }
            return (
              <FormList field={'local_params'}>
                {(fields, { add, remove }) => {
                  return (
                    <>
                      <div
                        className={'flex w-full items-center justify-between'}
                      >
                        自定义参数：
                        <Button
                          size={'mini'}
                          type={'text'}
                          className={`flex items-center justify-center ${styles['add-params']}`}
                          icon={<IconPlus className={'text-[#1E293B]'} />}
                          disabled={readOnly || props.readonly}
                          onClick={(e) => {
                            e.stopPropagation();
                            add({
                              prop: undefined,
                              value: undefined
                            });
                          }}
                        />
                      </div>
                      <FormItem className={'add-field-action'}>
                        {!!fields.length &&
                          fields.map((field, index) => (
                            <div key={field.key} className={'flex flex-1'}>
                              <div className={'fields-item flex flex-1 gap-3'}>
                                <FormItem
                                  className={'mb-2'}
                                  field={`${field.field}.prop`}
                                  label={
                                    index === 0 ? (
                                      <Form.Item noStyle>
                                        <div
                                          className={
                                            'font-[PingFang SC] text-[12px] font-[600] text-[#1E293B]'
                                          }
                                        >
                                          参数名
                                        </div>
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
                                  className={'mb-2'}
                                  label={
                                    index === 0 ? (
                                      <Form.Item noStyle>
                                        <div
                                          className={
                                            'font-[PingFang SC] text-[12px] font-[600] text-[#1E293B]'
                                          }
                                        >
                                          参数值
                                        </div>
                                      </Form.Item>
                                    ) : undefined
                                  }
                                >
                                  <Input placeholder={'参数值'} />
                                </FormItem>
                              </div>
                              {!sql_id && (
                                <FormItem
                                  className={'mb-2 w-auto flex-shrink-0'}
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
                                    icon={
                                      <IconDelete
                                        className={'text-[#0F172A]'}
                                      />
                                    }
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
                      </FormItem>
                    </>
                  );
                }}
              </FormList>
            );
          }}
        </FormItem>
        <Divider className={'mb-3 mt-2'} />
        <NodeRunSetting />
        <Divider className={'mb-3 mt-0'} />
      </Form>
      <PrevNodes node={props.id} />
    </div>
  );
});
