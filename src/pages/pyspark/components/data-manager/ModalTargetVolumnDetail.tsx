import React, { useEffect, useState } from 'react';
import {
  DatePicker,
  Form,
  Input,
  Modal,
  PaginationProps,
  Popover,
  Select,
  Table,
  TableColumnProps
} from '@arco-design/web-react';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import getFileIcon from '@/components/file-icon';
// import { getTargetFileTypeList } from '@/api/dataCatalog';
// import { getSourceDataFileList } from '@/api/dataCatalog';
import { formatTime } from '@/utils/format';
import {
  getTargetCatalogFileList,
  GetTargetCatalogFileListItem,
  getTargetDataFileList,
  getTargetFileTypeList
} from '@/api/dataCatalog';

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

/** 数据卷详情 弹框 */
const ModalVolumnDetail = ({
  volumnDetailVisible,
  selectedVolumn,
  closeVolumnDetail
}) => {
  console.log('selectedVolumn', selectedVolumn);
  return (
    <Modal
      title="数据卷详情"
      style={{ width: 960 }}
      visible={volumnDetailVisible}
      footer={null}
      onCancel={closeVolumnDetail}
    >
      <FileList volumn={selectedVolumn} />
    </Modal>
  );
};

export default ModalVolumnDetail;

const FileList = (props) => {
  const { volumn } = props;
  const [searchType, setSearchType] = useState('content');

  const handleSearchTypeChange = (value) => {
    setSearchType(value);
  };

  const {
    columns,
    listData,
    pagination,
    loading,
    handleValuesChange,
    handleTableChange
  } = useTableList({ volumn });

  return (
    <div>
      <Form autoComplete="off" layout="inline">
        <FormItem
          field="['file_name', 'search_type']"
          style={{ marginRight: 12 }}
        >
          <Input.Group compact>
            <Select
              style={{ width: '100px' }}
              value={searchType}
              onChange={handleSearchTypeChange}
            >
              <Select.Option key="数据内容" value="content">
                数据内容
              </Select.Option>
              <Select.Option key="ID" value="id">
                ID
              </Select.Option>
            </Select>
            <Input.Search
              onSearch={(value) => {
                if (searchType === 'content') {
                  handleValuesChange({ search_content: value, search_id: '' });
                } else if (searchType === 'id') {
                  handleValuesChange({ search_id: value, search_content: '' });
                }
              }}
              onClear={() => {
                handleValuesChange({ search_content: '', search_id: '' });
              }}
              allowClear
              placeholder={`输入ID/关键字搜索`}
            />
          </Input.Group>
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
  const { volumn } = props;
  const [searchParams, setSearchParams] = useState<
    SourceDataFileQueryParams | any
  >({
    ...defaultSearchParams,
    path_id: volumn.id,
    full_path: volumn.full_path ?? ''
  });
  const [fileTypeList, setFileTypeList] =
    useState<{ text: string; value: string }[]>(defaultfileTypeList);
  const [listData, setListData] = useState<GetTargetCatalogFileListItem[]>([]);
  const [pagination, setPagination] = useState({
    sizeCanChange: true,
    showTotal: true,
    total: 0,
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    current: 1,
    pageSizeChangeResetCurrent: true
  });
  const [loading, setLoading] = useState<boolean>(false);
  const columns: TableColumnProps[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80
    },
    {
      title: '数据内容',
      dataIndex: 'short_content',
      ellipsis: true,
      width: 300,
      render: (_, record) => (
        <EllipsisPopover
          value={record.short_content}
          isEdit={false}
          preferTypography
        />
      )
    },
    {
      title: '生成时间',
      dataIndex: 'generated_at',
      width: 180,
      sorter: true,
      render: (_, record) => formatTime(record.generated_at)
    },
    {
      title: '原文件类型',
      dataIndex: 'file_type',
      filters: fileTypeList, // 使用动态获取的文件类型筛选器
      width: 134,
      render: (_, record) => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {getFileIcon(record.type)}
          <span>{record.file_type}</span>
        </div>
      )
    }
  ];

  useEffect(() => {
    async function loadFileTypeList() {
      try {
        const res = await getTargetFileTypeList();

        if (res?.status !== 200 || !Array.isArray(res?.data?.dst_file_type)) {
          return;
        }

        const result = res.data.dst_file_type.map((type) => ({
          text: type,
          value: type
        }));

        setFileTypeList((prev) => [...prev, ...result]);
      } catch (error) {
        console.error('获取文件类型列表失败:', error);
      }
    }

    loadFileTypeList();
  }, []);

  useEffect(() => {
    async function loadListData() {
      setLoading(true);

      try {
        const res = await getTargetDataFileList(searchParams);

        if (res?.status !== 200) {
          setLoading(false);
          setListData([]);
          return;
        }

        setPagination((prev) => ({
          ...prev,
          current: res.data?.page,
          pageSize: res.data?.page_size,
          total: res.data?.total
        }));
        setListData(res.data?.list);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error('获取文件列表失败:', error);
      }
    }

    setListData([]);
    loadListData();
  }, [searchParams, volumn.id, volumn.full_path]);

  function handleValuesChange(values: any) {
    setSearchParams((prev) => {
      return {
        ...prev,
        ...values
      };
    });
  }

  function handleTableChange(
    pagination: PaginationProps,
    sorter: any,
    filters: any
  ) {
    setSearchParams((prev) => {
      return {
        ...prev,
        page: pagination.current,
        page_size: pagination.pageSize,
        ...(filters
          ? {
              file_type: filters.file_type
            }
          : {}),
        ...(sorter
          ? {
              sort_field: sorter.field,
              sort_order: sorter.direction === 'ascend' ? 'asc' : 'desc'
            }
          : {})
      };
    });
  }

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
  full_path: string;
  start_time: string;
  end_time: string;
  search_content: string;
  search_id: number;
  limit: number;
  file_type: Array<string>;
  sort_field?: string;
  sort_order?: string;
  path_id: string;
}

interface ListDataItem {
  id: number;
  generated_at: string;
  FileName: string;
  file_type: string;
  full_path: string;
  short_content: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  extras: {
    ds_workflow_id: string;
    file_name: string;
    file_size: string;
    workflow_uuid: string;
  };
  perms: string[];
}
