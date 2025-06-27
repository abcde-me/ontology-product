import { Pagination, Table, Tooltip } from '@arco-design/web-react';
import { IconExclamationCircle } from '@arco-design/web-react/icon';
import React from 'react';
enum StatusType {
  SYCCESS = '成功',
  FAIL = '失败'
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
      dataIndex: 'filed',
      width: 500,
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
          <div style={{ margin: '0px 3px 0px 5px' }}>{item.status}</div>
          {item.status == StatusType.FAIL && (
            <Tooltip mini content="失败原因">
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
      dataIndex: 'type'
    },
    {
      title: '开始时间',
      render: (_, item) => <div>{item.create_time}</div>,
      sorter: (a, b) => a.create_time - b.create_time
    },
    {
      title: '结束时间',
      render: (_, item) => <div>{item.update_time}</div>,
      sorter: (a, b) => a.update_time - b.update_time
    }
  ];
  const data = [
    {
      key: '1',
      filed: '文件名',
      status: '失败',
      type: 'pdf',
      create_time: '2',
      update_time: '1'
    },
    {
      key: '2',
      filed: '文件名',
      status: '成功',
      type: 'pdf',
      create_time: '4',
      update_time: '3'
    }
  ];
  const handlePageChange = () => {
    console.log(123);
  };
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}
    >
      <Table
        columns={columns}
        data={data}
        style={{ padding: '16px', width: '100%' }}
        border={false}
        pagination={false}
      />
      <Pagination
        sizeOptions={[1, 5, 10, 20]}
        showTotal
        total={data.length}
        showJumper
        sizeCanChange
        style={{ margin: '20px 30px' }}
        onChange={handlePageChange}
      />
    </div>
  );
};
export default AccessTable;
