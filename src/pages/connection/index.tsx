import {
  Input,
  Message,
  Pagination,
  Popconfirm,
  Table,
  Button
} from '@arco-design/web-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import './index.css';
import { IconPlus } from '@arco-design/web-react/icon';
import ModalDetail from './detail-modal';
import AddAndEditModal from './add-edit-modal';
import TimeFormatting from '../../utils/timeFormatting';
import { getConnectionList } from '@/api/connectionApi';

const InputSearch = Input.Search;

export default function Connection() {
  // 显示详情页面的实例子组件实例
  const childRef = useRef(null);
  // 添加编辑弹框的实例
  const addandsetchildRef = useRef(null);
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
              backgroundColor: item.status !== 'connected' ? 'red' : 'green',
              borderRadius: '50%',
              marginRight: '5px'
            }}
          ></div>
          <div>{item.status !== 'connected' ? '已断开' : '已连接'}</div>
        </div>
      ),
      filters: [
        {
          text: '已断开',
          value: 'disconnection'
        },
        {
          text: '已连接',
          value: 'connected'
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
        <div className="fontMM">{TimeFormatting(item.created_at)}</div>
      ),
      sorter: (a, b) => a.created_at.length - b.created_at.length
    },
    {
      title: '更新时间',
      width: 200,
      dataIndex: 'updated_at',
      render: (_, item) => (
        <div className="fontMM">{TimeFormatting(item.updated_at)}</div>
      )
    },
    {
      title: '操作',
      dataIndex: 'created_at',
      width: 110,
      render: (_, record) => (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span
            className="hover"
            onClick={() => {
              viewDetailHan(record);
            }}
          >
            详情
          </span>
          <span
            className="hover"
            onClick={() => {
              childAddAndSetModalHan(record);
            }}
          >
            编辑
          </span>
          <Popconfirm
            focusLock
            title="删除该连接器"
            content="删除该连接器后，也会终止正在运行的数据载入任务(包括单次载入和周期性载入任务)，是否要继续操作?"
            onOk={() => {
              DeleteMethod(record.id);
              Message.success({
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
  const viewDetailHan = (obj) => {
    if (childRef.current) {
      // TODO: ts错误
      // @ts-expect-error
      childRef.current.displayDetailHan(obj);
    }
  };
  const childAddAndSetModalHan = (id) => {
    if (addandsetchildRef.current) {
      // TODO: ts错误
      // @ts-expect-error
      addandsetchildRef.current.displayModalView(id);
    }
  };
  // 搜索框的默认值
  const [searchValue, setSearchValue] = useState('');
  const [ConnectionData, setConnectionData] = useState([
    {
      id: '1',
      name: '唐僧',
      status: 'connected',
      type: 's3',
      config: {
        endpoint: 'https://s3.amazonaws.com',
        access_key: 'AKIAxxxxXXX',
        secret_key: 'xxxxxxxx',
        region: 'XXXXXX',
        path: 'data-warehouse'
      },
      creator: '张三',
      created_at: '1749627860785',
      updated_at: '17123456791'
    },
    {
      id: '1',
      name: '唐僧',
      status: 'disconnection',
      type: 's3',
      config: {
        endpoint: 'https://s3.amazonaws.com',
        access_key: 'AKIAxxxxXXX',
        secret_key: 'xxxxxxxx',
        region: 'XXXXXX',
        path: 'data-warehouse'
      },
      creator: '张三',
      created_at: '1749627860785',
      updated_at: '17123456791'
    }
  ]);
  // 当前的第几页
  const [current, setCurrent] = useState(1);
  // 每页展示数据的数据量
  const [pageSize, setPageSize] = useState(10);
  // 改变数据的逻辑
  const handlePageChange = (page) => {
    setCurrent(page);
  };

  // 根据搜索条件过滤连接器
  const filteredConnectors = useMemo(() => {
    return ConnectionData.filter((connector) => {
      const query = searchValue.toLowerCase();
      return (
        connector.name.toLowerCase().includes(query) ||
        connector.type.toLowerCase().includes(query) ||
        connector.creator.toLowerCase().includes(query)
      );
    });
  }, [ConnectionData, searchValue]);

  const getlist = () => {
    getConnectionList({
      page: current,
      page_size: pageSize
    });
  };

  return (
    <div
      style={{
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        margin: '10px 20px 0px 0px',
        borderRadius: '10px',
        height: '94%'
      }}
    >
      <h1
        style={{
          fontSize: '20px',
          fontWeight: 'bold',
          margin: '20px 0px 15px 20px'
        }}
      >
        连接器
      </h1>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          padding: '0px 20px'
        }}
      >
        <InputSearch
          placeholder="输入关键词搜索"
          style={{ width: 230 }}
          value={searchValue}
          onChange={(value) => {
            setSearchValue(value);
          }}
        />
        <Button
          type="primary"
          icon={<IconPlus />}
          onClick={() => {
            childAddAndSetModalHan(null);
          }}
        >
          创建连接器
        </Button>
      </div>
      <Table
        border={false}
        columns={columns}
        data={filteredConnectors}
        style={{ padding: '10px 20px' }}
        pagination={false}
        rowKey="id"
      />
      {/* 分页 */}
      <Pagination
        current={current}
        pageSize={pageSize}
        onPageSizeChange={(pageSize) => {
          setPageSize(pageSize);
          setCurrent(1);
        }}
        onChange={handlePageChange}
        sizeOptions={[2, 5, 10, 20]}
        showTotal
        total={filteredConnectors.length}
        showJumper
        sizeCanChange
        style={{ marginBottom: '20px' }}
      />

      {/* 详情逻辑 */}
      <ModalDetail ref={childRef} />
      <AddAndEditModal ref={addandsetchildRef} />
      <button
        onClick={() => {
          getlist();
        }}
      >
        获取数据
      </button>
    </div>
  );
}
