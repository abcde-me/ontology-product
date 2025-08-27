import {
  getDatasetVersionFile,
  searchDatasetList
} from '@/api/datasetManagement';

export const useDasetTree = (type: 'sql' | 'python') => {
  // 获取数据集目录列表, sql和python用的一个接口
  const getDasetList = async () => {
    const res = await searchDatasetList({
      storage_type_list: type === 'sql' ? 'table' : 'file,jsonl'
    });

    if (res?.status !== 200) {
      return [];
    }

    return res?.data?.list ?? [];
  };

  // 获取数据集单个目录下的文件列表，python用
  const getDasetVersionFile = async (
    id: number,
    version_id: string,
    page = 1,
    page_size = 1000
  ) => {
    const res = await getDatasetVersionFile({
      id,
      version_id,
      page,
      page_size
    });

    if (res?.status !== 200) {
      return [];
    }

    return res?.data ?? [];
  };

  return {
    getDasetList,
    getDasetVersionFile
  };
};
