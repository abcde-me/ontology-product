import { DATA_RESOURCE_CATALOG } from '../data/catalog';
import { formatTableComment } from '../utils/formatTableComment';
import { resolveQueryPermission } from '../utils/resolveQueryPermission';
import { resolveSourceSystem } from '../utils/resolveSourceSystem';
import { DataQueryPermission } from '../types';
import type {
  DataResourceListItem,
  DataResourceListResponse,
  DataResourceTable,
  GetDataResourceListParams
} from '../types';

const appliedQueryPermissionIds = new Set<string>();

const getQueryPermission = (table: DataResourceTable): DataQueryPermission => {
  if (appliedQueryPermissionIds.has(table.id)) {
    return DataQueryPermission.AUTHORIZED;
  }
  return table.queryPermission ?? resolveQueryPermission(table.id);
};

const toListItem = (table: DataResourceTable): DataResourceListItem => ({
  id: table.id,
  databaseType: table.databaseType,
  tableName: table.tableName,
  tableComment: formatTableComment(table.tableComment),
  sourceSystem: table.sourceSystem ?? resolveSourceSystem(table.id),
  queryPermission: getQueryPermission(table)
});

export const applyDataQueryPermission = (id: string): Promise<void> => {
  appliedQueryPermissionIds.add(id);
  return Promise.resolve();
};

export const fetchDataResourceList = (
  params: GetDataResourceListParams
): Promise<DataResourceListResponse> => {
  const keyword = (params.filter || '').trim().toLowerCase();
  let items = DATA_RESOURCE_CATALOG.map(toListItem);

  if (params.databaseType) {
    items = items.filter((item) => item.databaseType === params.databaseType);
  }

  if (params.sourceSystem) {
    items = items.filter((item) => item.sourceSystem === params.sourceSystem);
  }

  if (params.queryPermission) {
    items = items.filter(
      (item) => item.queryPermission === params.queryPermission
    );
  }

  if (keyword) {
    items = items.filter(
      (item) =>
        item.tableName.toLowerCase().includes(keyword) ||
        item.tableComment.toLowerCase().includes(keyword) ||
        item.databaseType.toLowerCase().includes(keyword) ||
        item.sourceSystem.toLowerCase().includes(keyword)
    );
  }

  const total = items.length;
  const pageNo = params.pageNo || 1;
  const pageSize = params.pageSize || 10;
  const start = (pageNo - 1) * pageSize;

  return Promise.resolve({
    items: items.slice(start, start + pageSize),
    total,
    pageNo,
    pageSize
  });
};

export const fetchDataResourceDetail = (
  id: string
): Promise<DataResourceTable | null> => {
  const table = DATA_RESOURCE_CATALOG.find((item) => item.id === id);
  if (!table) {
    return Promise.resolve(null);
  }
  return Promise.resolve({
    ...table,
    tableComment: formatTableComment(table.tableComment),
    sourceSystem: table.sourceSystem ?? resolveSourceSystem(table.id)
  });
};
