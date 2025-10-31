import { getOperator as getOperatorApi } from '@/api/pyspark';
import { GetOperatorListItem } from '@/types/pythonApi';
import { useEffect, useState, useCallback } from 'react';

export const useToolsManager = () => {
  const [operatorList, setOperatorList] = useState<GetOperatorListItem[]>([]);
  const [searchKey, setSearchKey] = useState('');
  const [loading, setLoading] = useState(false);

  const getOperator = useCallback(async (searchValue = '') => {
    setLoading(true);
    try {
      console.log('searchValue', searchValue);
      const res = await getOperatorApi({
        search_key: searchValue
      });

      if (res.status === 200) {
        setOperatorList(res.data ?? []);
      }
    } catch (error) {
      console.error('获取算子列表失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 处理搜索
  const handleSearch = useCallback(
    (value: string) => {
      getOperator(value);
    },
    [getOperator]
  );

  // 处理搜索值变化（仅更新状态，不触发搜索）
  const handleSearchChange = useCallback((value: string) => {
    setSearchKey(value);
  }, []);

  // 初始化加载
  useEffect(() => {
    getOperator();
  }, [getOperator]);

  return {
    searchKey,
    setSearchKey: handleSearchChange,
    operatorList,
    getOperator,
    handleSearch,
    loading
  };
};
