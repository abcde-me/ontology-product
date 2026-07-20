import React, { useMemo } from 'react';
import { Message, Modal, Table, Tag, Typography } from '@arco-design/web-react';
import { DISCOVERY_ALGORITHM_LABEL } from '../constants';
import { attachDiscoveriesToOntology } from '../services/attachDiscoveriesToOntology';
import type {
  DiscoveredImplicitRelation,
  ImplicitRelationTask
} from '../types';
import styles from './AddToInstanceModal.module.scss';

interface AddToOntologyModalProps {
  visible: boolean;
  task: ImplicitRelationTask;
  discoveries: DiscoveredImplicitRelation[];
  onCancel: () => void;
  onSuccess: () => void;
}

interface OntologyPreviewRow {
  id: string;
  sourceObjectTypeId?: number;
  targetObjectTypeId?: number;
  sourceObjectTypeName: string;
  targetObjectTypeName: string;
  suggestedName: string;
  algorithm: DiscoveredImplicitRelation['algorithm'];
  confidence: number;
}

export default function AddToOntologyModal({
  visible,
  task,
  discoveries,
  onCancel,
  onSuccess
}: AddToOntologyModalProps) {
  const [saving, setSaving] = React.useState(false);

  const objectTypeNameMap = useMemo(() => {
    const map: Record<number, string> = {};
    task.scope?.objectTypes.forEach((item) => {
      if (item.id == null) {
        return;
      }
      map[item.id] = item.name || item.code || `类型 #${item.id}`;
    });
    return map;
  }, [task.scope?.objectTypes]);

  const previewRows = useMemo(() => {
    const seen = new Set<string>();
    const rows: OntologyPreviewRow[] = [];

    discoveries.forEach((item) => {
      if (item.sourceObjectTypeId == null || item.targetObjectTypeId == null) {
        return;
      }

      const key = `${item.sourceObjectTypeId}|${item.targetObjectTypeId}|${item.suggestedName.trim().toLowerCase()}`;
      if (seen.has(key)) {
        return;
      }
      seen.add(key);

      rows.push({
        id: key,
        sourceObjectTypeId: item.sourceObjectTypeId,
        targetObjectTypeId: item.targetObjectTypeId,
        sourceObjectTypeName:
          objectTypeNameMap[item.sourceObjectTypeId] ||
          item.sourceNodeName ||
          `类型 #${item.sourceObjectTypeId}`,
        targetObjectTypeName:
          objectTypeNameMap[item.targetObjectTypeId] ||
          item.targetNodeName ||
          `类型 #${item.targetObjectTypeId}`,
        suggestedName: item.suggestedName,
        algorithm: item.algorithm,
        confidence: item.confidence
      });
    });

    return rows;
  }, [discoveries, objectTypeNameMap]);

  const invalidCount = useMemo(
    () =>
      discoveries.filter(
        (item) =>
          item.sourceObjectTypeId == null ||
          item.targetObjectTypeId == null ||
          !item.suggestedName.trim()
      ).length,
    [discoveries]
  );

  const handleOk = async () => {
    if (!task.scope?.ontologySceneId) {
      Message.warning('任务未绑定本体场景');
      return;
    }
    if (!discoveries.length) {
      Message.warning('请先选择要添加的关系');
      return;
    }
    if (!previewRows.length) {
      Message.warning('所选关系缺少对象类型信息，无法添加到本体');
      return;
    }

    setSaving(true);
    try {
      const result = await attachDiscoveriesToOntology({
        sceneId: task.scope.ontologySceneId,
        taskName: task.name,
        discoveries
      });

      if (result.createdCount === 0) {
        Message.warning(
          result.failedCount > 0
            ? '未能创建链接类型，请稍后重试'
            : '所选关系对应的本体链接已存在或缺少对象类型，未写入新记录'
        );
        return;
      }

      Message.success(
        `已在本体中创建 ${result.createdCount} 个链接类型` +
          (result.skippedCount ? `（跳过 ${result.skippedCount} 条）` : '') +
          (result.failedCount ? `（失败 ${result.failedCount} 条）` : '')
      );
      onSuccess();
    } catch (error) {
      Message.error(error instanceof Error ? error.message : '添加失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="添加到本体"
      visible={visible}
      confirmLoading={saving}
      onCancel={onCancel}
      onOk={() => void handleOk()}
      okText="确认添加"
      unmountOnExit
      style={{ width: 760 }}
    >
      <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
        将选中的挖掘关系建模为本体链接类型（对象类型之间的链接）。添加后可在「本体场景
        → 链接类型」中查看与编辑。
      </Typography.Paragraph>

      {invalidCount > 0 ? (
        <div className={styles.warn}>
          有 {invalidCount} 条关系缺少对象类型信息，将被跳过。
        </div>
      ) : null}

      <Table
        rowKey="id"
        size="small"
        pagination={false}
        scroll={{ y: 280 }}
        data={previewRows}
        columns={[
          {
            title: '源对象类型',
            dataIndex: 'sourceObjectTypeName',
            width: 140
          },
          {
            title: '目标对象类型',
            dataIndex: 'targetObjectTypeName',
            width: 140
          },
          {
            title: '链接名称',
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
