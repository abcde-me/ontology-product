import { getLoadRecordLists } from '@/api/loadApi';
import {
  Input,
  Pagination,
  Popover,
  Table,
  Tooltip
} from '@arco-design/web-react';
import { IconExclamationCircle } from '@arco-design/web-react/icon';
import React, { useEffect, useState } from 'react';
import { RecordingType } from '../type';
import './index.css';
import { RunState } from '../list/list';
const InputSearch = Input.Search;
enum StatusType {
  SYCCESS = 'succeed',
  FAIL = 'fail'
}
const STATUSTYPEARR = {
  [StatusType.SYCCESS]: {
    txt: '成功',
    color: 'green'
  },
  [StatusType.FAIL]: {
    txt: '失败',
    color: 'red'
  }
};

const AccessTable = (props) => {
  // 输入框的默认状态
  const [searchValue, setSearchValue] = useState('');
  const columns = [
    {
      title: '文件名',
      width: 400,
      ellipsis: true,
      render: (_, item) => {
        return (
          <Popover position="tl" content={item.file_name}>
            {item.file_name}
          </Popover>
        );
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (_, item) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background:
                item.status == StatusType.FAIL
                  ? STATUSTYPEARR[StatusType.FAIL].color
                  : STATUSTYPEARR[StatusType.SYCCESS].color
            }}
          ></div>
          <div style={{ margin: '0px 3px 0px 5px' }}>
            {item.status == StatusType.FAIL
              ? STATUSTYPEARR[StatusType.FAIL].txt
              : STATUSTYPEARR[StatusType.SYCCESS].txt}
          </div>
          {item.status == StatusType.FAIL && (
            <Tooltip mini content={item.error_message}>
              <IconExclamationCircle
                style={{ color: 'orange', fontSize: '17px' }}
              />
            </Tooltip>
          )}
        </div>
      ),
      filters: [
        {
          text: '成功',
          value: RunState.SUCCEED
        },
        {
          text: '失败',
          value: RunState.FAILED
        }
      ]
    },
    {
      title: '类型',
      dataIndex: 'file_type'
    },
    {
      title: '开始时间',
      dataIndex: 'start_time',
      render: (_, item) => <div>{item.start_time}</div>,
      sorter: (a, b) => a.start_time - b.start_time,
      width: 230
    },
    {
      title: '结束时间',
      dataIndex: 'end_time',
      render: (_, item) => <div>{item.end_time}</div>,
      sorter: (a, b) => a.end_time - b.end_time,
      width: 230
    }
  ];
  const [data, setData] = useState<RecordingType[] | null>([
    // {
    //   id: 1,
    //   file_name: 'string',
    //   status: 'string',
    //   file_type: 'string',
    //   start_time: 'string',
    //   end_time: 'string',
    //   error_message: 'string',
    //   connector_id: 1,
    //   data_path_id: 1,
    //   execution_id: 'string',
    //   file_size: 1,
    //   hash_code: 'string',
    //   task_id: 1,
    //   upload_user_name: 'string',
    // }
  ]);
  const handlePageChange = (val) => {
    setCurrent(val);
  };
  // 默认表格的loading状态
  const [loading, setLoading] = useState(false);
  // 当前页数
  const [current, setCurrent] = useState(1);
  // 每页显示几条
  const [pageSize, setPageSize] = useState(10);
  // 总条数
  const [total, setTotal] = useState(0);
  // 默认筛选对象
  const [RecordingObject, setRecordingObject] = useState({});
  const RecordingChange = (sorter, filters) => {
    const recoObj = {
      status: filters.status ? filters.status : [],
      sort:
        sorter.direction == 'ascend'
          ? 'asc'
          : sorter.direction == 'descend'
            ? 'desc'
            : '',
      order_by: sorter.field == undefined ? '' : sorter.field
    };
    setRecordingObject(recoObj);
  };
  const getRecordingList = async () => {
    try {
      setLoading(true);
      const res = await getLoadRecordLists({
        page: current,
        page_size: pageSize,
        execution_id: props.records_id,
        file_name: searchValue.trim(),
        ...RecordingObject
      });
      if (res.code == '' && res.status == 200) {
        setTotal(res.data.total);
        setData(res.data.items);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getRecordingList();
  }, [current, pageSize, RecordingObject]);
  return (
    <div>
      <InputSearch
        placeholder="搜索文件名"
        style={{ width: 200, marginLeft: '17px' }}
        onPressEnter={(e) => {
          getRecordingList();
        }}
        onChange={(value) => {
          setSearchValue(value);
        }}
      />
      <div
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}
      >
        <Table
          columns={columns}
          data={data ?? []}
          style={{ padding: '16px', width: '100%' }}
          border={false}
          pagination={false}
          rowKey={(record) => record.id}
          loading={loading}
          onChange={(pagination, filters, sorter) => {
            RecordingChange(filters, sorter);
          }}
        />
        <Pagination
          sizeOptions={[10, 20, 50, 100]}
          showTotal
          total={total}
          showJumper
          sizeCanChange
          style={{ margin: '20px 30px' }}
          onChange={(val) => {
            handlePageChange(val);
          }}
          onPageSizeChange={(pageSize) => {
            setPageSize(pageSize);
            setCurrent(1);
          }}
        />
      </div>
    </div>
  );
};
export default AccessTable;
