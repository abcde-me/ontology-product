import React, { useMemo } from 'react';
import { Button, Popconfirm, Space, Tag } from '@arco-design/web-react';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import dayjs from 'dayjs';
import type { OntologyApiListItem } from '../types';
import { ApiAuthorizationListCell } from '../components/ApiAuthorizationListCell';
import { ApiStatusTag } from '../components/ApiStatusTag';
import styles from '../index.module.scss';

interface UseColumnsProps {
  onViewDetail: (record: OntologyApiListItem) => void;
  onTest: (record: OntologyApiListItem) => void;
  onViewAuthorization: (record: OntologyApiListItem) => void;
  onAuthorize: (record: OntologyApiListItem) => void;
  onPublish: (record: OntologyApiListItem) => void;
  onOnline: (record: OntologyApiListItem) => void;
  onOffline: (record: OntologyApiListItem) => void;
  onDelete: (record: OntologyApiListItem) => void;
  togglingId?: string;
  publishingId?: string;
  deletingId?: string;
}

export const useColumns = ({
  onViewDetail,
  onTest,
  onViewAuthorization,
  onAuthorize,
  onPublish,
  onOnline,
  onOffline,
  onDelete,
  togglingId,
  publishingId,
  deletingId
}: UseColumnsProps) => {
  const columns: ColumnProps<OntologyApiListItem>[] = useMemo(
    () => [
      {
        title: 'API 编号',
        dataIndex: 'code',
        width: 118,
        render: (code: string) => (
          <span className={styles['table-code-cell']}>{code}</span>
        )
      },
      {
        title: '接口名称',
        dataIndex: 'name',
        width: 180
      },
      {
        title: '分类',
        dataIndex: 'category',
        width: 120
      },
      {
        title: '方法',
        dataIndex: 'method',
        width: 90
      },
      {
        title: 'Path',
        dataIndex: 'path',
        width: 320,
        render: (_, record) => (
          <span className="font-mono text-[12px]">{record.path}</span>
        )
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 88,
        render: (status, record) => (
          <Space size={4}>
            <ApiStatusTag status={status} />
            {record.hasDraftChanges && record.status !== 'editing' && (
              <Tag color="orange" bordered size="small">
                草稿
              </Tag>
            )}
          </Space>
        )
      },
      {
        title: '授权列表',
        dataIndex: 'authorizationCount',
        width: 100,
        render: (_, record) => (
          <ApiAuthorizationListCell
            apiId={record.id}
            onClick={() => onViewAuthorization(record)}
          />
        )
      },
      {
        title: '发布时间',
        dataIndex: 'publishedAt',
        width: 170,
        render: (time?: string) =>
          time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
      },
      {
        title: '操作',
        dataIndex: 'operations',
        width: 380,
        fixed: 'right' as const,
        render: (_, record) => {
          const canDelete =
            record.status === 'offline' || record.status === 'editing';

          return (
            <Space size={12}>
              <Button
                type="text"
                size="small"
                className="p-0"
                onClick={() => onViewDetail(record)}
              >
                查看详情
              </Button>
              <Button
                type="text"
                size="small"
                className="p-0"
                onClick={() => onTest(record)}
              >
                测试
              </Button>
              <Button
                type="text"
                size="small"
                className="p-0"
                onClick={() => onAuthorize(record)}
              >
                授权
              </Button>
              {record.status === 'editing' && (
                <Popconfirm
                  title="确认发布？发布后将覆盖线上版本，状态变为已上线。"
                  onOk={() => onPublish(record)}
                >
                  <Button
                    type="text"
                    size="small"
                    className="p-0"
                    loading={publishingId === record.id}
                  >
                    发布
                  </Button>
                </Popconfirm>
              )}
              {record.status === 'offline' && (
                <Popconfirm
                  title="确认上线该 API？"
                  onOk={() => onOnline(record)}
                >
                  <Button
                    type="text"
                    size="small"
                    className="p-0"
                    loading={togglingId === record.id}
                  >
                    上线
                  </Button>
                </Popconfirm>
              )}
              {record.status === 'online' && (
                <Popconfirm
                  title="确认下线该 API？"
                  onOk={() => onOffline(record)}
                >
                  <Button
                    type="text"
                    size="small"
                    className="p-0"
                    status="warning"
                    loading={togglingId === record.id}
                  >
                    下线
                  </Button>
                </Popconfirm>
              )}
              {canDelete ? (
                <Popconfirm
                  title={
                    record.isCustom
                      ? '确认删除该 API？删除后不可恢复。'
                      : '确认删除该 API 的自定义配置？将恢复为默认配置。'
                  }
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
              ) : (
                <Button type="text" size="small" className="p-0" disabled>
                  删除
                </Button>
              )}
            </Space>
          );
        }
      }
    ],
    [
      deletingId,
      onAuthorize,
      onViewAuthorization,
      onDelete,
      onOffline,
      onOnline,
      onPublish,
      onTest,
      onViewDetail,
      publishingId,
      togglingId
    ]
  );

  return columns;
};
