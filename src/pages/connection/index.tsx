import {
  Input,
  Message,
  Pagination,
  Popconfirm,
  Table,
  Button,
  Modal
} from '@arco-design/web-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import './index.css';
import { IconPlus } from '@arco-design/web-react/icon';
import ModalDetail from './detail-modal';
import AddAndEditModal from './add-edit-modal';
import { delconnectionList, getConnectionList } from '@/api/connectionApi';
interface ChildComponentMethods {
  displayModalView: (id: number | string) => void; // 根据实际情况调整参数类型
  // 可以添加其他子组件暴露的方法...
}
const InputSearch = Input.Search;

// 连接器状态枚举
enum ConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected'
}

// 连接器类型枚举
enum ConnectorType {
  S3 = 's3',
  HDFS = 'hdfs'
}

// 状态显示配置
const STATUS_CONFIG = {
  [ConnectionStatus.CONNECTED]: {
    text: '已连接',
    color: 'green'
  },
  [ConnectionStatus.DISCONNECTED]: {
    text: '已断开',
    color: 'red'
  }
};

// 类型显示配置
const TYPE_CONFIG = {
  [ConnectorType.S3]: '对象存储',
  [ConnectorType.HDFS]: 'HDFS'
};

export default function Connection() {
  // 显示详情页面的实例子组件实例
  const childRef = useRef(null);
  // 添加编辑弹框的实例
  const addandsetchildRef = useRef<ChildComponentMethods | null>(null);
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
      width: 130,
      render: (_, item) => {
        const statusConfig =
          STATUS_CONFIG[item.status] ||
          STATUS_CONFIG[ConnectionStatus.DISCONNECTED];
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                width: '5px',
                height: '5px',
                backgroundColor: statusConfig.color,
                borderRadius: '50%',
                marginRight: '5px'
              }}
            ></div>
            <div>{statusConfig.text}</div>
          </div>
        );
      },
      filters: [
        {
          text: STATUS_CONFIG[ConnectionStatus.DISCONNECTED].text,
          value: ConnectionStatus.DISCONNECTED
        },
        {
          text: STATUS_CONFIG[ConnectionStatus.CONNECTED].text,
          value: ConnectionStatus.CONNECTED
        }
      ],
      onFilter: (value, row) => row.status === value
    },
    {
      title: '数据源类型',
      width: 150,
      render: (_, item) => <div>{TYPE_CONFIG[item.type] || '未知类型'}</div>,
      filters: [
        {
          text: TYPE_CONFIG[ConnectorType.S3],
          value: ConnectorType.S3
        },
        {
          text: TYPE_CONFIG[ConnectorType.HDFS],
          value: ConnectorType.HDFS
        }
      ],
      onFilter: (value, row) => row.type === value
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      width: 120
    },
    {
      title: '创建时间',
      width: 200,
      render: (_, item) => <div className="fontMM">{item.created_at}</div>,
      sorter: (a, b) => a.created_at.localeCompare(b.created_at)
    },
    {
      title: '更新时间',
      width: 200,
      render: (_, item) => <div className="fontMM">{item.updated_at}</div>
    },
    {
      title: '操作',
      width: 130,
      render: (_, record) => (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span
            className="hover"
            onClick={() => {
              viewDetailHan(record.id);
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
  // 默认弹框隐藏
  const [visible2, setVisible2] = React.useState(false);
  // 详情页面的默认id
  const [cId, setCId] = useState('0');
  // 点击删除按钮执行的方法
  const DeleteMethod = async (id: string) => {
    const res = await delconnectionList(id);
    console.log(res);
    if (res.message) {
      Message.success({
        content: '删除成功'
      });
    }
    getlist();
    console.log(id);
  };
  // 点击查看执行的方法
  const viewDetailHan = (id) => {
    setCId(id);
    setVisible2(true);
  };

  const childAddAndSetModalHan = (obj) => {
    if (addandsetchildRef.current) {
      addandsetchildRef.current.displayModalView(obj);
    }
  };
  // 搜索框的默认值
  const [searchValue, setSearchValue] = useState('');
  const [ConnectionData, setConnectionData] = useState([]) as any;
  const [pagination, setPagination] = useState({
    // 当前第1页
    current: 1,
    // 每页默认显示10条
    pageSize: 10,
    total: 0
  });

  // 改变数据的逻辑
  const handlePageChange = (page) => {
    setPagination((prev) => ({
      ...prev,
      current: page
    }));
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

  const [searchParams, setSearchParams] = useState({
    keyword: ''
  });

  const getlist = async () => {
    const res = await getConnectionList({
      page: pagination.current,
      page_size: pagination.pageSize
    });

    setConnectionData(res.data.items);
    setPagination((prev) => ({
      ...prev,
      total: res.data.total
    }));
  };

  useEffect(() => {
    getlist();
  }, [pagination.current, pagination.pageSize, searchParams.keyword]);
  return (
    <div
      style={{
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        margin: '10px 20px 10px 0px',
        borderRadius: '10px'
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
          // type="primary"
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
        loading={false}
      />
      {/* 分页 */}
      <Pagination
        current={pagination.current}
        pageSize={pagination.pageSize}
        onPageSizeChange={(pageSize) => {
          setPagination((prev) => ({
            ...prev,
            pageSize,
            current: 1
          }));
        }}
        onChange={handlePageChange}
        sizeOptions={[2, 5, 10, 20]}
        showTotal
        total={pagination.total}
        showJumper
        sizeCanChange
        style={{ marginBottom: '20px' }}
      />

      {/* 详情逻辑 */}

      <Modal
        style={{ width: '700px', height: '500px' }}
        visible={visible2}
        footer={null}
        onCancel={() => {
          // 点击关闭隐藏弹框
          setVisible2(false);
        }}
      >
        <ModalDetail ref={childRef} detailId={cId} />
      </Modal>
      <AddAndEditModal ref={addandsetchildRef} getListHan={getlist} />
    </div>
  );
}

// 导出枚举供其他组件使用
export { ConnectionStatus, ConnectorType, STATUS_CONFIG, TYPE_CONFIG };
