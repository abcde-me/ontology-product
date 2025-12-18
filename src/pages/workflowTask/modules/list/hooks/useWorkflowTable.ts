import { useState, useCallback, useEffect, useRef } from 'react';
import { useRequest } from 'ahooks';
import { FormInstance } from '@arco-design/web-react';
import { PaginationProps } from '@arco-design/web-react';
import { SorterInfo } from '@arco-design/web-react/lib/Table/interface';

export interface UseWorkflowTableOptions<TData, TParams> {
  /** 服务函数，用于请求数据 */
  service: (params: TParams) => Promise<{
    data?: {
      items: TData[];
      total: number;
      page: number;
      page_size: number;
    };
  }>;
  /** 表单实例 */
  form?: FormInstance;
  /** 默认每页条数 */
  defaultPageSize?: number;
  /** 手动触发请求 */
  manual?: boolean;
  /** 依赖项数组 */
  deps?: any[];
  /** 格式化搜索参数 */
  formatParams?: (
    formValues: any,
    pagination: PaginationProps,
    sorter?: SorterInfo
  ) => TParams;
}

export interface UseWorkflowTableReturn<TData> {
  /** 表格数据 */
  data: TData[];
  /** 加载状态 */
  loading: boolean;
  /** 分页配置 */
  pagination: PaginationProps;
  /** 刷新数据 */
  refresh: () => void;
  /** 提交搜索（重置到第一页） */
  submit: () => void;
  /** 重置搜索 */
  reset: () => void;
  /** 表格变化处理器 */
  onChange: (pagination: any, sorter?: any) => void;
}

/**
 * 自定义hook，用于封装工作流表格的数据请求、分页、排序等逻辑
 */
export function useWorkflowTable<TData = any, TParams = any>(
  options: UseWorkflowTableOptions<TData, TParams>
): UseWorkflowTableReturn<TData> {
  const {
    service,
    form,
    defaultPageSize = 10,
    manual = false,
    deps = [],
    formatParams
  } = options;

  const [pagination, setPagination] = useState<PaginationProps>({
    current: 1,
    pageSize: defaultPageSize,
    total: 0
  });

  const [sorter, setSorter] = useState<SorterInfo>();
  const isFirstMount = useRef(true);

  // 构建请求参数
  const buildParams = useCallback(
    (page?: number, pageSize?: number, currentSorter?: SorterInfo) => {
      const formValues = form?.getFieldsValue() || {};
      const currentPage = page ?? pagination.current;
      const currentPageSize = pageSize ?? pagination.pageSize;
      const currentSorterValue = currentSorter ?? sorter;

      if (formatParams) {
        return formatParams(
          formValues,
          {
            current: currentPage,
            pageSize: currentPageSize
          } as PaginationProps,
          currentSorterValue
        );
      }

      return {
        ...formValues,
        page: currentPage,
        page_size: currentPageSize,
        ...(currentSorterValue && {
          orders: [
            {
              asc: currentSorterValue.direction === 'ascend',
              column: currentSorterValue.field as string
            }
          ]
        })
      } as TParams;
    },
    [form, pagination.current, pagination.pageSize, sorter, formatParams]
  );

  // 请求数据
  const { data, loading, run } = useRequest(
    async () => {
      const params = buildParams();
      const result = await service(params);
      return result;
    },
    {
      manual
    }
  );

  // 当分页、排序或依赖项变化时重新请求
  useEffect(() => {
    // 如果是首次挂载且manual=false，useRequest已经自动执行，不需要再次执行
    if (isFirstMount.current) {
      isFirstMount.current = false;
      if (manual) {
        // manual=true时，首次挂载不执行，等待手动触发
        return;
      }
      // manual=false时，useRequest已经自动执行，这里不需要再次执行
      return;
    }
    // 非首次挂载时，依赖项变化才执行
    if (!manual) {
      run();
    }
  }, [pagination.current, pagination.pageSize, sorter, ...deps, run, manual]);

  // 更新分页数据
  const updatePagination = useCallback((page: number, pageSize?: number) => {
    setPagination((prev) => ({
      ...prev,
      current: page,
      pageSize: pageSize ?? prev.pageSize
    }));
  }, []);

  // 表格变化处理器
  const onChange = useCallback(
    (newPagination: PaginationProps, newSorter?: SorterInfo) => {
      if (newSorter !== undefined) {
        setSorter(newSorter);
        setPagination((prev) => ({ ...prev, current: 1 }));
        return;
      }

      if (
        newPagination.current !== pagination.current ||
        newPagination.pageSize !== pagination.pageSize
      ) {
        updatePagination(newPagination.current || 1, newPagination.pageSize);
      }
    },
    [pagination.current, pagination.pageSize, updatePagination]
  );

  // 提交搜索（重置到第一页）
  const submit = useCallback(() => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    setSorter(undefined);
    if (!manual) {
      run();
    }
  }, [run, manual]);

  // 重置搜索
  const reset = useCallback(() => {
    form?.resetFields();
    setPagination({
      current: 1,
      pageSize: defaultPageSize,
      total: 0
    });
    setSorter(undefined);
    if (!manual) {
      run();
    }
  }, [form, defaultPageSize, run, manual]);

  // 刷新数据
  const handleRefresh = useCallback(() => {
    if (!manual) {
      run();
    }
  }, [run, manual]);

  // 更新分页总数
  useEffect(() => {
    if (data?.data) {
      setPagination((prev) => ({
        ...prev,
        total: data.data!.total,
        current: data.data!.page,
        pageSize: data.data!.page_size
      }));
    }
  }, [data?.data]);

  return {
    data: data?.data?.items || [],
    loading,
    pagination: {
      ...pagination,
      showTotal: true,
      showJumper: true,
      sizeCanChange: true,
      pageSizeChangeResetCurrent: true
    },
    refresh: handleRefresh,
    submit,
    reset,
    onChange
  };
}
