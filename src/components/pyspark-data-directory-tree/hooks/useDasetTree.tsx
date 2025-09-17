import {
  getDatasetVersionFile,
  searchDatasetList
} from '@/api/datasetManagement';
import {
  DatasetListItem,
  DatasetVersionFileItem
} from '@/types/datasetManagement';
import { useEffect, useState } from 'react';

export const useDasetTree = () => {
  const [dasetList, setDasetList] = useState<DatasetListItem[]>([]);
  const [dasetFileList, setDasetFileList] = useState<DatasetVersionFileItem[]>(
    []
  );
  const [searchKeyword, setSearchKeyword] = useState('');

  // 获取数据集目录列表
  const getDasetList = async (keyword?: string) => {
    const targetParams: any = {
      storage_type_list: ['file', 'jsonl'],
      name: keyword || searchKeyword
    };

    const res = await searchDatasetList(targetParams);

    if (res?.status !== 200) {
      return;
    }

    setDasetList(res?.data?.list ?? []);
  };

  // 获取数据集单个目录下的文件列表，python用
  const getDasetVersionFile = async (
    id: number,
    version_id: string,
    page?: number,
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

    const fileList = res?.data?.list ?? [];
    setDasetFileList(fileList);
    return fileList;
  };

  useEffect(() => {
    getDasetList();
  }, []);

  return {
    dasetList,
    searchKeyword,
    setSearchKeyword,
    getDasetList,
    dasetFileList,
    getDasetVersionFile
  };
};
