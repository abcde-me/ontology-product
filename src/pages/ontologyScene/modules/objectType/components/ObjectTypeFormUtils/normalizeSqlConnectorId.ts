/** SQL 连接器 id：0 / 负数 / 非数字视为未选择 */
export function normalizeSqlConnectorId(
  raw?: number | string | null
): number | undefined {
  if (raw === undefined || raw === null || raw === '') {
    return undefined;
  }
  const numeric = Number(raw);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return undefined;
  }
  return numeric;
}

export function normalizeSqlSourceDataInfo<T extends { connectorId?: number }>(
  source: T
): T {
  const connectorId = normalizeSqlConnectorId(source.connectorId);
  if (connectorId === source.connectorId) {
    return source;
  }
  return {
    ...source,
    connectorId
  };
}
