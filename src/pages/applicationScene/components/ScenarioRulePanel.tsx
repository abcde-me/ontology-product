import React, { useMemo, useState } from 'react';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Message,
  Modal,
  Space,
  Switch,
  Table
} from '@arco-design/web-react';
import type { ApplicationScenarioRule } from '../types';
import {
  deleteApplicationScenarioRule,
  saveApplicationScenarioRule
} from '../services/storage';
import styles from '../index.module.scss';

const { TextArea } = Input;

const RULES_TABLE_SCROLL_X = 980;

interface ScenarioRulePanelProps {
  scenarioId: string;
  rules: ApplicationScenarioRule[];
  onChange: () => void;
}

export default function ScenarioRulePanel({
  scenarioId,
  rules,
  onChange
}: ScenarioRulePanelProps) {
  const [visible, setVisible] = useState(false);
  const [editingRule, setEditingRule] =
    useState<ApplicationScenarioRule | null>(null);
  const [form] = Form.useForm();

  const openCreateModal = () => {
    setEditingRule(null);
    form.resetFields();
    form.setFieldsValue({ priority: 50 });
    setVisible(true);
  };

  const openEditModal = (rule: ApplicationScenarioRule) => {
    setEditingRule(rule);
    form.setFieldsValue({
      name: rule.name,
      condition: rule.condition,
      action: rule.action,
      priority: rule.priority
    });
    setVisible(true);
  };

  const closeModal = () => {
    setVisible(false);
    setEditingRule(null);
    form.resetFields();
  };

  const columns = useMemo(
    () => [
      { title: '名称', dataIndex: 'name', width: 160, ellipsis: true },
      { title: '条件', dataIndex: 'condition', width: 260, ellipsis: true },
      { title: '动作', dataIndex: 'action', width: 260, ellipsis: true },
      { title: '优先级', dataIndex: 'priority', width: 80 },
      {
        title: '启用',
        dataIndex: 'enabled',
        width: 80,
        render: (enabled: boolean, record: ApplicationScenarioRule) => (
          <Switch
            size="small"
            checked={enabled}
            onChange={(checked) => {
              saveApplicationScenarioRule({
                ...record,
                enabled: checked,
                updatedAt: new Date().toISOString()
              });
              onChange();
            }}
          />
        )
      },
      {
        title: '操作',
        width: 120,
        render: (_: unknown, record: ApplicationScenarioRule) => (
          <Space size={4}>
            <Button
              type="text"
              size="mini"
              onClick={() => openEditModal(record)}
            >
              编辑
            </Button>
            <Button
              type="text"
              size="mini"
              status="danger"
              onClick={() => {
                deleteApplicationScenarioRule(scenarioId, record.id);
                Message.success('规则已删除');
                onChange();
              }}
            >
              删除
            </Button>
          </Space>
        )
      }
    ],
    [onChange, scenarioId]
  );

  const handleSubmit = (values: {
    name: string;
    condition: string;
    action: string;
    priority?: number;
  }) => {
    const now = new Date().toISOString();

    if (editingRule) {
      saveApplicationScenarioRule({
        ...editingRule,
        name: values.name.trim(),
        condition: values.condition.trim(),
        action: values.action.trim(),
        priority: values.priority ?? editingRule.priority,
        updatedAt: now
      });
      Message.success('规则已更新');
    } else {
      saveApplicationScenarioRule({
        id: `rule-${Date.now()}`,
        scenarioId,
        name: values.name.trim(),
        condition: values.condition.trim(),
        action: values.action.trim(),
        priority: values.priority ?? 50,
        enabled: true,
        createdAt: now,
        updatedAt: now
      });
      Message.success('规则已创建');
    }

    closeModal();
    onChange();
  };

  return (
    <div className={styles['rules-panel']}>
      <div className={styles['rules-section-header']}>
        <div className={styles['workspace-section-title']}>规则管理</div>
        <Button type="text" size="small" onClick={openCreateModal}>
          创建规则
        </Button>
      </div>

      <div className={styles['rules-scroll']}>
        <div className={styles['rules-table-box']}>
          <Table
            className={styles['rules-table']}
            rowKey="id"
            columns={columns}
            data={rules}
            pagination={false}
            size="small"
            tableLayoutFixed
            scroll={{ x: RULES_TABLE_SCROLL_X }}
            border={{
              wrapper: true,
              headerCell: true,
              bodyCell: true,
              cell: true
            }}
            noDataElement="暂无规则，可手动创建或通过智能助手创建"
          />
        </div>
      </div>

      <Modal
        title={editingRule ? '编辑规则' : '创建规则'}
        visible={visible}
        onCancel={closeModal}
        onOk={() => form.submit()}
        unmountOnExit
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ priority: 50 }}
          onSubmit={handleSubmit}
        >
          <Form.Item
            label="规则名称"
            field="name"
            rules={[{ required: true, message: '请输入规则名称' }]}
          >
            <Input placeholder="例如：打击链路聚合" />
          </Form.Item>
          <Form.Item
            label="触发条件"
            field="condition"
            rules={[{ required: true, message: '请输入触发条件' }]}
          >
            <TextArea
              placeholder="例如：查询涉及平台与武器"
              autoSize={{ minRows: 2, maxRows: 4 }}
            />
          </Form.Item>
          <Form.Item
            label="执行动作"
            field="action"
            rules={[{ required: true, message: '请输入执行动作' }]}
          >
            <TextArea
              placeholder="例如：聚合平台、武器与行动实例"
              autoSize={{ minRows: 2, maxRows: 4 }}
            />
          </Form.Item>
          <Form.Item label="优先级" field="priority">
            <InputNumber min={1} max={100} style={{ width: 120 }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
