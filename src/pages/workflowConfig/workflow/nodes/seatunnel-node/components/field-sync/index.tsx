import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Checkbox,
  Empty,
  Table,
  TableColumnProps,
  Tooltip
} from '@arco-design/web-react';
import styles from '../../index.module.scss';
import { IconQuestionCircle } from '@arco-design/web-react/icon';
import { useRequest } from 'ahooks';
import { PreviewConnectorSampleData } from '@/api/connectionApi';
import { isEqual, isNil } from 'lodash-es';
import { getSourceTableField } from '@/api/workflowV2';
import {
  SourceField,
  SyncField,
  SyncFieldValue,
  TargetField
} from '@/pages/workflowConfig/workflow/nodes/seatunnel-node/types';
import produce from 'immer';
import { SelectWithNoData } from '@/components/new-no-data-comps';

const FieldSync = (props: {
  value?: SyncFieldValue;
  onChange?: (value: SyncFieldValue) => void;
  source: React.Key;
  target: React.Key[];
  disabled?: boolean;
}) => {
  const [tableData, setTableData] = useState<SyncField[]>([]);

  const { data: targetFields = [], loading: loadingTarget } = useRequest(
    () => {
      const emptyRes: TargetField[] = [];
      if (isNil(props.target)) return Promise.resolve(emptyRes);
      const [connector, database, table] = props.target;
      return PreviewConnectorSampleData({
        name: table,
        connector_id: connector
      })
        .then((res) => res.data?.columns || [])
        .catch((e) => {
          console.error(e);
          return Promise.resolve(emptyRes);
        });
    },
    {
      refreshDeps: [props.target]
    }
  );
  const {
    data: sourceFields = new Map<string, SourceField>(),
    loading: loadingSource
  } = useRequest(
    () => {
      const emptyRes: Map<string, SourceField> = new Map<string, SourceField>();
      if (isNil(props.source)) return Promise.resolve(emptyRes);
      return getSourceTableField(props.source)
        .then((res: SourceField[]) => {
          return res.reduce((p, source) => {
            p.set(source.fieldName, source);
            return p;
          }, new Map<string, SourceField>());
        })
        .catch((e) => {
          console.error(e);
          return Promise.resolve(emptyRes);
        });
    },
    { refreshDeps: [props.source] }
  );

  useEffect(() => {
    const { field_mapping_list, primary_keys } = props?.value || {};
    const source2TargetMap = field_mapping_list?.reduce((p, field) => {
      p.set(field.source_field, field);
      return p;
    }, new Map<string, SyncField>());
    // 遍历查找来源和目标字段中重名的字段
    const datasource = targetFields.flatMap(
      ({ name: t_name, type: t_type }) => {
        const sourceField = sourceFields.get(t_name);
        if (!sourceField) {
          return [];
        }
        const { fieldName: s_name, dataType: s_type } = sourceField;
        const sourceFromValue = source2TargetMap?.get(s_name);
        return {
          source_field: s_name,
          source_field_type: s_type,
          target_field: sourceFromValue?.target_field || t_name,
          target_field_type: t_type,
          sync: !!sourceFromValue,
          primary: primary_keys?.includes(s_name)
        };
      }
    );
    setTableData(datasource);
  }, [props.value, sourceFields, targetFields]);

  const changeField = useCallback(
    (data: SyncField, index: number, field?: string) => {
      const value = produce(tableData, (draft) => {
        draft[index] = data;
      }).reduce<SyncFieldValue>(
        (p, sf) => {
          const { sync, primary, ...other } = sf;
          if (sync) {
            p.field_mapping_list.push(other);
          }
          if (primary) {
            p.primary_keys.push(other.source_field);
          }
          return p;
        },
        {
          primary_keys: [],
          field_mapping_list: []
        }
      );
      props?.onChange?.(value);
    },
    [tableData]
  );

  const fieldMappingColumns: TableColumnProps[] = [
    {
      title: '源字段名',
      dataIndex: 'source_field',
      width: 60,
      ellipsis: true
    },
    {
      title: '源字段类型',
      dataIndex: 'source_field_type',
      ellipsis: true,
      width: 80
    },
    {
      title: '目标字段名',
      dataIndex: 'target_field',
      width: 100,
      render: (value, record, index) => {
        return (
          <SelectWithNoData
            disabled={props.disabled}
            size={'mini'}
            value={value}
            onChange={(v) => changeField({ ...record, target_field: v }, index)}
            className={'w-full'}
            options={targetFields.map((t) => ({
              value: t.name,
              label: t.name
            }))}
          />
        );
      }
    },
    {
      title: '目标字段类型',
      dataIndex: 'target_field_type',
      ellipsis: true,
      width: 80
    },
    {
      title: '同步',
      dataIndex: 'sync',
      align: 'center',
      width: 40,
      render: (_, record, index) => (
        <Checkbox
          checked={record.sync}
          disabled={props.disabled}
          onChange={(checked) =>
            changeField(
              {
                ...record,
                sync: checked,
                primary: !checked ? false : record.primary
              },
              index
            )
          }
        />
      )
    },
    {
      title: (
        <Tooltip content={'用于判断数据推送时是否重复'}>
          <div
            className={'pointer-events-auto! relative flex items-center gap-1'}
          >
            主键
            <IconQuestionCircle className={'hover:cursor-pointer!'} />
          </div>
        </Tooltip>
      ),
      dataIndex: 'primary',
      align: 'center',
      width: 60,
      render: (_, record, index) => {
        return (
          <Checkbox
            checked={record.sync && record.primary}
            disabled={!record.sync || props.disabled}
            onChange={(checked) =>
              changeField(
                {
                  ...record,
                  primary: checked
                },
                index
              )
            }
          />
        );
      }
    }
  ];

  return (
    <Table
      pagination={false}
      data={tableData}
      columns={fieldMappingColumns}
      loading={loadingTarget || loadingSource}
      border={false}
      noDataElement={<Empty description={'暂无字段信息'} />}
      className={styles['field-sync-table']}
    />
  );
};
export default memo(FieldSync, (prevProps, nextProps) => {
  if ([prevProps, nextProps].some(isNil)) return false;
  const {
    source: p_source,
    target: p_target,
    value: prev_value,
    disabled: p_d
  } = prevProps;
  const {
    source: n_source,
    target: n_target,
    value: next_value,
    disabled: n_d
  } = nextProps;
  return (
    isEqual(
      { source: n_source, target: n_target },
      { source: p_source, target: p_target }
    ) &&
    isEqual(prev_value, next_value) &&
    p_d === n_d
  );
});
