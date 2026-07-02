import React, { useMemo, useState } from 'react';
import {
  Button,
  Message,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  Typography
} from '@arco-design/web-react';
import type {
  JointAxiom,
  JointKnowledgeBundle,
  JointSceneRule
} from '@/types/jointOperationsKnowledge';
import {
  deleteJointAxiom,
  deleteJointSceneRule,
  getJointOperationsKnowledge,
  saveJointAxiom,
  saveJointSceneRule
} from '@/utils/devJointOperationsKnowledgeStore';

const { Text } = Typography;

interface AxiomRulePanelProps {
  sceneId: number;
  knowledge: JointKnowledgeBundle;
  onChange: (bundle: JointKnowledgeBundle) => void;
}

export default function AxiomRulePanel({
  sceneId,
  knowledge,
  onChange
}: AxiomRulePanelProps) {
  const [activeTab, setActiveTab] = useState('axiom');

  const refresh = () => onChange(getJointOperationsKnowledge(sceneId));

  const axiomColumns = useMemo(
    () => [
      { title: '名称', dataIndex: 'name', width: 180 },
      { title: '表达式', dataIndex: 'expression' },
      {
        title: '领域',
        dataIndex: 'domain',
        width: 120,
        render: (value: string) => value || '-'
      },
      {
        title: '启用',
        dataIndex: 'enabled',
        width: 80,
        render: (enabled: boolean, record: JointAxiom) => (
          <Switch
            checked={enabled}
            onChange={(checked) => {
              saveJointAxiom(sceneId, {
                ...record,
                enabled: checked,
                updatedAt: new Date().toISOString()
              });
              refresh();
            }}
          />
        )
      },
      {
        title: '操作',
        width: 100,
        render: (_: unknown, record: JointAxiom) => (
          <Button
            type="text"
            status="danger"
            onClick={() => {
              deleteJointAxiom(sceneId, record.id);
              Message.success('公理已删除');
              refresh();
            }}
          >
            删除
          </Button>
        )
      }
    ],
    [sceneId]
  );

  const ruleColumns = useMemo(
    () => [
      { title: '名称', dataIndex: 'name', width: 180 },
      { title: '条件', dataIndex: 'condition' },
      { title: '动作', dataIndex: 'action' },
      {
        title: '优先级',
        dataIndex: 'priority',
        width: 90
      },
      {
        title: '启用',
        dataIndex: 'enabled',
        width: 80,
        render: (enabled: boolean, record: JointSceneRule) => (
          <Switch
            checked={enabled}
            onChange={(checked) => {
              saveJointSceneRule(sceneId, {
                ...record,
                enabled: checked,
                updatedAt: new Date().toISOString()
              });
              refresh();
            }}
          />
        )
      },
      {
        title: '操作',
        width: 100,
        render: (_: unknown, record: JointSceneRule) => (
          <Button
            type="text"
            status="danger"
            onClick={() => {
              deleteJointSceneRule(sceneId, record.id);
              Message.success('场景规则已删除');
              refresh();
            }}
          >
            删除
          </Button>
        )
      }
    ],
    [sceneId]
  );

  return (
    <div className="flex h-full flex-col bg-white p-4">
      <Space className="mb-3" align="center">
        <Text bold>公理与场景规则</Text>
        <Tag color="arcoblue">公理 {knowledge.axioms.length}</Tag>
        <Tag color="green">场景规则 {knowledge.sceneRules.length}</Tag>
      </Space>

      <Tabs activeTab={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane key="axiom" title="公理">
          <Table
            rowKey="id"
            columns={axiomColumns}
            data={knowledge.axioms}
            pagination={false}
            scroll={{ y: 420 }}
          />
        </Tabs.TabPane>
        <Tabs.TabPane key="rule" title="场景规则">
          <Table
            rowKey="id"
            columns={ruleColumns}
            data={knowledge.sceneRules}
            pagination={false}
            scroll={{ y: 420 }}
          />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}
