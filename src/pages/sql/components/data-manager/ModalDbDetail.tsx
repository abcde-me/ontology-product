import React from 'react';
import {
  DatePicker,
  Form,
  Input,
  Modal,
  Popover,
  Table,
  TableColumnProps
} from '@arco-design/web-react';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import { DbTableListParamss, getDbItemList } from '@/api/dataCatalog';
import { formatDateTime } from '../../utils';
import getLabelByValue from '@/utils/getLabelByValue';
import dayjs from 'dayjs';

const FormItem = Form.Item;

const defaultfileTypeList = [
  {
    label: 'MySQL',
    text: 'MySQL',
    value: 'mysql'
  },
  {
    label: 'PostgreSQL',
    text: 'PostgreSQL',
    value: 'postgresql'
  }
];

/** 数据库详情 弹框 */
const ModalDbDetail = ({ dbDetailVisible, fromOrigin, closeDbDetail }) => {
  return (
    <Modal
      title="数据库详情"
      style={{ width: 960 }}
      visible={dbDetailVisible}
      footer={null}
      onCancel={closeDbDetail}
    >
      <div className="pb-[16px]">
        <TableList key={fromOrigin.database} fromOrigin={fromOrigin} />
      </div>
    </Modal>
  );
};

export default ModalDbDetail;

const TableList = (props) => {
  const { fromOrigin } = props;

  const columns: TableColumnProps[] = [
    {
      title: 'ID',
      dataIndex: 'table_id',
      width: 60
    },
    {
      title: '表名',
      dataIndex: 'table_name',
      ellipsis: true,
      width: 174,
      render: (_, record) => (
        <Popover content={record.table_name}>
          <span>{record.table_name}</span>
        </Popover>
      )
    },
    {
      title: '数据库类型',
      dataIndex: 'db_type',
      width: 150,
      filters: defaultfileTypeList,
      render: (_, record) => (
        <div className="flex items-center gap-[6px]">
          <span>{getLabelByValue(defaultfileTypeList, record.db_type)}</span>
        </div>
      )
    },
    {
      title: '表行数',
      width: 88,
      dataIndex: 'cnt_rows',
      render: (_, record) => <div>{record.cnt_rows}</div>
    },
    {
      title: '上传用户',
      dataIndex: 'username',
      ellipsis: true,
      width: 100
    },
    {
      title: '载入开始时间',
      dataIndex: 'start_loading_time',
      width: 180,
      sorter: true,

      sortDirections: ['ascend' as const, 'descend' as const],
      render: (_, record) => formatDateTime(record.start_loading_time)
    },
    {
      title: '连接器名称',
      dataIndex: 'connector_name',
      ellipsis: true,
      render: (_, record) => (
        <EllipsisPopover
          value={record.connector_name}
          isEdit={false}
          preferTypography
        />
      )
    }
  ];

  const {
    listData,
    pagination,
    loading,
    loadData,
    handleSearchChange,
    handleTableChange
  } = useTableList<{}, DbTableListParamss>({
    initialSearchParams: { ...fromOrigin },
    onRequest: getDbItemList,
    formatSearchParams: (values: any) => {
      const result: any = { ...values };

      // 处理日期时间范围
      if ('datetime_range' in values) {
        // 删除 datetime_range 字段，因为后端不需要这个字段
        delete result.datetime_range;

        const dateRange = values.datetime_range;

        if (dateRange && Array.isArray(dateRange) && dateRange.length === 2) {
          // 验证两个日期都存在且有效
          const startDate = dateRange[0];
          const endDate = dateRange[1];

          if (startDate && endDate) {
            result.start_time = dayjs(startDate).format();
            result.end_time = dayjs(endDate).format();
          } else {
            // 如果日期无效，清除时间字段
            delete result.start_time;
            delete result.end_time;
          }
        } else {
          // 如果 datetime_range 为空数组、null 或 undefined，清除时间字段
          delete result.start_time;
          delete result.end_time;
        }
      }

      return result;
    },
    formatSorter: (sorter: any) => {
      let result = {};
      if (sorter.db_type) {
        result = {
          db_type: sorter.db_type
        };
      }
      return result;
    },
    formatFilter: (filter: any) => {
      let result = {};
      if (filter.field === 'start_loading_time') {
        result = {
          sort_field: filter?.field == undefined ? '' : filter?.field,
          sort_order:
            filter?.direction == undefined
              ? ''
              : filter?.direction == 'ascend'
                ? 'asc'
                : 'desc'
        };
      }
      return result;
    }
  });

  return (
    <div>
      <Form
        autoComplete="off"
        layout="inline"
        onValuesChange={(values: any) => handleSearchChange(values)}
      >
        <FormItem field="search" style={{ marginRight: 12 }}>
          <Input.Search allowClear placeholder="输入表名搜索" />
        </FormItem>
        <FormItem field="datetime_range" style={{ marginRight: 12 }}>
          <DatePicker.RangePicker
            showTime={{
              defaultValue: ['00:00:00', '23:59:59'],
              format: 'HH:mm:ss'
            }}
            format="YYYY-MM-DD HH:mm:ss"
            allowClear={true}
          />
        </FormItem>
      </Form>
      <Table
        style={{
          width: '100%',
          height: '100%'
        }}
        columns={columns}
        data={listData}
        pagination={pagination}
        loading={loading}
        rowKey="table_id"
        onChange={handleTableChange}
        scroll={{ y: 500 }}
      />
    </div>
  );
};

import { useEffect, useState } from 'react';
import { PaginationProps } from '@arco-design/web-react';
import { SorterInfo } from '@arco-design/web-react/es/Table/interface';

interface UseTableListProps<T, U> {
  onRequest?: (params: U) => Promise<ApiRes<any>>;
  initialSearchParams?: U;
  formatFilter?: (filters: Partial<Record<keyof T, string[]>>) => U | {};
  formatSorter?: (sorter: SorterInfo) => U | {};
  formatSearchParams?: (values: U) => U | {};
}

export const useTableList = <T = {}, U = {}>(
  props: UseTableListProps<T, U>
) => {
  const page = 1;
  const page_size = 10;

  const {
    onRequest,
    initialSearchParams,
    formatFilter,
    formatSorter,
    formatSearchParams
  } = props;

  const [loading, setLoading] = useState<boolean>(false);

  const [listData, setListData] = useState<T[]>();

  const [searchParams, setSearchParams] = useState<U>({
    ...initialSearchParams,
    page,
    limit: page_size
  } as U);

  const [pagination, setPagination] = useState<PaginationProps>({
    sizeCanChange: true,
    showTotal: true,
    total: 0,
    pageSize: 10,
    current: 1,
    pageSizeChangeResetCurrent: true
  });

  async function loadData() {
    setLoading(true);

    try {
      const res = await onRequest?.(searchParams);

      setPagination((prev) => ({
        ...prev,
        current: res?.data?.page,
        total: res?.data?.total,
        pageSize: res?.data?.limit
      }));

      setListData((res?.data?.list as T[]) || []);

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
    setSearchParams((prev: any) => {
      return {
        ...(formatSearchParams
          ? formatSearchParams({ ...prev, ...values })
          : { ...prev, ...values })
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
        limit: pagination.pageSize,
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
