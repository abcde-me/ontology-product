import { useState, useEffect } from 'react';
import { TableProps } from '@arco-design/web-react';
import { useMemberEditor } from '@/pages/member/components/MemberProvider/Context';
import type { DataSet } from '@/pages/workflowConfig/models/datasets';

interface UseTableOptions {
  defaultPageSize?: number;
  defaultCurrent?: number;
  name?: string;
}

interface UseTableReturn {
  tableProps: TableProps<DataSet>;
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useTable(options: UseTableOptions = {}): UseTableReturn {
  const {
    defaultPageSize = 10,
    defaultCurrent = 1,
    name,
  } = options;

  const member = useMemberEditor();
  const { memberStore } = member;
  const { loading, list } = memberStore.useGetState();

  const [pagination, setPagination] = useState({
    current: defaultCurrent,
    pageSize: defaultPageSize,
    total: 0
  });

  const handlePaginationChange = async (page: number, pageSize: number) => {
    setPagination((prev) => ({
      ...prev,
      current: page,
      pageSize
    }));

    const result = await memberStore.fetchData({
      page,
      size: pageSize,
      name,
    });

    setPagination((prev) => ({
      ...prev,
      total: result.total
    }));
  };

  const fetchData = async () => {
    const result = await memberStore.fetchData({
      page: pagination.current,
      size: pagination.pageSize,
      name,
    });
    console.log('fetchData result', result);

    setPagination((prev) => ({
      ...prev,
      total: result.total
    }));
  };

  useEffect(() => {
    fetchData();
  }, [ name, pagination.current, pagination.pageSize]);

  const tableProps: TableProps<DataSet> = {
    data: list,
    loading,
    pagination: {
      current: pagination.current,
      pageSize: pagination.pageSize,
      total: pagination.total,
      onChange: handlePaginationChange,
      showTotal: true,
      showJumper: true,
      sizeCanChange: true
    }
  };

  const refresh = async () => {
    await fetchData();
  };

  return {
    tableProps,
    loading,
    refresh
  };
}
