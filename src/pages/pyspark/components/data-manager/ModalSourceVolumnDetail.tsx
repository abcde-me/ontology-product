import React, { useEffect, useState, useRef } from 'react';
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
import getFileIcon from '@/components/file-icon';
import { getSourceFileTypeList } from '@/api/dataCatalog';
import { getSourceDataFileList } from '@/api/dataCatalog';

const FormItem = Form.Item;

const formatDateTime = (dateTimeString: string): string => {
  try {
    const date = new Date(dateTimeString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    return dateTimeString; // 如果格式化失败，返回原字符串
  }
};

const formatFileSize = (size: number): string => {
  if (size < 1024) {
    return `${size}B`;
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)}KB`;
  } else if (size < 1024 * 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(2)}MB`;
  } else {
    return `${(size / 1024 / 1024 / 1024).toFixed(2)}GB`;
  }
};

/** 数据卷详情 弹框 */
const ModalVolumnDetail = ({
  volumnDetailVisible,
  selectedVolumn,
  closeVolumnDetail
}) => {
  return (
    <Modal
      title="数据卷详情"
      style={{ width: 960 }}
      visible={volumnDetailVisible}
      footer={null}
      onCancel={closeVolumnDetail}
    >
      <FileList fromId={String(selectedVolumn.id)} />
    </Modal>
  );
};

export default ModalVolumnDetail;

const FileList = (props) => {
  const { fromId } = props;
  const inputRef = useRef<any>(null);

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
      <Form autoComplete="off" layout="inline">
        <FormItem field="file_name" style={{ marginRight: 12 }}>
          <Input.Search
            ref={inputRef}
            onSearch={(value) => {
              handleValuesChange({ file_name: value });
            }}
            onClear={() => {
              handleValuesChange({ file_name: '' });
            }}
            allowClear
            placeholder="输入文件名搜索"
          />
        </FormItem>
        <FormItem field="datetime_range" style={{ marginRight: 12 }}>
          <DatePicker.RangePicker
            showTime={{
              defaultValue: ['00:00:00', '23:59:59'],
              format: 'HH:mm:ss'
            }}
            format="YYYY-MM-DD HH:mm:ss"
            onChange={(date) => {
              handleValuesChange({ datetime_range: date });
            }}
            onSelect={() => {}}
            onOk={() => {}}
            allowClear={true}
          />
        </FormItem>
      </Form>
      <Table
        style={{
          width: '100%',
          height: '100%',
          marginBottom: 28
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

const defaultfileTypeList = [
  { text: 'pdf', value: 'pdf' },
  { text: 'txt', value: 'txt' },
  { text: 'doc', value: 'doc' }
];

const defaultSearchParams = {
  page: 1,
  page_size: 10,
  file_name: ''
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
    sizeOptions: [10, 20, 50, 100],
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
      title: '文件名',
      dataIndex: 'file_name',
      ellipsis: true,
      width: 174,
      render: (_, record) => (
        // 产品需求：文件名提示常驻
        <Popover content={record.file_sub_path}>
          <span>{record.file_name}</span>
        </Popover>
      )
    },
    {
      title: '文件类型',
      dataIndex: 'file_type',
      width: 120,
      filters: fileTypeList,
      render: (_, record) => (
        <div className="flex items-center gap-[6px]">
          {getFileIcon(record.file_type)}
          <span>{record.file_type}</span>
        </div>
      )
    },
    {
      title: '文件大小',
      width: 88,
      dataIndex: 'file_size',
      render: (_, record) => <div>{formatFileSize(record.file_size)}</div>
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
    async function loadFileTypeList() {
      try {
        const res = await getSourceFileTypeList({
          id: fromId
        });

        if (res?.status !== 200 || !Array.isArray(res?.data)) {
          return;
        }

        setFileTypeList(
          res.data.map((type) => ({
            text: type,
            value: type
          }))
        );
      } catch (error) {
        console.error('获取文件类型列表失败:', error);
      }
    }

    loadFileTypeList();
  }, []);

  useEffect(() => {
    async function loadListData() {
      const { pagination, sorter, filters } = searchParams;

      const targetParams: any = {
        data_path_id: Number(fromId) || 0,
        page: pagination?.current || 1,
        page_size: pagination?.pageSize || 10,
        file_name: searchParams.file_name || '',
        file_type: searchParams.file_type || [],
        start: searchParams.datetime_range
          ? searchParams.datetime_range[0]
          : undefined,
        end: searchParams.datetime_range
          ? searchParams.datetime_range[1]
          : undefined,
        sort: searchParams.sort
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

  function handleTableChange(pagination: any, sorter: any, filters: any) {
    setSearchParams((prev) => {
      return {
        ...prev,
        pagination,
        ...(filters
          ? {
              file_type: filters.file_type
            }
          : {}),
        ...(sorter
          ? {
              sort: sorter.direction === 'ascend' ? 'asc' : 'desc'
            }
          : {})
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
