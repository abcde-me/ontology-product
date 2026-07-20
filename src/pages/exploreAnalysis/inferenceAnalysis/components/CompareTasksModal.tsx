import React, { useMemo } from 'react';
import { Modal, Table, Tag } from '@arco-design/web-react';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import dayjs from 'dayjs';
import {
  INFERENCE_STATUS_COLOR,
  INFERENCE_STATUS_LABEL,
  resolveInferenceTypeLabel
} from '../constants';
import type { InferenceAnalysisTaskListItem } from '../types';
import styles from '../index.module.scss';

interface CompareField {
  key: string;
  label: string;
  getValue: (task: InferenceAnalysisTaskListItem) => string;
  render?: (task: InferenceAnalysisTaskListItem) => React.ReactNode;
}

interface CompareTasksModalProps {
  visible: boolean;
  tasks: InferenceAnalysisTaskListItem[];
  onCancel: () => void;
}

const COMPARE_FIELDS: CompareField[] = [
  {
    key: 'name',
    label: '任务名称',
    getValue: (task) => task.name || '-'
  },
  {
    key: 'description',
    label: '任务描述',
    getValue: (task) => task.description?.trim() || '-'
  },
  {
    key: 'inferenceType',
    label: '推理类型',
    getValue: (task) => resolveInferenceTypeLabel(task.inferenceType) || '-',
    render: (task) => resolveInferenceTypeLabel(task.inferenceType) || '-'
  },
  {
    key: 'status',
    label: '任务状态',
    getValue: (task) => INFERENCE_STATUS_LABEL[task.status] || '-',
    render: (task) => (
      <Tag color={INFERENCE_STATUS_COLOR[task.status]}>
        {INFERENCE_STATUS_LABEL[task.status] || '-'}
      </Tag>
    )
  },
  {
    key: 'ontologyScene',
    label: '本体场景',
    getValue: (task) =>
      task.ontologySceneNames && task.ontologySceneNames.length > 0
        ? task.ontologySceneNames.join('、')
        : task.ontologySceneIds && task.ontologySceneIds.length > 0
          ? task.ontologySceneIds.map((id) => `场景 #${id}`).join('、')
          : '-'
  },
  {
    key: 'semanticMapping',
    label: '语义映射',
    getValue: (task) =>
      task.semanticMappingNames && task.semanticMappingNames.length > 0
        ? task.semanticMappingNames.join('、')
        : '-'
  },
  {
    key: 'domainAxiom',
    label: '领域公理',
    getValue: (task) =>
      task.domainAxiomNames && task.domainAxiomNames.length > 0
        ? task.domainAxiomNames.join('、')
        : '-'
  },
  {
    key: 'resultContent',
    label: '推理结果内容',
    getValue: (task) => task.resultContent?.trim() || '-'
  },
  {
    key: 'creator',
    label: '创建人',
    getValue: (task) => task.creator || '-'
  },
  {
    key: 'createdAt',
    label: '创建时间',
    getValue: (task) =>
      task.createdAt ? dayjs(task.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'
  }
];

interface CompareRow {
  key: string;
  label: string;
  values: string[];
  nodes: React.ReactNode[];
  hasDiff: boolean;
}

export default function CompareTasksModal({
  visible,
  tasks,
  onCancel
}: CompareTasksModalProps) {
  const rows: CompareRow[] = useMemo(
    () =>
      COMPARE_FIELDS.map((field) => {
        const values = tasks.map((task) => field.getValue(task));
        const uniqueValues = new Set(values);
        return {
          key: field.key,
          label: field.label,
          values,
          nodes: tasks.map((task) =>
            field.render ? field.render(task) : field.getValue(task)
          ),
          hasDiff: uniqueValues.size > 1
        };
      }),
    [tasks]
  );

  const columns: ColumnProps<CompareRow>[] = useMemo(() => {
    const base: ColumnProps<CompareRow>[] = [
      {
        title: '对比项',
        dataIndex: 'label',
        width: 140,
        fixed: 'left' as const,
        render: (value: string, record) => (
          <span
            className={record.hasDiff ? styles.compareFieldDiff : undefined}
          >
            {value}
            {record.hasDiff ? (
              <span className={styles.compareDiffBadge}>差异</span>
            ) : null}
          </span>
        )
      }
    ];

    tasks.forEach((task, index) => {
      base.push({
        title: task.name || `任务 ${index + 1}`,
        dataIndex: `task_${task.id}`,
        width: 220,
        render: (_, record) => (
          <div
            className={
              record.hasDiff ? styles.compareCellDiff : styles.compareCellSame
            }
          >
            <div className={styles.compareCellContent}>
              {record.nodes[index]}
            </div>
          </div>
        )
      });
    });

    return base;
  }, [tasks]);

  return (
    <Modal
      title="推理任务比对"
      visible={visible}
      onCancel={onCancel}
      footer={null}
      style={{ width: Math.min(420 + tasks.length * 240, 1100) }}
      unmountOnExit
    >
      <div className={styles.compareHint}>
        已选 {tasks.length}{' '}
        个任务；标有「差异」的行表示各任务参数或结果不一致，差异内容已高亮显示。
      </div>
      <Table
        rowKey="key"
        columns={columns}
        data={rows}
        pagination={false}
        border
        scroll={{ x: 140 + tasks.length * 220 }}
      />
    </Modal>
  );
}
