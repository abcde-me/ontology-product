import React, { useMemo } from 'react';
import {
  Checkbox,
  Empty,
  Select,
  Table,
  TableColumnProps,
  Tooltip
} from '@arco-design/web-react';
import styles from '../../index.module.scss';
import { IconQuestionCircle } from '@arco-design/web-react/icon';
import { useRequest } from 'ahooks';
import { PreviewConnectorSampleData } from '@/api/connectionApi';
import { isNil } from 'lodash-es';
import { getSourceTableField } from '@/api/workflowV2';

export const FieldSync = (props: {
  value?: any[];
  onChange?: (map: any[]) => void;
  source: React.Key;
  target: React.Key;
}) => {
  const { data: targetFields } = useRequest(
    () => {
      if (isNil(props.target)) return Promise.resolve();
      return PreviewConnectorSampleData({ name: props.target });
    },
    {
      refreshDeps: [props.target]
    }
  );
  const { data: sourceFields } = useRequest(
    () => {
      if (isNil(props.source)) return Promise.resolve();
      return getSourceTableField(props.source);
    },
    { refreshDeps: [props.source] }
  );

  const tableData = useMemo(() => {
    return props.value ?? [];
  }, [props.value, targetFields, sourceFields]);

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
      render: (_, record, index) => {
        return (
          <Select
            size={'mini'}
            value={record.target_field}
            onChange={(v) => record.onChange?.('target_field', v, index)}
            style={{ width: '100%' }}
            options={record.targetFieldOptions?.map((item) => ({
              label: item,
              value: item
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
          onChange={(checked) => record.onChange?.('sync', checked, index)}
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
      render: (_, record, index) => (
        <Checkbox
          checked={record.primary}
          onChange={(checked) => record.onChange?.('primary', checked, index)}
        />
      )
    }
  ];

  return (
    <Table
      pagination={false}
      data={tableData}
      columns={fieldMappingColumns}
      border={false}
      noDataElement={<Empty description={'暂无字段信息'} />}
      className={styles['field-sync-table']}
    />
  );
};
