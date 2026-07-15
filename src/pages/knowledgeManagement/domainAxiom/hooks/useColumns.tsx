import React, { useMemo } from 'react';
import { Button, Popconfirm, Space, Switch, Tag } from '@arco-design/web-react';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import dayjs from 'dayjs';
import { AXIOM_SOURCE_COLOR, AXIOM_SOURCE_LABEL } from '../constants';
import type { AxiomSourceType, DomainAxiomListItem } from '../types';

interface UseColumnsProps {
  onViewDetail: (record: DomainAxiomListItem) => void;
  onToggleEnabled: (record: DomainAxiomListItem, enabled: boolean) => void;
  onDelete: (record: DomainAxiomListItem) => void;
  deletingId?: string;
  togglingId?: string;
}

export const useColumns = ({
  onViewDetail,
  onToggleEnabled,
  onDelete,
  deletingId,
  togglingId
}: UseColumnsProps) => {
  const columns: ColumnProps<DomainAxiomListItem>[] = useMemo(
    () => [
      {
        title: '公理名称',
        dataIndex: 'name',
        width: 180,
        ellipsis: true
      },
      {
        title: '公理表达式',
        dataIndex: 'expression',
        width: 260,
        ellipsis: true
      },
      {
        title: '所属领域',
        dataIndex: 'domain',
        width: 120,
        ellipsis: true,
        render: (value?: string) => value || '-'
      },
      {
        title: '创建方式',
        dataIndex: 'sourceType',
        width: 110,
        render: (value: AxiomSourceType) => (
          <Tag color={AXIOM_SOURCE_COLOR[value]}>
            {AXIOM_SOURCE_LABEL[value] || '-'}
          </Tag>
        )
      },
      {
        title: '应用场景',
        dataIndex: 'applicationScenarioName',
        width: 150,
        ellipsis: true,
        render: (value?: string) => value || '-'
      },
      {
        title: '本体场景',
        dataIndex: 'ontologySceneName',
        width: 150,
        ellipsis: true,
        render: (value?: string, record?: DomainAxiomListItem) =>
          value ||
          (record?.ontologySceneId ? `场景 #${record.ontologySceneId}` : '-')
      },
      {
        title: '启用',
        dataIndex: 'enabled',
        width: 80,
        render: (enabled: boolean, record: DomainAxiomListItem) => (
          <Switch
            size="small"
            checked={enabled}
            loading={togglingId === record.id}
            onChange={(checked) => onToggleEnabled(record, checked)}
          />
        )
      },
      {
        title: '创建人',
        dataIndex: 'creator',
        width: 100,
        render: (value?: string) => value || '-'
      },
      {
        title: '更新时间',
        dataIndex: 'updatedAt',
        width: 170,
        render: (time: string) =>
          time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
      },
      {
        title: '操作',
        dataIndex: 'operations',
        width: 120,
        fixed: 'right' as const,
        render: (_: unknown, record: DomainAxiomListItem) => (
          <Space size={8}>
            <Button
              type="text"
              size="small"
              className="p-0"
              onClick={() => onViewDetail(record)}
            >
              详情
            </Button>
            <Popconfirm
              title="确认删除该领域公理？删除后不可恢复。"
              onOk={() => onDelete(record)}
            >
              <Button
                type="text"
                size="small"
                className="p-0"
                status="danger"
                loading={deletingId === record.id}
              >
                删除
              </Button>
            </Popconfirm>
          </Space>
        )
      }
    ],
    [deletingId, onDelete, onToggleEnabled, onViewDetail, togglingId]
  );

  return columns;
};
