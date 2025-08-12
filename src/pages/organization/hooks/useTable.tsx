import { useState, useEffect } from 'react';
import { TableProps } from '@arco-design/web-react';
import { useOrgEditor } from '@/pages/organization/components/OrgProvider/Context';
import type { DataSet } from '@/pages/workflowConfig/models/datasets';

interface UseTableOptions {
  defaultPageSize?: number;
  defaultCurrent?: number;
  organization_id?: string | number;
}

interface UseTableReturn {
  tableProps: TableProps<DataSet>;
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useTable(options: UseTableOptions = {}): UseTableReturn {
  const { defaultPageSize = 10, defaultCurrent = 1, organization_id } = options;

  const org = useOrgEditor();
  const { orgStore } = org;
  const { list, searchParams, total } = orgStore.useGetState([
    'list',
    'searchParams',
    'total'
  ]);

  // 使用本地 loading 状态，避免依赖 orgStore 的 loading
  const [loading, setLoading] = useState(false);
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

    setLoading(true);
    try {
      await orgStore.fetchData({
        page,
        size: pageSize
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      await orgStore.fetchData({
        page: pagination.current,
        size: pagination.pageSize
      });
    } catch (error) {
      console.error('useTable fetchData error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 只有当有 organization_id 时才调用接口
    if (searchParams.organization_id || organization_id) {
      fetchData();
    } else {
      console.log('useTable skipping fetchData because no organization_id');
    }
  }, [
    pagination.current,
    pagination.pageSize,
    searchParams.organization_id,
    organization_id
  ]);

  // 当 organization_id 变化时，重置分页到第1页
  useEffect(() => {
    if (searchParams.organization_id || organization_id) {
      setPagination((prev) => ({
        ...prev,
        current: 1
      }));
    }
  }, [searchParams.organization_id, organization_id]);

  const tableProps: TableProps<DataSet> = {
    data: list,
    loading,
    pagination: {
      current: pagination.current,
      pageSize: pagination.pageSize,
      total: total, // 使用 store 中的 total
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
