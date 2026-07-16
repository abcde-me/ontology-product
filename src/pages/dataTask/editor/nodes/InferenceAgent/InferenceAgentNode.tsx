import React, { useMemo } from 'react';
import { normalizeOutputFields } from '../_shared/nodeIoUtils';

const buildSummary = (data: Record<string, unknown>) => {
  const agentName = String(data.agentName || '').trim();
  const ontologyModelName = String(data.ontologyModelName || '').trim();
  const outputs = normalizeOutputFields(data.outputs);
  const name = agentName || ontologyModelName;

  if (!name) {
    return '待选择 AGENT（数据更新触发推理）';
  }

  const outputHint = outputs.length
    ? `输出 ${outputs.map((item) => item.variable).join('、')}`
    : '输出推理结果';

  return `${name} / 数据更新触发 / ${outputHint}`;
};

const InferenceAgentNode = ({ data }: { data: Record<string, unknown> }) => {
  const summary = useMemo(() => buildSummary(data), [data]);

  return (
    <div className="px-[16px] pb-[16px]">
      <div className="text-[12px] leading-[20px] text-[var(--color-text-3)]">
        {summary}
      </div>
    </div>
  );
};

export default React.memo(InferenceAgentNode);
