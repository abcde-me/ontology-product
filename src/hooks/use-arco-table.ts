import {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
  ComponentProps
} from 'react';
import type { TableProps, PaginationProps } from '@arco-design/web-react';
import { useDebounceFn, useRequest } from 'ahooks';
import { SorterInfo } from '@arco-design/web-react/lib/Table/interface';

export interface UseArcoTableOptions<TParams extends any[] = any[]> {
  manual?: boolean;
  defaultPageSize?: number;
  defaultPage?: number;
  deps?: TParams;
  debounceWait?: number;
  form?: any;
  onError?: (e: any) => void;
}

export interface ServiceResult<TData = any> {
  items: TData[];
  total: number;
}

export type Service<TData = any, TParams = Record<string, any>> = (params: {
  pagination: PaginationProps;
  sorter?: SorterInfo | SorterInfo[];
  filters?: Partial<Record<keyof TData, string[]>>;
  query?: TParams;
}) => Promise<ServiceResult<TData>>;

function useArcoTable<TData = any, TParams extends any[] = any[]>(
  service: Service<TData, TParams>,
  options: UseArcoTableOptions<TParams> = {}
) {
  const {
    manual = false,
    defaultPageSize = 10,
    defaultPage = 1,
    deps = [],
    debounceWait = 200,
    form,
    onError
  } = options;
  const [pagination, setPagination] = useState<PaginationProps>({
    current: defaultPage,
    pageSize: defaultPageSize
  });
  const [sorter, setSorter] = useState<SorterInfo | SorterInfo[]>();
  const [filters, setFilters] = useState<any>();

  const serviceRef = useRef(service);
  serviceRef.current = service;

  const refresh = () => {
    setPagination({
      current: 1,
      pageSize: pagination.pageSize,
      total: pagination.total
    });
    setSorter({});
    setFilters({});
  };

  const { run: onSubmit } = useDebounceFn(
    () => {
      setPagination((prevState) => {
        return {
          ...prevState,
          current: 1
        };
      });
    },
    { wait: debounceWait }
  );

  const { data, loading, run } = useRequest<ServiceResult<TData>, TParams>(
    () => {
      const query = form?.getFieldsValue?.() || {};
      return serviceRef.current({
        pagination,
        filters,
        sorter,
        query
      });
    },
    {
      refreshDeps: [pagination, sorter, filters, form, ...deps],
      manual,
      debounceWait,
      onError
    }
  );

  // @ts-ignore
  const onChange = useCallback<TableProps['onChange']>((...rest) => {
    const [pagination, sorter, filters, extra] = rest;
    const { action } = extra;
    if (action === 'paginate') {
      setPagination((p) => ({ ...p, ...pagination }));
      return;
    }
    if (action === 'sort') {
      setSorter(sorter);
      return;
    }
    setFilters(filters);
  }, []);
  const onPageChange = (pageNumber, pageSize) => {
    setPagination((prevState) => {
      return {
        ...prevState,
        current: pageNumber,
        pageSize
      };
    });
  };
  const onPageSizeChange = (page) => {
    setPagination((prevState) => {
      return {
        ...prevState,
        pageSize: page,
        current: 1
      };
    });
  };

  return {
    tableProps: {
      loading,
      data: data?.items || [],
      pagination: {
        ...pagination,
        total: data?.total || 0,
        onChange: onPageChange,
        onPageSizeChange
      },
      onChange
    } as Pick<TableProps, 'data' | 'loading' | 'pagination' | 'onChange'>,
    refresh,
    onSubmit
  };
}

export default useArcoTable;
