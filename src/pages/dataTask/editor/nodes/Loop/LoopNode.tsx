import React, { useMemo } from 'react';

const buildSummary = (data: Record<string, unknown>) => {
  const loopCount = Number(data.loop_count);
  const breakConditions = Array.isArray(data.break_conditions)
    ? data.break_conditions
    : [];
  const maxCountText =
    Number.isFinite(loopCount) && loopCount > 0
      ? `最多 ${loopCount} 次`
      : '待配置最大次数';
  const conditionText = breakConditions.length
    ? `已设 ${breakConditions.length} 个终止条件`
    : '待配置终止条件';

  return `${maxCountText} / ${conditionText}`;
};

const LoopNode = ({ data }: { data: Record<string, unknown> }) => {
  const summary = useMemo(() => buildSummary(data), [data]);

  return (
    <div className="px-[16px] pb-[16px]">
      <div className="text-[12px] leading-[20px] text-[var(--color-text-3)]">
        {summary}
      </div>
    </div>
  );
};

export default React.memo(LoopNode);
