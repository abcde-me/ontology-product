import { SyncSourceDataStrategyFormState } from './types';

/** 轮询模式下，同步范围为增量或增量+全量时，增量 SQL / 时间列 / 断点列为必填 */
export function syncScopeRequiresIncrementalPollingFields(
  strategy: Pick<SyncSourceDataStrategyFormState, 'mode' | 'syncScope'>
): boolean {
  if (strategy.mode !== 'JDBC_POLLING') {
    return false;
  }
  const scope = strategy.syncScope;
  return scope === 'INCREMENTAL' || scope === 'FULL_THEN_INCREMENTAL';
}
