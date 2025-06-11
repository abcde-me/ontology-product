import Button from '@/components/button';
import {
  Input,
  Message,
  Pagination,
  Popconfirm,
  Table
} from '@arco-design/web-react';
import React, { useRef, useState } from 'react';
import './index.css';
import { IconPlus } from '@arco-design/web-react/icon';
import ModalDetail from './modal';
const InputSearch = Input.Search;

export default function Connection() {
  const formatDate = (timestamp) => {
    const date = new Date(Number(timestamp));
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // 返回格式化的字符串，例如：YYYY-MM-DD HH:MM:SS
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };
  // 子组件实例
  const childRef = useRef();
  // 连接器配置项
  const columns: any = [
    {
      title: '连接器名称',
      dataIndex: 'name',
      width: 230,
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 130,
      render: (_, item) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: '5px',
              height: '5px',
              backgroundColor: item.status ? 'green' : 'red',
              borderRadius: '50%',
              marginRight: '5px'
            }}
          ></div>
          <div>{item.status ? '已连接' : '已断开'}</div>
        </div>
      ),
      filters: [
        {
          text: '已断开',
          value: false
        },
        {
          text: '已连接',
          value: true
        }
      ],
      onFilter: (value, row) => row.status == value
    },
    {
      title: '数据源类型',
      dataIndex: 'type',
      width: 150,
      render: (_, item) => (
        <div>{item.type == 'hdfs' ? 'HDFS' : '对象存储'}</div>
      ),
      filters: [
        {
          text: '对象存储',
          value: 's3'
        },
        {
          text: 'HDFS',
          value: 'hdfs'
        }
      ],
      onFilter: (value, row) => row.type == value
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      width: 120
    },
    {
      title: '创建时间',
      width: 200,
      dataIndex: 'created_at',
      render: (_, item) => (
        <div className="fontMM">{formatDate(item.created_at)}</div>
      ),
      sorter: (a, b) => a.created_at.length - b.created_at.length
    },
    {
      title: '更新时间',
      width: 200,
      dataIndex: 'updated_at',
      render:((_,item)=>(
        <div className='fontMM'>
          {formatDate(item.updated_at)}
        </div>
      ))
    },
    {
      title: '操作',
      dataIndex: 'created_at',
      width: 110,
      render: (_, record) => (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="hover" onClick={viewDetailHan}>
            详情
          </span>
          <span className="hover">编辑</span>
          <Popconfirm
            focusLock
            title="删除该连接器"
            content="删除该连接器后，也会终止正在运行的数据载入任务(包括单次载入和周期性载入任务)，是否要继续操作?"
            onOk={() => {
              DeleteMethod(record.id);
              Message.info({
                content: '删除成功'
              });
            }}
            onCancel={() => {
              Message.error({
                content: '删除失败，请重试'
              });
            }}
          >
            <span className="hover">删除</span>
          </Popconfirm>
        </div>
      )
    }
  ];
  // 点击删除按钮执行的方法
  const DeleteMethod = (id: any) => {
    const NewConnectionData = ConnectionData.filter((item: any) => {
      return item.id !== id;
    });
    setConnectionData(NewConnectionData);
  };
  // 点击查看执行的方法
  const viewDetailHan = () => {
    if (childRef.current) {
      childRef.current.displayDetailHan();
    }
  }
  const [ConnectionData, setConnectionData] = useState(
    [
      {
        id: "1",
        name: '文案内容连接器名称连接器名称连接器名称连接器名称连接器名称连接器名称连接器名称连接器名称连接器名称',
        status: false,
        type: 's3',
        creator: '张三',
        created_at: '1749627860785',
        updated_at: '17123456791'
      },
      {
        id: "2",
        name: '文案内容',
        status: true,
        type: 's3',
        creator: '张三',
        created_at: '17123456782',
        updated_at: '17123456792'
      },
      {
        id: "3",
        name: '文案内容',
        status: true,
        type: 's3',
        creator: '张三',
        created_at: '17123456783',
        updated_at: '17123456793'
      },
      {
        id: "4",
        name: '文案内容',
        status: true,
        type: 'hdfs',
        creator: '张三',
        created_at: '17123456784',
        updated_at: '17123456794'
      },
      {
        id: "5",
        name: '文案内容',
        status: true,
        type: 's3',
        creator: '张三',
        created_at: '17123456785',
        updated_at: '17123456795'
      },
      {
        id: "6",
        name: '文案内容',
        status: true,
        type: 's3',
        creator: '张三',
        created_at: '17123456786',
        updated_at: '171234567976'
      },
      {
        id: "7",
        name: '文案内容',
        status: true,
        type: 'hdfs',
        creator: '张三',
        created_at: '17123456788',
        updated_at: '17123456797'
      },
      {
        id: "8",
        name: '文案内容',
        status: true,
        type: 's3',
        creator: '张三',
        created_at: '17123456789',
        updated_at: '17123456798'
      },
      {
        id: "9",
        name: '文案内容',
        status: true,
        type: 's3',
        creator: '张三',
        created_at: '17123456780',
        updated_at: '17123456799'
      },
      {
        id: "10",
        name: '文案内容',
        status: true,
        type: 's3',
        creator: '张三',
        created_at: '171234567811',
        updated_at: '17123456790'
      },
      {
        id: "11",
        name: '文案内容',
        status: true,
        type: 's3',
        creator: '张三',
        created_at: '171234567812',
        updated_at: '171234567911'
      },
    ]
  )
  // 分页的第几页
  const [current, SetCurrent] = useState(1);
  // 每页展示数据的数据量
  const [pageSize, SetPageSize] = useState(10);
  // 改变数据的逻辑
  const handlePageChange = (current: number, pageSize: number) => {
    // SetCurrent(current);
    // SetPageSize(pageSize);
    console.log(current);
    console.log(pageSize);
  };
  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        margin: '30px',
        borderRadius: '10px'
      }}
      onChange={handlePageChange}
      sizeOptions={[10, 20, 50, 100]}
      showTotal
      total={ConnectionData.length}
      showJumper
      sizeCanChange
      style={{ marginBottom: 20, justifyItems: 'end' }}
    />
    {/* 详情逻辑 */}
    <ModalDetail ref={childRef} />
  </div>
}
