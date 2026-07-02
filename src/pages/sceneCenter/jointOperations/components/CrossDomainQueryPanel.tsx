import React, { useState } from 'react';
import {
  Button,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Typography
} from '@arco-design/web-react';
import type {
  CrossDomainQueryResult,
  JointKnowledgeBundle
} from '@/types/jointOperationsKnowledge';
import { executeJointOperationsCrossDomainQuery } from '@/services/jointOperationsCrossDomainQuery';
import type { OntologScene } from '@/types/ontologySceneApi';

const { Text, Paragraph } = Typography;

interface CrossDomainQueryPanelProps {
  sceneId: number;
  scenes: OntologScene[];
  knowledge: JointKnowledgeBundle;
}

const kindLabel: Record<string, string> = {
  objectType: '对象类型',
  link: '链接',
  axiom: '公理',
  sceneRule: '场景规则'
};

export default function CrossDomainQueryPanel({
  sceneId,
  scenes,
  knowledge
}: CrossDomainQueryPanelProps) {
  const [query, setQuery] = useState('查询海军平台、武器与军事行动的打击链路');
  const [extraSceneIds, setExtraSceneIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CrossDomainQueryResult | null>(null);

  const handleQuery = async () => {
    setLoading(true);
    try {
      const response = await executeJointOperationsCrossDomainQuery({
        sceneId,
        query,
        knowledge,
        extraSceneIds
      });
      setResult(response);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-white p-4">
      <Text bold>跨域数据查询</Text>
      <Paragraph className="text-[13px] text-[var(--color-text-3)]">
        基于所选图谱、公理与场景规则，对多个本体场景进行关联检索与应用分析。
      </Paragraph>

      <Space direction="vertical" className="mb-4 w-full" size="medium">
        <Input.TextArea
          value={query}
          onChange={setQuery}
          autoSize={{ minRows: 2, maxRows: 4 }}
          placeholder="输入跨域查询意图，如：查询地理位置与作战行动的关联"
        />
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[13px] text-[var(--color-text-3)]">
            扩展查询场景：
          </span>
          <Select
            mode="multiple"
            allowClear
            style={{ minWidth: 320 }}
            placeholder="可选其他图谱场景"
            value={extraSceneIds}
            onChange={setExtraSceneIds}
            options={scenes
              .filter((scene) => scene.id != null && scene.id !== sceneId)
              .map((scene) => ({
                label: scene.name || '未命名场景',
                value: scene.id!
              }))}
          />
          <Button
            type="primary"
            loading={loading}
            onClick={() => void handleQuery()}
          >
            执行查询
          </Button>
        </div>
      </Space>

      {result && (
        <>
          <Paragraph className="rounded-md bg-[#F8FAFC] px-3 py-2 text-[13px]">
            {result.summary}
          </Paragraph>
          <Table
            rowKey={(record) => `${record.kind}-${record.id}`}
            loading={loading}
            pagination={{ pageSize: 10 }}
            data={result.hits}
            columns={[
              {
                title: '类型',
                dataIndex: 'kind',
                width: 110,
                render: (kind: string) => <Tag>{kindLabel[kind] || kind}</Tag>
              },
              { title: '名称', dataIndex: 'name', width: 180 },
              { title: '编码', dataIndex: 'code', width: 160 },
              { title: '场景', dataIndex: 'sceneName', width: 140 },
              { title: '说明', dataIndex: 'description' },
              {
                title: '相关度',
                dataIndex: 'relevance',
                width: 90,
                render: (value: number) => value.toFixed(1)
              }
            ]}
          />
        </>
      )}
    </div>
  );
}
