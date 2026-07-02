import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState
} from 'react';
import {
  Button,
  Message,
  Popconfirm,
  Space,
  Switch,
  Table,
  Tag,
  Typography
} from '@arco-design/web-react';
import type {
  InferenceRule,
  InferenceRuleCategory,
  ImplicitRelationKnowledge
} from '../types';
import { INFERENCE_RULE_CATEGORY_OPTIONS } from '../constants';
import {
  deleteInferenceRule,
  getImplicitRelationKnowledge,
  upsertInferenceRule
} from '../services/implicitRelationStore';
import { resolveRuleDescription } from '../services/ruleDescription';
import InferenceRuleFormModal from './InferenceRuleFormModal';
import styles from './InferenceRulePanel.module.scss';

const { Text } = Typography;

interface InferenceRulePanelProps {
  taskId: string;
  sceneId?: number;
  knowledge: ImplicitRelationKnowledge;
  onChange: (knowledge: ImplicitRelationKnowledge) => void;
  onOpenTest?: (ruleId?: string) => void;
}

export interface InferenceRulePanelHandle {
  openCreate: () => void;
}

const categoryLabel = (category: InferenceRuleCategory) =>
  INFERENCE_RULE_CATEGORY_OPTIONS.find((item) => item.value === category)
    ?.label || category;

const InferenceRulePanel = forwardRef<
  InferenceRulePanelHandle,
  InferenceRulePanelProps
>(function InferenceRulePanel(
  { taskId, sceneId, knowledge, onChange, onOpenTest },
  ref
) {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingRule, setEditingRule] = useState<InferenceRule | null>(null);
  const [saving, setSaving] = useState(false);

  const rules = knowledge.inferenceRules;

  const refreshKnowledge = () => {
    onChange(getImplicitRelationKnowledge(taskId));
  };

  const handleOpenCreate = () => {
    setModalMode('create');
    setEditingRule(null);
    setModalVisible(true);
  };

  useImperativeHandle(ref, () => ({
    openCreate: handleOpenCreate
  }));

  const handleOpenEdit = (rule: InferenceRule) => {
    setModalMode('edit');
    setEditingRule(rule);
    setModalVisible(true);
  };

  const handleDeleteRule = (ruleId: string) => {
    deleteInferenceRule(taskId, ruleId);
    refreshKnowledge();
    Message.success('已删除规则');
  };

  const handleSaveRule = (values: InferenceRule) => {
    setSaving(true);
    try {
      const nextRule: InferenceRule = {
        ...values,
        enabled: modalMode === 'create' ? true : values.enabled,
        sceneId: sceneId ?? values.sceneId,
        updatedAt: new Date().toISOString()
      };
      upsertInferenceRule(taskId, nextRule);
      refreshKnowledge();
      setModalVisible(false);
      setEditingRule(null);
      Message.success(modalMode === 'create' ? '规则已生成' : '规则已保存');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEnabled = useCallback(
    (rule: InferenceRule, enabled: boolean) => {
      upsertInferenceRule(taskId, {
        ...rule,
        enabled,
        updatedAt: new Date().toISOString()
      });
      onChange(getImplicitRelationKnowledge(taskId));
    },
    [taskId, onChange]
  );

  const listColumns = useMemo(
    () => [
      {
        title: '规则类型',
        dataIndex: 'category',
        width: 180,
        render: (category: InferenceRuleCategory) => (
          <Tag size="small">{categoryLabel(category)}</Tag>
        )
      },
      {
        title: '规则描述',
        dataIndex: 'description',
        ellipsis: true,
        render: (_: string, record: InferenceRule) => (
          <Text ellipsis={{ showTooltip: true }}>
            {resolveRuleDescription(record)}
          </Text>
        )
      },
      {
        title: '启用',
        dataIndex: 'enabled',
        width: 72,
        render: (enabled: boolean, record: InferenceRule) => (
          <Switch
            size="small"
            checked={enabled}
            onChange={(checked) => handleToggleEnabled(record, checked)}
          />
        )
      },
      {
        title: '操作',
        width: 160,
        render: (_: unknown, record: InferenceRule) => (
          <Space>
            <Button
              type="text"
              size="mini"
              onClick={() => onOpenTest?.(record.id)}
            >
              测试
            </Button>
            <Button
              type="text"
              size="mini"
              onClick={() => handleOpenEdit(record)}
            >
              编辑
            </Button>
            <Popconfirm
              title="确认删除该规则？"
              onOk={() => handleDeleteRule(record.id)}
            >
              <Button type="text" size="mini" status="danger">
                删除
              </Button>
            </Popconfirm>
          </Space>
        )
      }
    ],
    [handleToggleEnabled, onOpenTest]
  );

  return (
    <div className={styles.container}>
      <div className={styles.panel}>
        <div className={styles.panelBody}>
          <Table
            rowKey="id"
            size="small"
            columns={listColumns}
            data={rules}
            pagination={false}
            scroll={{ y: 'calc(100vh - 420px)' }}
            noDataElement="暂无推理规则，点击上方新增规则"
          />
        </div>
      </div>

      <InferenceRuleFormModal
        visible={modalVisible}
        saving={saving}
        mode={modalMode}
        rule={editingRule}
        sceneId={sceneId}
        onCancel={() => {
          setModalVisible(false);
          setEditingRule(null);
        }}
        onSubmit={handleSaveRule}
      />
    </div>
  );
});

export default InferenceRulePanel;
