import { useEffect, useState } from 'react';
import { PaginationProps } from '@arco-design/web-react';
import { SorterInfo } from '@arco-design/web-react/es/Table/interface';

// interface HttpResponse<T> {
//   data: {
//     items: T[];
//     total: number;
//     page: number;
//     page_size: number;
//   };
// }

interface UseTableListProps<T, U> {
  onRequest?: (params: U) => Promise<ApiRes<any>>;
  initialSearchParams?: U;
  formatFilter?: (filters: Partial<Record<keyof T, string[]>>) => U | {};
  formatSorter?: (sorter: SorterInfo) => U | {};
}

export const useTableList = <T = {}, U = {}>(
  props: UseTableListProps<T, U>
) => {
  const page = 1;
  const page_size = 10;

  const { onRequest, initialSearchParams, formatFilter, formatSorter } = props;

  const [loading, setLoading] = useState<boolean>(false);

  const [listData, setListData] = useState<T[]>();

  const [searchParams, setSearchParams] = useState<U>({
    ...initialSearchParams,
    page,
    page_size
  } as U);

  const [pagination, setPagination] = useState<PaginationProps>({
    sizeCanChange: true,
    showTotal: true,
    total: 0,
    pageSize: 10,
    current: 1,
    pageSizeChangeResetCurrent: true
    // showJumper: true
  });

  async function loadData() {
    setLoading(true);

    try {
      const res = await onRequest?.(searchParams);

      setPagination((prev) => ({
        ...prev,
        current: res?.data?.page,
        pageSize: res?.data?.page_size,
        total: res?.data?.total
      }));

      setListData((res?.data?.items as T[]) || []);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log('error', error);
    }
  }

  useEffect(() => {
    if (!onRequest) return;
    loadData();
  }, [searchParams]);

  function handleSearchChange(values: U) {
    setSearchParams((prev) => {
      return {
        ...prev,
        ...values
      };
    });
  }

  function handleTableChange(
    pagination: PaginationProps,
    filters: any,
    sorter: any
  ) {
    setSearchParams((prev) => {
      return {
        ...prev,
        page: pagination.current,
        page_size: pagination.pageSize,
        ...(formatFilter ? formatFilter(filters) : {}),
        ...(formatSorter ? formatSorter(sorter) : {})
      };
    });
  }

  return {
    searchParams,
    loading,
    listData,
    pagination,
    loadData,
    handleSearchChange,
    handleTableChange
  };
};
