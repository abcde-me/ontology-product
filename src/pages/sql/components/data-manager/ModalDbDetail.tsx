import React, { useEffect, useState } from 'react';
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
import { getSourceDataFileList } from '@/api/dataCatalog';
import { formatDateTime } from '../../utils';
// import { SqlIndexStore, useSqlIndexStore } from '../store';

const FormItem = Form.Item;

// interface ModalTableListProps {
//     visible?: boolean,
//     onClose?: () => void
// }

/** 数据库详情 弹框 */
const ModalDbDetail = ({ dbDetailVisible, selectedDbId, closeDbDetail }) => {
  return (
    <Modal
      title="数据库详情"
      style={{ width: 960 }}
      visible={dbDetailVisible}
      footer={null}
      onCancel={closeDbDetail}
    >
      <div className="pb-[16px]">
        <TableList fromId={selectedDbId} />
      </div>
    </Modal>
  );
};

export default ModalDbDetail;

const TableList = (props) => {
  const { fromId } = props;

  const {
    columns,
    listData,
    pagination,
    loading,
    handleValuesChange,
    handleTableChange
  } = useTableList({ fromId });

  return (
    <div>
      <Form
        autoComplete="off"
        layout="inline"
        onValuesChange={handleValuesChange}
      >
        <FormItem field="file_name" style={{ marginRight: 12 }}>
          <Input.Search allowClear placeholder="输入表名搜索" />
        </FormItem>
        <FormItem field="datetime_range" style={{ marginRight: 12 }}>
          <DatePicker.RangePicker
            showTime={{
              defaultValue: ['00:00:00', '23:59:59'],
              format: 'HH:mm:ss'
            }}
            format="YYYY-MM-DD HH:mm:ss"
            onChange={() => {}}
            onSelect={() => {}}
            onOk={() => {}}
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
        rowKey="id"
        onChange={handleTableChange}
        scroll={{ y: 500 }}
      />
    </div>
  );
};

const defaultfileTypeList = [{ text: 'Mysql', value: 'Mysql' }];

const defaultSearchParams = {
  page: 1,
  page_size: 10,
  file_name: '',
  data_path_id: 1392
};

const useTableList = (props) => {
  const { fromId } = props;

  const [searchParams, setSearchParams] = useState<
    SourceDataFileQueryParams | any
  >({ ...defaultSearchParams, fromId });

  const [fileTypeList, setFileTypeList] =
    useState<{ text: string; value: string }[]>(defaultfileTypeList);

  const [listData, setListData] = useState<ListDataItem[]>([]);
  const [pagination, setPagination] = useState({
    sizeCanChange: true,
    showTotal: true,
    total: 0,
    pageSize: 10,
    current: 1,
    pageSizeChangeResetCurrent: true
  });
  const [loading, setLoading] = useState<boolean>(false);

  const columns: TableColumnProps[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60
    },
    {
      title: '表名',
      dataIndex: 'file_name',
      ellipsis: true,
      width: 174,
      render: (_, record) => (
        <Popover content={record.file_sub_path}>
          <span>{record.file_name}</span>
        </Popover>
      )
    },
    {
      title: '数据库类型',
      dataIndex: 'file_type',
      width: 150,
      filters: fileTypeList,
      render: (_, record) => (
        <div className="flex items-center gap-[6px]">
          <span>{record.file_type}</span>
        </div>
      )
    },
    {
      title: '表行数',
      width: 88,
      dataIndex: 'file_size',
      render: (_, record) => <div>{record.file_size}</div>
    },
    {
      title: '上传用户',
      dataIndex: 'upload_user',
      ellipsis: true,
      width: 100
    },
    {
      title: '载入开始时间',
      dataIndex: 'task_load_start_time',
      width: 180,
      sorter: true,

      sortDirections: ['ascend' as const, 'descend' as const],
      render: (_, record) => formatDateTime(record.task_load_start_time)
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

  useEffect(() => {
    async function loadListData() {
      const { pagination, sorter, filters } = searchParams;

      // console.log('loadListData searchParams:', searchParams);

      const targetParams: any = {
        data_path_id: fromId || 0,
        page: pagination?.current || 1,
        page_size: pagination?.pageSize || 10,
        file_name: searchParams.file_name || '',
        file_type: sorter?.file_type || [],
        start: searchParams.datetime_range
          ? searchParams.datetime_range[0]
          : undefined,
        end: searchParams.datetime_range
          ? searchParams.datetime_range[1]
          : undefined,
        sort:
          filters?.direction == undefined
            ? ''
            : filters?.direction == 'ascend'
              ? 'asc'
              : 'desc',
        sort_by: filters?.field == undefined ? '' : filters?.field
      };

      setLoading(true);

      try {
        const res = await getSourceDataFileList(targetParams);
        setPagination((prev) => ({
          ...prev,
          current: res.data?.page,
          pageSize: res.data?.page_size,
          total: res.data?.total
        }));
        setListData(res.data?.items);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error('获取文件列表失败:', error);
      }
    }

    setListData([]);
    loadListData();
  }, [searchParams, fromId]);

  function handleValuesChange(values: any) {
    // console.log('Form values changed:', values);

    setSearchParams((prev) => {
      return {
        ...prev,
        ...values
      };
    });
  }

  function handleTableChange(pagination: any, filters: any, sorter: any) {
    // console.log('Table change:', pagination, filters, sorter);

    setSearchParams((prev) => {
      return {
        ...prev,
        pagination,
        filters,
        sorter
      };
    });
  }

  // const handleTableChange = useCallback(onTableChange, []);

  return {
    handleValuesChange,
    columns,
    listData,
    pagination,
    handleTableChange,
    loading
  };
};

interface SourceDataFileQueryParams {
  page: number;
  page_size: number;
  file_name?: string;
  data_path_id?: number;
  start?: string;
  end?: string;
  file_type?: Array<string>;
  sort_field?: string;
  sort_order?: string;
}

interface ListDataItem {
  id: number;
  content: string;
  type: string;
  createdAt: string;
  file: string;
  workflowId: string;
  full_path?: string;
}
