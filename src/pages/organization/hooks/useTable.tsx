import { useState, useEffect } from 'react';
import { TableProps } from '@arco-design/web-react';
import { useOrgEditor } from '@/pages/organization/components/OrgProvider/Context';
import type { DataSet } from '@/pages/workflowConfig/models/datasets';

interface UseTableOptions {
  defaultPageSize?: number;
  defaultCurrent?: number;
  name?: string;
  organization_id?: string | number;
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
    organization_id = 1,
  } = options;

  const org = useOrgEditor();
  const { orgStore } = org;
  const { loading, list } = orgStore.useGetState();

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

    const result = await orgStore.fetchData({
      page,
      size: pageSize,
      name,
      organization_id,
    });

    setPagination((prev) => ({
      ...prev,
      total: result.total
    }));
  };
  const fetchData = async () => {
    const result = await orgStore.fetchData({
      page: pagination.current,
      size: pagination.pageSize,
      name,
      organization_id,
    });

    setPagination((prev) => ({
      ...prev,
      total: result.total
    }));
  };

  useEffect(() => {
    fetchData();
  }, [name, organization_id, pagination.current, pagination.pageSize]);

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
