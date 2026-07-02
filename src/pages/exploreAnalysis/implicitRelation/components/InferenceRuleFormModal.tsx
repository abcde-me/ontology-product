import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Select,
  Tooltip
} from '@arco-design/web-react';
import type { InferenceRule, InferenceRuleCategory } from '../types';
import {
  GRAPH_ALGORITHM_OPTIONS,
  INFERENCE_RULE_CATEGORY_OPTIONS
} from '../constants';
import styles from './InferenceRuleFormModal.module.scss';

const { TextArea } = Input;
const DEFAULT_CATEGORY: InferenceRuleCategory = 'rule';

interface InferenceRuleFormModalProps {
  visible: boolean;
  saving?: boolean;
  mode: 'create' | 'edit';
  rule: InferenceRule | null;
  sceneId?: number;
  onCancel: () => void;
  onSubmit: (values: InferenceRule) => void;
}

const defaultRuleName = (category: InferenceRuleCategory) => {
  const map: Record<InferenceRuleCategory, string> = {
    rule: '逻辑推理规则',
    graphAlgorithm: '图推理规则',
    llmCommonSense: '常识联想规则'
  };
  return map[category];
};

const createDraftRule = (
  category: InferenceRuleCategory,
  sceneId?: number
): InferenceRule => {
  const now = new Date().toISOString();
  return {
    id: `rule-${Date.now()}`,
    sceneId: sceneId ?? 0,
    name: defaultRuleName(category),
    category,
    enabled: true,
    condition: '',
    action: '',
    priority: 3,
    graphAlgorithm: 'neighbor-2',
    maxDepth: 2,
    prompt: '',
    description: '',
    createdAt: now,
    updatedAt: now
  };
};

export default function InferenceRuleFormModal({
  visible,
  saving,
  mode,
  rule,
  sceneId,
  onCancel,
  onSubmit
}: InferenceRuleFormModalProps) {
  const [form] = Form.useForm<InferenceRule>();
  const [selectedCategory, setSelectedCategory] =
    useState<InferenceRuleCategory>(DEFAULT_CATEGORY);
  const [draftRule, setDraftRule] = useState<InferenceRule | null>(null);

  const applyCategory = (category: InferenceRuleCategory) => {
    setSelectedCategory(category);
    const nextDraft =
      mode === 'edit' && rule?.category === category
        ? rule
        : createDraftRule(category, sceneId);
    setDraftRule(nextDraft);
    form.setFieldsValue(nextDraft);
  };

  useEffect(() => {
    if (!visible) {
      setSelectedCategory(DEFAULT_CATEGORY);
      setDraftRule(null);
      form.resetFields();
      return;
    }

    if (mode === 'edit' && rule) {
      applyCategory(rule.category);
      return;
    }

    applyCategory(DEFAULT_CATEGORY);
  }, [form, mode, rule, visible, sceneId]);

  const handleOk = async () => {
    if (!draftRule) {
      return;
    }
    try {
      const values = await form.validate();
      onSubmit({
        ...draftRule,
        ...values,
        name: draftRule.name || defaultRuleName(selectedCategory),
        category: selectedCategory,
        priority: values.priority ?? draftRule.priority ?? 3,
        enabled: mode === 'create' ? true : draftRule.enabled,
        sceneId: sceneId ?? draftRule.sceneId
      });
    } catch {
      // validation failed
    }
  };

  const title = mode === 'create' ? '新增规则' : '编辑规则';

  return (
    <Modal
      title={title}
      visible={visible}
      confirmLoading={saving}
      onCancel={onCancel}
      onOk={() => void handleOk()}
      okText={mode === 'create' ? '生成规则' : '保存'}
      okButtonProps={{ type: 'outline' }}
      cancelButtonProps={{ type: 'outline' }}
      autoFocus={false}
      unmountOnExit
      style={{ width: 560 }}
    >
      <Radio.Group
        className={styles.methodGroup}
        value={selectedCategory}
        onChange={(value) => applyCategory(value as InferenceRuleCategory)}
      >
        {INFERENCE_RULE_CATEGORY_OPTIONS.map((item) => (
          <Tooltip key={item.value} content={item.description}>
            <Radio value={item.value} className={styles.methodRadio}>
              {item.label}
            </Radio>
          </Tooltip>
        ))}
      </Radio.Group>

      {draftRule && (
        <Form form={form} layout="vertical" className={styles.configForm}>
          {selectedCategory === 'rule' && (
            <>
              <Form.Item
                label="IF 条件"
                field="condition"
                rules={[{ required: true, message: '请输入 IF 条件' }]}
              >
                <TextArea
                  placeholder="例如：若存在 A→B 链接且不存在 B→A"
                  autoSize={{ minRows: 3, maxRows: 6 }}
                />
              </Form.Item>
              <Form.Item
                label="ELSE / 执行动作"
                field="action"
                rules={[{ required: true, message: '请输入执行动作' }]}
              >
                <TextArea
                  placeholder="例如：则推导 B→A 对称隐性关系"
                  autoSize={{ minRows: 3, maxRows: 6 }}
                />
              </Form.Item>
              <Form.Item label="优先级" field="priority">
                <InputNumber min={1} max={100} />
              </Form.Item>
            </>
          )}

          {selectedCategory === 'graphAlgorithm' && (
            <>
              <Form.Item
                label="图算法"
                field="graphAlgorithm"
                rules={[{ required: true, message: '请选择图算法' }]}
              >
                <Select options={GRAPH_ALGORITHM_OPTIONS} />
              </Form.Item>
              <Form.Item label="最大深度" field="maxDepth">
                <InputNumber min={1} max={5} />
              </Form.Item>
            </>
          )}

          {selectedCategory === 'llmCommonSense' && (
            <Form.Item
              label="常识联想提示词"
              field="prompt"
              rules={[{ required: true, message: '请输入提示词' }]}
            >
              <TextArea
                placeholder="描述大模型常识联想的推理方向与约束"
                autoSize={{ minRows: 4, maxRows: 8 }}
              />
            </Form.Item>
          )}
        </Form>
      )}
    </Modal>
  );
}
