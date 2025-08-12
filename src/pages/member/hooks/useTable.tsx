import { useState, useEffect } from 'react';
import { TableProps } from '@arco-design/web-react';
import { useMemberEditor } from '@/pages/member/components/MemberProvider/Context';
import type { DataSet } from '@/pages/workflowConfig/models/datasets';

interface UseTableOptions {
  defaultPageSize?: number;
  defaultCurrent?: number;
}

interface UseTableReturn {
  tableProps: TableProps<DataSet>;
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useTable(options: UseTableOptions = {}): UseTableReturn {
  const { defaultPageSize = 10, defaultCurrent = 1 } = options;

  const member = useMemberEditor();
  const { memberStore } = member;
  const { loading, list, total, searchParams } = memberStore.useGetState([
    'loading',
    'list',
    'total',
    'searchParams'
  ]);

  const [pagination, setPagination] = useState({
    current: defaultCurrent,
    pageSize: defaultPageSize
  });

  const handlePaginationChange = async (page: number, pageSize: number) => {
    setPagination({
      current: page,
      pageSize
    });

    await memberStore.fetchData({
      page,
      size: pageSize
    });
  };

  const fetchData = async () => {
    const result = await memberStore.fetchData({
      page: pagination.current,
      size: pagination.pageSize
    });
    console.log('fetchData result', result);
  };

  useEffect(() => {
    fetchData();
  }, [pagination.current, pagination.pageSize, searchParams.organization_id]);

  // 当组织ID变化时，重置分页到第1页
  useEffect(() => {
    if (searchParams.organization_id) {
      console.log('Organization changed, resetting pagination to page 1');
      setPagination((prev) => ({
        ...prev,
        current: 1
      }));
    }
  }, [searchParams.organization_id]);

  const tableProps: TableProps<DataSet> = {
    data: list,
    loading,
    pagination: {
      current: pagination.current,
      pageSize: pagination.pageSize,
      total: total,
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
