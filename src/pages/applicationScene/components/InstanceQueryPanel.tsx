import React, { useState } from 'react';
import { Button, Input, Table, Tag, Typography } from '@arco-design/web-react';
import type {
  ApplicationScenarioRule,
  InstanceInferenceResult
} from '../types';
import { executeInstanceInferenceQuery } from '../services/instanceInferenceQuery';

const { Text, Paragraph } = Typography;

interface InstanceQueryPanelProps {
  ontologySceneId?: number;
  rules: ApplicationScenarioRule[];
  latestResult?: InstanceInferenceResult | null;
}

export default function InstanceQueryPanel({
  ontologySceneId,
  rules,
  latestResult
}: InstanceQueryPanelProps) {
  const [query, setQuery] = useState('查询图谱覆盖的平台与武器实例');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InstanceInferenceResult | null>(
    latestResult || null
  );

  const handleQuery = async () => {
    if (!ontologySceneId) {
      return;
    }

    setLoading(true);
    try {
      const response = await executeInstanceInferenceQuery({
        ontologySceneId,
        query,
        rules
      });
      setResult(response);
    } finally {
      setLoading(false);
    }
  };

  if (!ontologySceneId) {
    return (
      <div className="flex h-full items-center justify-center text-[var(--color-text-3)]">
        请先在图谱区域选择关联图谱。
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-white p-4">
      <Text bold>实例推理查询</Text>
      <Paragraph className="text-[13px] text-[var(--color-text-3)]">
        基于所选图谱与应用规则，推理查询覆盖的实例信息。
      </Paragraph>

      <div className="mb-4 flex gap-3">
        <Input.TextArea
          value={query}
          onChange={setQuery}
          autoSize={{ minRows: 2, maxRows: 4 }}
          placeholder="输入查询意图"
          className="flex-1"
        />
        <Button
          type="primary"
          loading={loading}
          onClick={() => void handleQuery()}
        >
          执行推理
        </Button>
      </div>

      {result && (
        <>
          <Paragraph className="rounded-md bg-[#F8FAFC] px-3 py-2 text-[13px]">
            {result.summary}
          </Paragraph>

          {result.appliedRules.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {result.appliedRules.map((ruleName) => (
                <Tag key={ruleName} color="arcoblue">
                  {ruleName}
                </Tag>
              ))}
            </div>
          )}

          <Table
            rowKey="objectTypeId"
            pagination={false}
            data={result.hits}
            columns={[
              { title: '对象类型', dataIndex: 'objectTypeName', width: 180 },
              { title: '实例数', dataIndex: 'instanceCount', width: 100 },
              {
                title: '样例实例',
                dataIndex: 'sampleInstances',
                render: (samples: Array<Record<string, unknown>>) => {
                  if (!samples?.length) {
                    return '-';
                  }
                  const first = samples[0];
                  const preview = Object.entries(first)
                    .slice(0, 3)
                    .map(([key, value]) => `${key}: ${String(value ?? '')}`)
                    .join(' | ');
                  return (
                    <span className="text-[12px] text-[var(--color-text-2)]">
                      {preview}
                      {samples.length > 1 ? ` 等 ${samples.length} 条` : ''}
                    </span>
                  );
                }
              }
            ]}
          />
        </>
      )}
    </div>
  );
}
