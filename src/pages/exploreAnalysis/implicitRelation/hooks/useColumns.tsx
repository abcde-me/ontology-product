import React, { useMemo } from 'react';
import { Button, Popconfirm, Space } from '@arco-design/web-react';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import dayjs from 'dayjs';
import type { ImplicitRelationTaskListItem } from '../types';

interface UseColumnsProps {
  onViewDetail: (record: ImplicitRelationTaskListItem) => void;
  onDelete: (record: ImplicitRelationTaskListItem) => void;
  deletingId?: string;
}

export const useColumns = ({
  onViewDetail,
  onDelete,
  deletingId
}: UseColumnsProps) => {
  const columns: ColumnProps<ImplicitRelationTaskListItem>[] = useMemo(
    () => [
      {
        title: '任务名称',
        dataIndex: 'name',
        width: 200
      },
      {
        title: '关联图谱',
        dataIndex: 'ontologySceneName',
        width: 180,
        render: (value?: string, record?: ImplicitRelationTaskListItem) =>
          value ||
          (record?.ontologySceneId
            ? `场景 #${record.ontologySceneId}`
            : '未配置')
      },
      {
        title: '补充链接/关系',
        dataIndex: 'richRelationCount',
        width: 100
      },
      {
        title: '推理规则',
        dataIndex: 'ruleCount',
        width: 100
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
              title="确认删除该隐性关系任务？删除后不可恢复。"
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
