import {
  Form,
  Input,
  Typography,
  Cascader,
  Divider
} from '@arco-design/web-react';
import React, { useEffect, useMemo, useRef } from 'react';
import { NodePanelProps } from '@/pages/workflowConfig/workflow/types';
import styles from './index.module.scss';
import { DatabaseConfig, LocalParam, SeatunnelConfig } from './types';
import { SqlEditor } from '@/pages/workflowConfig/workflow/nodes/components';
import { useRequest } from 'ahooks';
import { getSourceDatabaseList, getSourceTable } from '@/api/workflowV2';
import useConfig from './use-config';
import {
  NodeRunSetting,
  PrevNodes
} from '@/pages/workflowConfig/workflow/nodes/components';
import {
  FieldSync,
  HighLightSearchCascader
} from '@/pages/workflowConfig/workflow/nodes/seatunnel-node/components';
import { getConnectionList, getdetailList } from '@/api/connectionApi';
import {
  ConnectionItem,
  SourceDatabase,
  SourceTable
} from '@/pages/workflowConfig/workflow/nodes/seatunnel-node/types';
import { isEmpty, isNil } from 'lodash-es';
import {
  parseLocalParams,
  pickParamsFromSQL
} from '@/pages/workflowConfig/utils';

const { Item: FormItem, useForm, List: FormList } = Form;

const loadSourceTable = (pathValue?: React.Key[]) => {
  if (isNil(pathValue)) {
    return Promise.resolve([]);
  }
  return getSourceTable(pathValue[0])
    .then((res: SourceTable[]) => {
      return res.map((item: SourceTable) => ({
        ...item,
        label: item.tableName,
        value: item.id,
        isLeaf: true
      }));
    })
    .catch((e) => {
      console.error(e);
      return Promise.resolve([]);
    });
};

const loadConnectionTable = (pathValue?: React.Key[]) => {
  if (isNil(pathValue)) {
    return Promise.resolve([]);
  }
  return getdetailList({ id: pathValue[0] })
    .then((res) => {
      // 库主键为id，表主键为表名
      return res.data?.table_name.map(({ title }) => ({
        label: title,
        value: title,
        isLeaf: true
      }));
    })
    .catch(() => {
      return Promise.resolve([]);
    });
};

export default React.memo(function SeatunnelPanel(
  props: NodePanelProps<SeatunnelConfig>
) {
  const { readOnly, onValuesChange, inputs } = useConfig(props.id, props.data);
  // 获取源数据
  const {
    data: allSourceDatabase,
    loading: loadingSource,
    runAsync: getSourceData
  } = useRequest(
    // 初始化级联组件的options，便于数据的回显
    async (database?: string) => {
      const sourceDatabase: SourceDatabase[] = await getSourceDatabaseList();
      const sourceData = sourceDatabase.map((database) => {
        const { databaseName, id } = database;
        return {
          ...database,
          label: databaseName,
          value: id
        };
      });
      // 不存在初始的来源库，只返回库列表
      if (isNil(sourceData)) {
        return sourceData;
      }
      // 找出库id，查找来源表数据
      const s_database = sourceData.find(
        ({ databaseName }) => databaseName === database
      );
      const tables = await loadSourceTable(
        s_database?.id ? [s_database.id] : undefined
      );
      return sourceData.flatMap((source) => {
        if (source.databaseName === database) {
          return { ...source, children: tables };
        }
        return source;
      });
    },
    {
      manual: true
    }
  );
  // 获取目标数据
  const {
    data: allConnections,
    loading: connectorLoading,
    runAsync: getTargetData
  } = useRequest(
    async (connector?: React.Key) => {
      const res = await getConnectionList({
        page: 1,
        page_size: 999,
        sub_type: 'ELasticsearch,Doris'
      });
      const connectionList = (res.data.items || []) as ConnectionItem[];
      const targetData = connectionList.map((connection) => {
        const { name, id } = connection;
        return {
          ...connection,
          label: name,
          value: id
        };
      });
      if (isNil(connector)) {
        return targetData;
      }
      const tables = await loadConnectionTable([connector]);
      return targetData.flatMap((target) => {
        if (target.id === connector) {
          return { ...target, children: tables };
        }
        return target;
      });
    },
    {
      manual: true
    }
  );
  const [form] = useForm();

  useEffect(() => {
    (async () => {
      const {
        field_mapping_list,
        primary_keys,
        target_datasource_table,
        target_datasource_name,
        target_datasource_id,
        target_table_name,
        source_database,
        source_table_name,
        ...other
      } = inputs;
      const formData: Record<string, any> = {
        field_sync: {
          field_mapping_list,
          primary_keys
        },
        ...other
      };
      // 只有进入节点面板时才会去查询数据
      if (!allSourceDatabase) {
        const sourceData = await getSourceData(source_database);
        if (source_database && source_table_name) {
          const sourceDatabase = sourceData.find(
            ({ label }) => label === source_database
          );
          // @ts-ignore
          const sourceTable = sourceDatabase?.children?.find(
            ({ label }) => label === source_table_name
          );
          formData.source_database =
            isNil(sourceDatabase) || isNil(sourceTable)
              ? undefined
              : [sourceDatabase.value, sourceTable.value];
        }
      }
      if (!allConnections) {
        const targetData = await getTargetData(target_datasource_id);
        if (target_table_name && target_datasource_id) {
          const connection = targetData.find(
            ({ value }) => value === target_datasource_id
          );
          formData.target_datasource_id = isNil(connection)
            ? undefined
            : [target_datasource_id, target_table_name];
        }
      }
      form.setFieldsValue(formData);
    })();
  }, [inputs]);

  return (
    <div
      className={`${styles['panel-container']} wk-node-panel-content code-panel-content date-cleaning-panel mt-4`}
    >
      <div
        className={'mb-3 font-PingFangSc text-[14px] font-[600] leading-[22px]'}
      >
        来源数据
      </div>
      <Form
        form={form}
        autoComplete="off"
        wrapperCol={{ span: 24 }}
        disabled={readOnly || props.readonly}
        layout="vertical"
        onValuesChange={(changedValues, v: any) => {
          const fields = Object.keys(changedValues);
          if (fields.length > 1) return;
          form
            .validate(fields)
            .then((res) => {
              const {
                source,
                target,
                field_sync,
                source_database,
                target_datasource_id,
                ...other
              } = v;
              onValuesChange({ ...source, ...target, ...field_sync, ...other });
            })
            .catch(console.error);
        }}
      >
        <FormItem
          label={'来源表:'}
          field={'source_database'}
          required
          rules={[
            {
              validator(v?: React.Key[], errorCall?) {
                if (!v) {
                  return errorCall('来源表不能为空');
                }
                if (v.length <= 1) {
                  return errorCall('请选择到来源表');
                }
              }
            }
          ]}
        >
          <HighLightSearchCascader
            className={'w-full'}
            disabled={readOnly || loadingSource || props.readonly}
            loading={loadingSource}
            placeholder="请选择来源表"
            options={allSourceDatabase}
            onChange={(_, selectedOptions) => {
              const [database, table] = selectedOptions || [];
              form.setFieldsValue({
                source: {
                  source_database: (database as SourceDatabase).databaseName,
                  source_table_name: (table as SourceTable).tableName
                }
              });
            }}
            loadMore={loadSourceTable}
            allowClear
          />
        </FormItem>
        {!connectorLoading && (
          <FormItem
            field={'query'}
            dependencies={['source_database']}
            label={'来源数据过滤:'}
            tooltip={'编写带有引用参数的sql语句以增量查询和数据条件过滤'}
          >
            <SqlEditor
              placeholder={
                '只填写WHERE 后面的过滤条件(含 WHERE关键字)。\n如： WHERE  year = ${year}'
              }
              editorTitle={'来源数据过滤'}
              readOnly={readOnly || props.readonly}
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
        )}
        <FormItem
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.query !== currentValues.query
          }
        >
          {({ query }) => {
            const paramKeys = pickParamsFromSQL(query);
            if (!paramKeys.length) {
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
                                        <div
                                          className={
                                            'font-PingFangSc text-[12px] font-[600] leading-[18px]'
                                          }
                                        >
                                          参数名:
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
                                  <Input placeholder={'参数名'} disabled />
                                </FormItem>
                                <FormItem
                                  field={`${field.field}.value`}
                                  label={
                                    index === 0 ? (
                                      <Form.Item noStyle>
                                        <div
                                          className={
                                            'font-PingFangSc text-[12px] font-[600] leading-[18px]'
                                          }
                                        >
                                          参数值:
                                        </div>
                                      </Form.Item>
                                    ) : undefined
                                  }
                                >
                                  <Input placeholder={'参数值'} />
                                </FormItem>
                              </div>
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
        <Divider className={'mb-4 mt-0'} />
        <div
          className={
            'mb-3 font-PingFangSc text-[14px] font-[600] leading-[22px]'
          }
        >
          目标数据
        </div>
        <FormItem
          label={'目标表'}
          field={'target_datasource_id'}
          required
          rules={[
            {
              validator(v?: React.Key[], errorCall?) {
                if (!v) {
                  return errorCall('目标表不能为空');
                }
                if (v.length <= 1) {
                  return errorCall('请选择到目标表');
                }
              }
            }
          ]}
        >
          <HighLightSearchCascader
            className={'w-full'}
            disabled={readOnly || connectorLoading || props.readonly}
            loading={connectorLoading}
            placeholder="请选择目标表"
            options={allConnections}
            onChange={(_, selectedOptions) => {
              const { name, id } = selectedOptions?.[0] || {};
              const table = selectedOptions.at(-1);
              form.setFieldsValue({
                target: {
                  target_datasource_id: id,
                  target_table_name: table.value,
                  target_datasource_name: name
                }
              });
            }}
            loadMore={loadConnectionTable}
            showSearch
            allowClear
          />
        </FormItem>
        <FormItem
          noStyle
          shouldUpdate={(prevValues, currentValues) => {
            const {
              target_datasource_id: prev_target,
              source_database: prev_source
            } = prevValues;
            const {
              target_datasource_id: current_target,
              source_database: current_source
            } = currentValues;

            const update =
              prev_target?.toString() !== current_target?.toString() ||
              prev_source?.toString() !== current_source?.toString();
            return update;
          }}
        >
          {({ target_datasource_id, source_database }) => {
            if ([target_datasource_id, source_database].some(isNil))
              return null;
            return (
              <FormItem field={'field_sync'} label={'同步字段信息'}>
                <FieldSync
                  source={source_database.pop()}
                  target={target_datasource_id}
                  disabled={readOnly || props.readonly}
                />
              </FormItem>
            );
          }}
        </FormItem>
        <Divider className={'mb-4 mt-0'} />
        <NodeRunSetting />
      </Form>
      <Divider className={'mb-4 mt-0'} />
      <PrevNodes node={props.id} />
    </div>
  );
});
