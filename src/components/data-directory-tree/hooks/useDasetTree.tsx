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
  const [searchKeyword, setSearchKeyword] = useState('');

  // 获取数据集数据库字段列表
  const getScheamList = (id: number) => {
    console.log('searchKeyword', searchKeyword);
    console.log(
      'dasetList',
      dasetList.find((item) => item.id === id)
    );

    const dataset = dasetList.find((item) => item.id === id);
    const scheams = dataset?.scheams ?? [];

    if (searchKeyword.trim() === '') {
      setScheamList(scheams);
      return;
    }

    // 搜索字段名、中文名等
    const filteredScheams = scheams.filter((scheam) => {
      const searchFields = [scheam.name, scheam.cn_name].filter(
        Boolean
      ) as string[];

      return searchFields.some((field) =>
        field.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    });

    setScheamList(filteredScheams);
  };

  // 获取数据集目录列表, sql和python用的一个接口
  const getDasetList = async () => {
    const res = await searchDatasetList({
      storage_type_list: type === 'sql' ? ['table'] : ['file', 'jsonl'],
      name: searchKeyword
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
      page_size,
      file_name: searchKeyword
    });

    if (res?.status !== 200) {
      return;
    }

    setDasetFileList(res?.data?.list ?? []);
    setCurrentPage(res?.data?.page ?? 1);
  };

  useEffect(() => {
    getDasetList();
  }, [type]);

  return {
    dasetList,
    searchKeyword,
    setSearchKeyword,
    getDasetList,
    dasetFileList,
    currentPage,
    getDasetVersionFile,
    scheamList,
    getScheamList
  };
};
