import React, { useMemo } from 'react';
import { Button, Popconfirm, Space, Tag } from '@arco-design/web-react';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import dayjs from 'dayjs';
import {
  INFERENCE_STATUS_COLOR,
  INFERENCE_STATUS_LABEL,
  INFERENCE_TYPE_LABEL
} from '../constants';
import type {
  InferenceAnalysisTaskListItem,
  InferenceTaskStatus,
  InferenceType
} from '../types';
import styles from '../index.module.scss';

interface UseColumnsProps {
  onViewDetail: (record: InferenceAnalysisTaskListItem) => void;
  onCopy: (record: InferenceAnalysisTaskListItem) => void;
  onRerun: (record: InferenceAnalysisTaskListItem) => void;
  onDelete: (record: InferenceAnalysisTaskListItem) => void;
  onViewSemanticMappings: (record: InferenceAnalysisTaskListItem) => void;
  onViewDomainAxioms: (record: InferenceAnalysisTaskListItem) => void;
  deletingId?: string;
  rerunningId?: string;
}

export const useColumns = ({
  onViewDetail,
  onCopy,
  onRerun,
  onDelete,
  onViewSemanticMappings,
  onViewDomainAxioms,
  deletingId,
  rerunningId
}: UseColumnsProps) => {
  const columns: ColumnProps<InferenceAnalysisTaskListItem>[] = useMemo(
    () => [
      {
        title: '推理任务名称',
        dataIndex: 'name',
        width: 180,
        ellipsis: true
      },
      {
        title: '任务描述',
        dataIndex: 'description',
        width: 180,
        ellipsis: true,
        render: (value?: string) => value || '-'
      },
      {
        title: '推理类型',
        dataIndex: 'inferenceType',
        width: 110,
        render: (value: InferenceType) => INFERENCE_TYPE_LABEL[value] || '-'
      },
      {
        title: '任务状态',
        dataIndex: 'status',
        width: 100,
        render: (value: InferenceTaskStatus) => (
          <Tag color={INFERENCE_STATUS_COLOR[value]}>
            {INFERENCE_STATUS_LABEL[value] || '-'}
          </Tag>
        )
      },
      {
        title: '本体场景',
        dataIndex: 'ontologySceneNames',
        width: 160,
        ellipsis: true,
        render: (value?: string[]) =>
          value && value.length > 0 ? value.join('、') : '-'
      },
      {
        title: '语义映射',
        dataIndex: 'semanticMappingNames',
        width: 160,
        ellipsis: true,
        render: (value?: string[], record?: InferenceAnalysisTaskListItem) => {
          if (!value?.length || !record) {
            return '-';
          }
          return (
            <button
              type="button"
              className={styles.clickableCell}
              title="点击查看语义映射详情"
              onClick={(event) => {
                event.stopPropagation();
                onViewSemanticMappings(record);
              }}
            >
              {value.join('、')}
            </button>
          );
        }
      },
      {
        title: '领域公理',
        dataIndex: 'domainAxiomNames',
        width: 160,
        ellipsis: true,
        render: (value?: string[], record?: InferenceAnalysisTaskListItem) => {
          if (!value?.length || !record) {
            return '-';
          }
          return (
            <button
              type="button"
              className={styles.clickableCell}
              title="点击查看领域公理详情"
              onClick={(event) => {
                event.stopPropagation();
                onViewDomainAxioms(record);
              }}
            >
              {value.join('、')}
            </button>
          );
        }
      },
      {
        title: '推理结果内容',
        dataIndex: 'resultContent',
        width: 200,
        ellipsis: true,
        render: (value?: string) => value || '-'
      },
      {
        title: '创建人',
        dataIndex: 'creator',
        width: 100,
        render: (value?: string) => value || '-'
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        width: 170,
        render: (time: string) =>
          time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
      },
      {
        title: '操作',
        dataIndex: 'operations',
        width: 220,
        fixed: 'right' as const,
        render: (_, record) => (
          <Space size={8}>
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
              onClick={() => onCopy(record)}
            >
              复制
            </Button>
            {record.status === 'completed' ? (
              <Popconfirm
                title="确认重新推理？将覆盖现有推理结果、路径与节点结论。"
                onOk={() => onRerun(record)}
              >
                <Button
                  type="text"
                  size="small"
                  className="p-0"
                  loading={rerunningId === record.id}
                  disabled={Boolean(rerunningId) && rerunningId !== record.id}
                >
                  重推
                </Button>
              </Popconfirm>
            ) : null}
            <Popconfirm
              title="确认删除该推理任务？删除后不可恢复。"
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
    [
      deletingId,
      onCopy,
      onDelete,
      onRerun,
      onViewDetail,
      onViewDomainAxioms,
      onViewSemanticMappings,
      rerunningId
    ]
  );

  return columns;
};
