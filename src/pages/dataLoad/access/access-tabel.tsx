import item from '@/components/chat-with-history/sidebar/item';
import { Table, Tooltip } from '@arco-design/web-react';
import { IconExclamationCircle } from '@arco-design/web-react/icon';
import React from 'react';
const AccessTable = (props) => {
  const columns = [
    {
      title: '文件名',
      dataIndex: 'filed',
      width: 500
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
              background: item.status == '失败' ? 'red' : 'green'
            }}
          ></div>
          <div style={{ margin: '0px 3px 0px 5px' }}>{item.status}</div>
          {item.status == '失败' && (
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
      render: (_, item) => <div>{item.create_time}</div>
    },
    {
      title: '结束时间',
      render: (_, item) => <div>{item.update_time}</div>
    }
  ];
  const data = [
    {
      key: '1',
      filed: '文件名',
      status: '失败',
      type: 'pdf',
      create_time: '123456789',
      update_time: '123456789'
    },
    {
      key: '2',
      filed: '文件名',
      status: '成功',
      type: 'pdf',
      create_time: '123456789',
      update_time: '123456789'
    }
  ];
  return (
    <Table
      columns={columns}
      data={data}
      style={{ padding: '16px' }}
      border={false}
    />
  );
};
export default AccessTable;
