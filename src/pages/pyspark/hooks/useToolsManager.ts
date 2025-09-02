import { getOperator as getOperatorApi } from '@/api/pyspark';
import { GetOperatorListItem } from '@/types/pythonApi';
import { useEffect, useState } from 'react';

export const useToolsManager = () => {
  const [operatorList, setOperatorList] = useState<GetOperatorListItem[]>([]);

  const getOperator = async () => {
    const res = await getOperatorApi();

    if (res.status === 200) {
      setOperatorList(res.data ?? []);
    }
  };

  useEffect(() => {
    getOperator();
  }, []);

  return {
    operatorList,
    getOperator
  };
};
