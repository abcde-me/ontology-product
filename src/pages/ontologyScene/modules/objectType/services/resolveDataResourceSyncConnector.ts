import {
  listOntologyConnectors,
  listSqlConnectorDBAndTables
} from '@/api/ontologySceneLibrary/objectType';
import type { SqlConnectorItem } from '@/types/objectType';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import { useUserInfoStore } from '@/store/userInfoStore';

export interface ResolvedDataResourceSyncConnector {
  connectorId: number;
  connectorName?: string;
  databaseName: string;
  tableName: string;
}

const normalizeConnectorList = (data: unknown): SqlConnectorItem[] => {
  if (Array.isArray(data)) {
    return data as SqlConnectorItem[];
  }
  if (
    data &&
    typeof data === 'object' &&
    Array.isArray((data as { items?: SqlConnectorItem[] }).items)
  ) {
    return (data as { items: SqlConnectorItem[] }).items;
  }
  return [];
};

const resolvePreferredConnectorSubtypes = (databaseType?: string): string[] => {
  const normalized = databaseType?.trim().toLowerCase() || '';
  if (normalized.includes('postgres')) {
    return ['postgres', 'postgresql'];
  }
  if (normalized.includes('mysql')) {
    return ['mysql'];
  }
  if (normalized.includes('dameng')) {
    return ['dameng'];
  }
  return ['postgres', 'postgresql', 'mysql', 'dameng'];
};

const sortConnectorsByPreference = (
  connectors: SqlConnectorItem[],
  preferredSubtypes: string[]
) =>
  [...connectors].sort((left, right) => {
    const leftSubtype = String(left.subtype || '').toLowerCase();
    const rightSubtype = String(right.subtype || '').toLowerCase();
    const leftScore = preferredSubtypes.findIndex((item) =>
      leftSubtype.includes(item)
    );
    const rightScore = preferredSubtypes.findIndex((item) =>
      rightSubtype.includes(item)
    );
    const normalizedLeftScore =
      leftScore === -1 ? preferredSubtypes.length : leftScore;
    const normalizedRightScore =
      rightScore === -1 ? preferredSubtypes.length : rightScore;
    return normalizedLeftScore - normalizedRightScore;
  });

/**
 * 在已配置的 SQL 数据源连接中，查找包含目标数据资源表的连接器。
 */
export const resolveDataResourceSyncConnector = async (input: {
  tableName: string;
  databaseType?: string;
  projectID?: string;
}): Promise<ResolvedDataResourceSyncConnector | null> => {
  const tableName = input.tableName?.trim();
  if (!tableName) {
    return null;
  }

  const projectID =
    input.projectID?.trim() ||
    useUserInfoStore.getState().getEffectiveProjectId?.() ||
    useUserInfoStore.getState().projectId?.[1];
  if (!projectID) {
    return null;
  }

  const connectorRes = await listOntologyConnectors({
    page: 1,
    page_size: 1000,
    type: 'sql',
    subtype: ['mysql', 'dameng', 'postgres'],
    status: ['succeed'],
    sort: 'desc',
    sort_by: 'create_time'
  });
  if (!isOntologyApiSuccess(connectorRes)) {
    return null;
  }

  const preferredSubtypes = resolvePreferredConnectorSubtypes(
    input.databaseType
  );
  const connectors = sortConnectorsByPreference(
    normalizeConnectorList(connectorRes.data),
    preferredSubtypes
  );

  for (const connector of connectors) {
    const connectorId = Number(connector.id);
    if (!Number.isFinite(connectorId)) {
      continue;
    }

    const tablesRes = await listSqlConnectorDBAndTables({
      id: connectorId,
      projectID
    });
    if (!isOntologyApiSuccess(tablesRes) || !tablesRes.data?.length) {
      continue;
    }

    for (const database of tablesRes.data) {
      const databaseName = String(database.database_name || '').trim();
      const matchedTable = (database.tables || []).find(
        (table) => String(table.name || '').trim() === tableName
      );
      if (!matchedTable) {
        continue;
      }

      return {
        connectorId,
        connectorName: connector.name,
        databaseName,
        tableName
      };
    }
  }

  return null;
};
