import React, { useMemo } from 'react';
import { normalizeOutputFields } from '../_shared/nodeIoUtils';

interface StartNodeProps {
  data: Record<string, unknown>;
}

const StartNode = ({ data }: StartNodeProps) => {
  const summary = useMemo(() => {
    const outputs = normalizeOutputFields(data.outputs);
    if (!outputs.length) {
      return '定义初始输出字段';
    }
    return `输出：${outputs.map((item) => item.variable).join('、')}`;
  }, [data.outputs]);

  return (
    <div className="px-[16px] pb-[16px]">
      <div className="text-[12px] leading-[20px] text-[var(--color-text-3)]">
        {summary}
      </div>
    </div>
  );
};

export default React.memo(StartNode);
