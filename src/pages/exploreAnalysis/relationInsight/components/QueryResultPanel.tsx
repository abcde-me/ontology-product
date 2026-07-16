import React, { useMemo, useState } from 'react';
import { Button, Space, Table, Tag, Tooltip } from '@arco-design/web-react';
import { IconQuestionCircle } from '@arco-design/web-react/icon';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import type { FieldCommentMap } from '@/pages/exploreAnalysis/objectBrowse/utils/fieldDisplayLabel';
import { formatFieldDisplayLabel } from '@/pages/exploreAnalysis/objectBrowse/utils/fieldDisplayLabel';
import type {
  GraphLoadSettings,
  QueryResultItem,
  RelationLoadMode
} from '../types';
import { LoadGraphSettingsModal } from './LoadGraphSettingsModal';
import styles from './QueryResultPanel.module.scss';

interface QueryResultPanelProps {
  data: QueryResultItem[];
  selectedKeys: string[];
  loading?: boolean;
  fieldCommentMap?: FieldCommentMap;
  onSelectionChange: (keys: string[]) => void;
  onLoad: (
    rows: QueryResultItem[],
    mode: RelationLoadMode,
    graphSettings?: GraphLoadSettings
  ) => void;
}

const INTERNAL_FIELD_KEYS = new Set(['score', '_score', 'similarity']);

export const QueryResultPanel: React.FC<QueryResultPanelProps> = ({
  data,
  selectedKeys,
  loading = false,
  fieldCommentMap,
  onSelectionChange,
  onLoad
}) => {
  const [graphSettingsVisible, setGraphSettingsVisible] = useState(false);

  const selectedRows = useMemo(
    () => data.filter((item) => selectedKeys.includes(item.key)),
    [data, selectedKeys]
  );

  const pendingSelectedRows = useMemo(
    () => selectedRows.filter((item) => item.loadStatus === 'pending'),
    [selectedRows]
  );

  const dynamicFieldKeys = useMemo(() => {
    const sampleRecord = data.find((item) => item.rawRecord)?.rawRecord;
    if (!sampleRecord) {
      return [];
    }

    return Object.keys(sampleRecord).filter(
      (key) => !INTERNAL_FIELD_KEYS.has(key) && !key.startsWith('_')
    );
  }, [data]);

  const columns = useMemo<ColumnProps<QueryResultItem>[]>(() => {
    const dataColumns: ColumnProps<QueryResultItem>[] = dynamicFieldKeys.map(
      (fieldKey) => ({
        title: formatFieldDisplayLabel(fieldKey, fieldCommentMap),
        dataIndex: fieldKey,
        width: 160,
        ellipsis: true,
        render: (_: unknown, record: QueryResultItem) => {
          const value = record.rawRecord?.[fieldKey];
          return value == null || value === '' ? '-' : String(value);
        }
      })
    );

    const baseColumns: ColumnProps<QueryResultItem>[] =
      dataColumns.length > 0
        ? dataColumns
        : [
            {
              title: '对象 ID',
              dataIndex: 'instanceId',
              width: 120,
              render: (value: string) => (
                <span className={styles['instance-id']}>{value}</span>
              )
            },
            {
              title: '名称',
              dataIndex: 'instanceLabel',
              width: 140,
              render: (value: string) => (
                <span className={styles['instance-name']}>{value}</span>
              )
            },
            {
              title: '手机号',
              dataIndex: 'phone',
              width: 140,
              ellipsis: true,
              render: (value?: string) => value || '-'
            },
            {
              title: '类型',
              dataIndex: 'objectTypeName',
              width: 100,
              ellipsis: true,
              render: (value?: string) => value || '-'
            }
          ];

    return [
      ...baseColumns,
      {
        title: '状态',
        dataIndex: 'loadStatus',
        width: 88,
        fixed: 'right' as const,
        render: (value: QueryResultItem['loadStatus']) =>
          value === 'loaded' ? (
            <Tag color="green" size="small">
              已载入
            </Tag>
          ) : (
            <Tag color="gray" size="small">
              待载入
            </Tag>
          )
      }
    ];
  }, [dynamicFieldKeys, fieldCommentMap]);

  const handleLoadNodes = () => {
    if (pendingSelectedRows.length === 0) {
      return;
    }
    onLoad(pendingSelectedRows, 'nodes-only');
  };

  const handleLoadGraph = () => {
    if (pendingSelectedRows.length === 0) {
      return;
    }
    setGraphSettingsVisible(true);
  };

  const handleGraphSettingsConfirm = (settings: GraphLoadSettings) => {
    setGraphSettingsVisible(false);
    onLoad(pendingSelectedRows, 'graph', settings);
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles['title-wrap']}>
          <span className={styles.title}>查询结果</span>
          <Tooltip content="勾选实例后，可仅载入节点或载入关联图谱">
            <IconQuestionCircle className={styles.help} />
          </Tooltip>
          <Space size={8} className={styles.stats}>
            <Tag size="small">共 {data.length} 条</Tag>
            <Tag size="small" color="arcoblue">
              已选 {selectedKeys.length}
            </Tag>
          </Space>
        </div>

        <Space size={8}>
          <Button
            size="small"
            type="outline"
            disabled={pendingSelectedRows.length === 0 || loading}
            onClick={handleLoadNodes}
          >
            载入节点
          </Button>
          <Tooltip content="载入各节点关联图谱，可设置关系跳数">
            <span className={styles['tooltip-btn-wrap']}>
              <Button
                size="small"
                type="primary"
                disabled={pendingSelectedRows.length === 0 || loading}
                onClick={handleLoadGraph}
              >
                载入图谱
              </Button>
            </span>
          </Tooltip>
        </Space>
      </div>

      <LoadGraphSettingsModal
        visible={graphSettingsVisible}
        onCancel={() => setGraphSettingsVisible(false)}
        onConfirm={handleGraphSettingsConfirm}
      />

      <Table
        rowKey="key"
        size="small"
        loading={loading}
        columns={columns}
        data={data}
        pagination={false}
        scroll={{ x: true, y: 320 }}
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys: selectedKeys,
          onChange: (keys) => {
            onSelectionChange(keys as string[]);
          }
        }}
      />
    </div>
  );
};
