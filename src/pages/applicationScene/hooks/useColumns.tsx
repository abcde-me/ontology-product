import React, { useMemo } from 'react';
import { Button, Popconfirm, Space } from '@arco-design/web-react';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import dayjs from 'dayjs';
import type { ApplicationScenarioListItem } from '../types';

interface UseColumnsProps {
  onViewDetail: (record: ApplicationScenarioListItem) => void;
  onDelete: (record: ApplicationScenarioListItem) => void;
  deletingId?: string;
}

export const useColumns = ({
  onViewDetail,
  onDelete,
  deletingId
}: UseColumnsProps) => {
  const columns: ColumnProps<ApplicationScenarioListItem>[] = useMemo(
    () => [
      {
        title: '场景名称',
        dataIndex: 'name',
        width: 200
      },
      {
        title: '关联图谱',
        dataIndex: 'ontologySceneName',
        width: 180,
        render: (value?: string, record?: ApplicationScenarioListItem) =>
          value ||
          (record?.ontologySceneId
            ? `场景 #${record.ontologySceneId}`
            : '未配置')
      },
      {
        title: '规则数',
        dataIndex: 'ruleCount',
        width: 90
      },
      {
        title: '更新时间',
        dataIndex: 'updatedAt',
        width: 180,
        render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss')
      },
      {
        title: '操作',
        dataIndex: 'operations',
        width: 160,
        fixed: 'right' as const,
        render: (_, record) => (
          <Space size={12}>
            <Button
              type="text"
              size="small"
              className="p-0"
              onClick={() => onViewDetail(record)}
            >
              查看详情
            </Button>
            <Popconfirm
              title="确认删除该应用场景？删除后不可恢复。"
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
    [deletingId, onDelete, onViewDetail]
  );

  return columns;
};
