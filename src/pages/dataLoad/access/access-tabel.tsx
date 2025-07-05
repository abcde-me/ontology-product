import { getLoadRecordLists } from '@/api/loadApi';
import { Pagination, Table, Tooltip } from '@arco-design/web-react';
import { IconExclamationCircle } from '@arco-design/web-react/icon';
import React, { useEffect, useState } from 'react';
import { RecordingType } from '../type';
import './index.css';
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
  const columns = [
    {
      title: '文件名',
      dataIndex: 'file_name',
      width: 420,
      ellipsis: true
    },
    {
      title: '状态',
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
      )
    },
    {
      title: '类型',
      dataIndex: 'file_type'
    },
    {
      title: '开始时间',
      render: (_, item) => <div>{item.start_time}</div>,
      sorter: (a, b) => a.start_time - b.start_time
    },
    {
      title: '结束时间',
      render: (_, item) => <div>{item.end_time}</div>,
      sorter: (a, b) => a.end_time - b.end_time
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
  const getRecordingList = async () => {
    try {
      setLoading(true);
      const res = await getLoadRecordLists({
        page: current,
        page_size: pageSize,
        record_id: props.records_id,
        // record_id: 'Job20250703-jtsl4VBQFfF29HuQ',
        file_name: props.searchValue
      });
      if (res.message == 'ok') {
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
  }, [current, pageSize, props.searchValue]);
  return (
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
      />
      <Pagination
        sizeOptions={[1, 5, 10, 20]}
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
  );
};
export default AccessTable;
