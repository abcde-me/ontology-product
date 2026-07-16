import React, { useMemo } from 'react';

const CONFLICT_STRATEGY_LABEL: Record<string, string> = {
  KEEP_SOURCE: '保留数据源',
  KEEP_TARGET: '保留目标表'
};

const EXCEPTION_STRATEGY_LABEL: Record<string, string> = {
  STOP_ON_ERROR: '立即停止',
  LOG_ERROR_AND_CONTINUE: '继续消费'
};

const buildSummary = (data: Record<string, unknown>) => {
  const sceneName = String(data.ontologyModelName || '').trim();
  const objectTypeName = String(data.objectTypeName || '').trim();
  const conflictStrategy = String(data.conflictStrategy || 'KEEP_SOURCE');
  const conflictLabel =
    CONFLICT_STRATEGY_LABEL[conflictStrategy] || conflictStrategy;
  const exceptionStrategy = String(data.exceptionStrategy || 'STOP_ON_ERROR');
  const exceptionLabel =
    EXCEPTION_STRATEGY_LABEL[exceptionStrategy] || exceptionStrategy;

  const parts = [
    sceneName,
    objectTypeName,
    conflictLabel,
    exceptionLabel
  ].filter(Boolean);
  return parts.length ? parts.join(' / ') : '待选择本体对象类型';
};

const ObjectTypeNode = ({ data }: { data: Record<string, unknown> }) => {
  const summary = useMemo(() => buildSummary(data), [data]);

  return (
    <div className="px-[16px] pb-[16px]">
      <div className="text-[12px] leading-[20px] text-[var(--color-text-3)]">
        {summary}
      </div>
    </div>
  );
};

export default React.memo(ObjectTypeNode);
