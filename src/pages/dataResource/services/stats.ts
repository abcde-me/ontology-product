import { DATA_RESOURCE_CATALOG } from '../data/catalog';
import { DataQueryPermission } from '../types';
import { resolveQueryPermission } from '../utils/resolveQueryPermission';
import { fetchFileResourceList } from './fileApi';
import { listAllFileExtractTasks } from './fileExtractStorage';

export interface DataResourceStats {
  databaseTableCount: number;
  fileResourceCount: number;
  authorizedQueryCount: number;
  extractTaskCount: number;
  completedExtractCount: number;
}

export const DEFAULT_DATA_RESOURCE_STATS: DataResourceStats = {
  databaseTableCount: 0,
  fileResourceCount: 0,
  authorizedQueryCount: 0,
  extractTaskCount: 0,
  completedExtractCount: 0
};

export const fetchDataResourceStats = async (): Promise<DataResourceStats> => {
  const [fileList] = await Promise.all([
    fetchFileResourceList({ pageNo: 1, pageSize: -1 })
  ]);

  const extractTasks = listAllFileExtractTasks();
  const authorizedQueryCount = DATA_RESOURCE_CATALOG.filter((table) => {
    const permission =
      table.queryPermission ?? resolveQueryPermission(table.id);
    return permission === DataQueryPermission.AUTHORIZED;
  }).length;

  return {
    databaseTableCount: DATA_RESOURCE_CATALOG.length,
    fileResourceCount: fileList.total,
    authorizedQueryCount,
    extractTaskCount: extractTasks.length,
    completedExtractCount: extractTasks.filter(
      (task) => task.status === 'completed'
    ).length
  };
};
