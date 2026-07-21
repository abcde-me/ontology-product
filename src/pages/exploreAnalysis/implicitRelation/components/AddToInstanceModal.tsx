import React, { useEffect, useMemo, useState } from 'react';
import {
  Message,
  Modal,
  Radio,
  Table,
  Tag,
  Typography
} from '@arco-design/web-react';
import { DISCOVERY_ALGORITHM_LABEL } from '../constants';
import type {
  DiscoveredImplicitRelation,
  ImplicitRelationTask
} from '../types';
import {
  attachDiscoveriesToInstances,
  type AttachDiscoveriesInput
} from '../services/attachedRelationStore';
import styles from './AddToInstanceModal.module.scss';

interface AddToInstanceModalProps {
  visible: boolean;
  task: ImplicitRelationTask;
  discoveries: DiscoveredImplicitRelation[];
  onCancel: () => void;
  onSuccess: () => void;
}

export default function AddToInstanceModal({
  visible,
  task,
  discoveries,
  onCancel,
  onSuccess
}: AddToInstanceModalProps) {
  const [endpoints, setEndpoints] =
    useState<NonNullable<AttachDiscoveriesInput['endpoints']>>('both');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setEndpoints('both');
    }
  }, [visible]);

  const invalidCount = useMemo(
    () =>
      discoveries.filter(
        (item) =>
          item.sourceObjectTypeId == null ||
          !item.sourceInstanceId ||
          item.targetObjectTypeId == null ||
          !item.targetInstanceId
      ).length,
    [discoveries]
  );

  const handleOk = () => {
    if (!task.scope?.ontologySceneId) {
      Message.warning('任务未绑定本体场景');
      return false;
    }
    if (!discoveries.length) {
      Message.warning('请先选择要添加的关系');
      return false;
    }
    if (invalidCount === discoveries.length) {
      Message.error('添加失败：所选关系均缺少实例端点信息');
      return false;
    }

    setSaving(true);
    try {
      const result = attachDiscoveriesToInstances({
        taskId: task.id,
        taskName: task.name,
        sceneId: task.scope.ontologySceneId,
        discoveries,
        endpoints
      });

      if (result.attachedCount === 0) {
        Message.error(
          result.skippedCount > 0
            ? '添加失败：所选关系均已添加或缺少实例端点信息'
            : '添加失败：未能添加任何关系'
        );
        return false;
      }

      Message.success(
        `添加成功：已添加 ${result.attachedCount} 条隐式关系到 ${result.instanceCount} 个实例` +
          (result.skippedCount ? `，跳过 ${result.skippedCount} 条` : '')
      );
      onSuccess();
      return true;
    } catch (error) {
      Message.error(
        error instanceof Error ? error.message : '添加失败，请稍后重试'
      );
      return false;
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="添加到实例"
      visible={visible}
      confirmLoading={saving}
      onCancel={onCancel}
      onOk={() => handleOk()}
      okText="确认添加"
      unmountOnExit
      style={{ width: 720 }}
    >
      <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
        将选中的挖掘关系挂接到对应实例。添加后可在「对象浏览 →
        明细」中查看隐式关系。
      </Typography.Paragraph>

      <div className={styles.field}>
        <div className={styles.label}>挂接端点</div>
        <Radio.Group
          value={endpoints}
          onChange={(value) =>
            setEndpoints(
              value as NonNullable<AttachDiscoveriesInput['endpoints']>
            )
          }
        >
          <Radio value="both">两端实例（推荐）</Radio>
          <Radio value="source">仅源实例</Radio>
          <Radio value="target">仅目标实例</Radio>
        </Radio.Group>
      </div>

      {invalidCount > 0 ? (
        <div className={styles.warn}>
          有 {invalidCount} 条关系缺少实例端点信息，将被跳过。
        </div>
      ) : null}

      <Table
        rowKey="id"
        size="small"
        pagination={false}
        scroll={{ y: 280 }}
        data={discoveries}
        columns={[
          {
            title: '源实例',
            dataIndex: 'sourceNodeName',
            width: 140
          },
          {
            title: '目标实例',
            dataIndex: 'targetNodeName',
            width: 140
          },
          {
            title: '关系',
            dataIndex: 'suggestedName',
            width: 120
          },
          {
            title: '算法',
            dataIndex: 'algorithm',
            width: 100,
            render: (algorithm: DiscoveredImplicitRelation['algorithm']) => (
              <Tag size="small">
                {DISCOVERY_ALGORITHM_LABEL[algorithm] || algorithm}
              </Tag>
            )
          },
          {
            title: '置信度',
            dataIndex: 'confidence',
            width: 80,
            render: (value: number) => value.toFixed(2)
          }
        ]}
      />
    </Modal>
  );
}
