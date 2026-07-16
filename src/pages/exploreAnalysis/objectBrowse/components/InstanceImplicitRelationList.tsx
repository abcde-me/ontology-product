import React, { useMemo } from 'react';
import { Button, Popconfirm, Table, Typography } from '@arco-design/web-react';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import dayjs from 'dayjs';
import { useHistory } from 'react-router-dom';
import type { AttachedImplicitRelation } from '@/pages/exploreAnalysis/implicitRelation/services/attachedRelationStore';
import { DISCOVERY_ALGORITHM_LABEL } from '@/pages/exploreAnalysis/implicitRelation/constants';
import { buildImplicitRelationDetailPath } from '../utils/implicitRelationNavigation';
import styles from './InstanceImplicitRelationList.module.scss';

interface InstanceImplicitRelationListProps {
  data: AttachedImplicitRelation[];
  variant?: 'embedded' | 'fullscreen';
  onRemove?: (attachId: string) => void;
}

const formatDateTime = (value?: string) => {
  if (!value) {
    return '-';
  }
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD HH:mm') : value;
};

const buildRelationDetail = (item: AttachedImplicitRelation) => {
  const currentLabel = item.instanceLabel || item.instanceId;
  const peerLabel = item.peerInstanceLabel || item.peerInstanceId;
  const directionSymbol = item.direction === 'out' ? '→' : '←';
  const pairText = `${currentLabel} ${directionSymbol} ${peerLabel}`;
  const metaParts = [
    `置信度 ${(item.confidence * 100).toFixed(0)}%`,
    DISCOVERY_ALGORITHM_LABEL[item.algorithm] || item.algorithm
  ];

  if (item.evidenceTitles?.length) {
    metaParts.push(`证据：${item.evidenceTitles.join('；')}`);
  }

  return {
    pairText,
    metaText: metaParts.join(' · ')
  };
};

export const InstanceImplicitRelationList: React.FC<
  InstanceImplicitRelationListProps
> = ({ data, variant = 'embedded', onRemove }) => {
  const history = useHistory();

  const handleNavigate = (item: AttachedImplicitRelation) => {
    history.push(
      buildImplicitRelationDetailPath(item.taskId, item.discoveryId)
    );
  };

  const columns = useMemo<ColumnProps<AttachedImplicitRelation>[]>(
    () => [
      {
        title: '关系名称',
        dataIndex: 'suggestedName',
        width: 120,
        ellipsis: true,
        render: (value: string) => (
          <Typography.Text className={styles.relationName}>
            {value || '-'}
          </Typography.Text>
        )
      },
      {
        title: '关系明细',
        dataIndex: 'attachId',
        ellipsis: true,
        render: (_: unknown, record) => {
          const detail = buildRelationDetail(record);
          return (
            <div className={styles.detailCell}>
              <div className={styles.detailPair} title={detail.pairText}>
                {detail.pairText}
              </div>
              <div className={styles.detailMeta} title={detail.metaText}>
                {detail.metaText}
              </div>
            </div>
          );
        }
      },
      {
        title: '发现时间',
        dataIndex: 'discoveredAt',
        width: 148,
        render: (_: unknown, record) =>
          formatDateTime(record.discoveredAt || record.attachedAt)
      },
      {
        title: '来源',
        dataIndex: 'taskName',
        width: 120,
        ellipsis: true,
        render: (_: unknown, record) => record.taskName || record.taskId || '-'
      },
      ...(onRemove
        ? [
            {
              title: '操作',
              dataIndex: 'operation',
              width: 72,
              fixed: 'right' as const,
              render: (_: unknown, record: AttachedImplicitRelation) => (
                <Popconfirm
                  title="确认移除此隐性关系挂接？"
                  onOk={() => onRemove(record.attachId)}
                >
                  <Button
                    type="text"
                    size="mini"
                    status="danger"
                    onClick={(event) => event.stopPropagation()}
                  >
                    移除
                  </Button>
                </Popconfirm>
              )
            }
          ]
        : [])
    ],
    [onRemove]
  );

  return (
    <Table
      className={
        variant === 'fullscreen' ? styles.tableFullscreen : styles.tableEmbedded
      }
      rowKey="attachId"
      columns={columns}
      data={data}
      pagination={false}
      border={{ wrapper: true, cell: true }}
      scroll={
        variant === 'fullscreen'
          ? { x: 960, y: 'calc(100vh - 120px)' }
          : { x: 720, y: 280 }
      }
      onRow={(record) => ({
        onClick: () => handleNavigate(record),
        className: styles.clickableRow
      })}
    />
  );
};
