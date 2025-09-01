import {
  getDatasetVersionFile,
  searchDatasetList
} from '@/api/datasetManagement';
import {
  DatasetListItem,
  DatasetVersionFileItem,
  DatasetVersionFileRes,
  Scheam
} from '@/types/datasetManagement';
import { useEffect, useState } from 'react';

export const useDasetTree = (type: 'sql' | 'python') => {
  const [dasetList, setDasetList] = useState<DatasetListItem[]>([]);
  const [scheamList, setScheamList] = useState<Scheam[]>([]);
  const [dasetFileList, setDasetFileList] = useState<DatasetVersionFileItem[]>(
    []
  );
  const [currentPage, setCurrentPage] = useState(1);

  // 获取数据集数据库字段列表
  const getScheamList = (id: number) => {
    const res = dasetList.find((item) => item.id === id);

    if (res) {
      setScheamList(res.scheams ?? []);
    }
  };

  // 获取数据集目录列表, sql和python用的一个接口
  const getDasetList = async () => {
    const res = await searchDatasetList({
      storage_type_list: type === 'sql' ? 'table' : 'file,jsonl'
    });

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
      return;
    }

    setDasetFileList(res?.data?.list ?? []);
    setCurrentPage(res?.data?.page ?? 1);
  };

  useEffect(() => {
    getDasetList();
  }, []);

  return {
    dasetList,
    getDasetList,
    dasetFileList,
    currentPage,
    getDasetVersionFile,
    scheamList,
    getScheamList
  };
};
