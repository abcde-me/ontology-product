import { useState, useEffect } from 'react';
import { TableProps } from '@arco-design/web-react';
import { useAgentEditor } from '@/pages/agentTwo/agentCreate/compontents/AgentProvider/Context';
import type { DataSet } from '@/pages/workflowConfig/models/datasets';
import { getDatasetsList } from '@/api/datasetsV2';
import { getAppsList } from '@/api/appsV2';

interface UseTableOptions {
  defaultPageSize?: number;
  defaultCurrent?: number;
  ids?: string[];
  tag_ids?: string[];
  name?: string;
  published?: boolean;
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
    ids,
    tag_ids,
    name,
    published = true
  } = options;

  const agent = useAgentEditor();
  const { workflowStore } = agent;
  const { loading, list } = workflowStore.useGetState();

  const [pagination, setPagination] = useState({
    current: defaultCurrent,
    pageSize: defaultPageSize,
    total: 0
  });

  const handlePaginationChange = (page: number, pageSize: number) => {
    setPagination((prev) => ({
      ...prev,
      current: page,
      pageSize
    }));
    fetchData({
      page,
      limit: pageSize,
      ids: ids?.join(','),
      tag_ids: tag_ids?.join(','),
      name,
      mode: 'workflow',
      published: true
    });
  };

  const fetchData = async (params: any) => {
    try {
      const response = await getAppsList('', params);
      workflowStore.setList(response.data?.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.data?.total || 0
      }));
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  useEffect(() => {
    fetchData({
      page: pagination.current,
      limit: pagination.pageSize,
      ids: ids?.join(','),
      tag_ids: tag_ids?.join(','),
      name,
      mode: 'workflow',
      published: true
    });
  }, [ids, tag_ids, name]);

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
    await fetchData({
      page: pagination.current,
      limit: pagination.pageSize,
      ids: ids?.join(','),
      tag_ids: tag_ids?.join(','),
      name,
      mode: 'workflow',
      published: true
    });
  };

  return {
    tableProps,
    loading,
    refresh
  };
}
