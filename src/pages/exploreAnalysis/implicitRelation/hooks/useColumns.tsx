import React, { useMemo } from 'react';
import { Button, Popconfirm, Space, Tag } from '@arco-design/web-react';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import dayjs from 'dayjs';
import { DISCOVERY_ALGORITHM_LABEL } from '../constants';
import type {
  ImplicitDiscoveryAlgorithm,
  ImplicitRelationTaskListItem
} from '../types';

interface UseColumnsProps {
  onViewDetail: (record: ImplicitRelationTaskListItem) => void;
  onAsk: (record: ImplicitRelationTaskListItem) => void;
  onDelete: (record: ImplicitRelationTaskListItem) => void;
  deletingId?: string;
}

export const useColumns = ({
  onViewDetail,
  onAsk,
  onDelete,
  deletingId
}: UseColumnsProps) => {
  const columns: ColumnProps<ImplicitRelationTaskListItem>[] = useMemo(
    () => [
      {
        title: '任务名称',
        dataIndex: 'name',
        width: 180
      },
      {
        title: '本体图谱',
        dataIndex: 'ontologySceneName',
        width: 150,
        render: (value?: string, record?: ImplicitRelationTaskListItem) =>
          value ||
          (record?.ontologySceneId
            ? `场景 #${record.ontologySceneId}`
            : '未配置')
      },
      {
        title: '对象类型',
        dataIndex: 'objectTypeSummary',
        width: 160,
        render: (value?: string) => value || '-'
      },
      {
        title: '实例范围',
        dataIndex: 'instanceSummary',
        width: 140,
        render: (value?: string) => value || '-'
      },
      {
        title: '发现算法',
        dataIndex: 'algorithm',
        width: 110,
        render: (algorithm: ImplicitDiscoveryAlgorithm) => (
          <Tag size="small">
            {DISCOVERY_ALGORITHM_LABEL[algorithm] || algorithm}
          </Tag>
        )
      },
      {
        title: '发现内容数',
        dataIndex: 'discoveryCount',
        width: 100
      },
      {
        title: '更新时间',
        dataIndex: 'updatedAt',
        width: 170,
        render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss')
      },
      {
        title: '操作',
        dataIndex: 'operations',
        width: 210,
        fixed: 'right' as const,
        render: (_, record) => (
          <Space size={12}>
            <Button
              type="text"
              size="small"
              className="p-0"
              onClick={() => onViewDetail(record)}
            >
              详情
            </Button>
            <Button
              type="text"
              size="small"
              className="p-0"
              disabled={!record.discoveryCount}
              onClick={() => onAsk(record)}
            >
              问答
            </Button>
            <Popconfirm
              title="确认删除该关系挖掘任务？删除后不可恢复。"
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
    [deletingId, onAsk, onDelete, onViewDetail]
  );

  return columns;
};
