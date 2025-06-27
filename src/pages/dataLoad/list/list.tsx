import {
  Button,
  Input,
  Message,
  Modal,
  Pagination,
  Popconfirm,
  Table
} from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import React, { useMemo, useState } from 'react';
import Styles from './index.module.css';
import LoadAddModal from './load-add-modal';
import { Route } from 'react-router';
import { useHistory } from 'react-router-dom';
export enum RunState {
  SUCCEED = 'succeed',
  FAILED = 'failed',
  RUNNING = 'running',
  STOPPED = 'stopped'
}

export const RunStateType = {
  [RunState.SUCCEED]: {
    text: '运行成功',
    value: 'succeed',
    color: 'green'
  },
  [RunState.FAILED]: {
    text: '运行失败',
    value: 'failed',
    color: 'red'
  },
  [RunState.RUNNING]: {
    text: '运行中',
    value: 'running',
    color: 'rgb(0, 125, 249)'
  },
  [RunState.STOPPED]: {
    text: '运行停止',
    value: 'stopped',
    color: 'rgb(148, 163, 184)'
  }
};
export enum Load {
  ONCE = 'once',
  CRON = 'cron'
}
export const LoadType = {
  [Load.ONCE]: {
    text: '单次载入',
    value: 'once'
  },
  [Load.CRON]: {
    text: '周期载入',
    value: 'cron'
  }
};
enum ConnectorType {
  S3 = 's3',
  HDFS = 'hdfs'
}
const TYPE_CONFIG = {
  [ConnectorType.S3]: {
    text: '对象存储',
    value: 's3'
  },
  [ConnectorType.HDFS]: {
    text: 'HDFS',
    value: 'hdfs'
  }
};
const InputSearch = Input.Search;
export default function DataLoad() {
  const history = useHistory();
  const columns = [
    {
      title: '载入任务名称',
      dataIndex: 'name',
      width: 300,
      ellipsis: true
    },
    {
      title: '载入形式',
      dataIndex: 'load_type',
      width: 150,
      filters: [
        {
          text: LoadType[Load.ONCE].text,
          value: LoadType[Load.ONCE].value
        },
        {
          text: LoadType[Load.CRON].text,
          value: LoadType[Load.CRON].value
        }
      ],
      onFilter: (value, row) => row.zairutype == value,
      render: (_, item) => (
        <div>
          {item.zairutype == Load.ONCE
            ? LoadType[Load.ONCE].text
            : LoadType[Load.CRON].text}
        </div>
      )
    },
    {
      title: '最近运行状态',
      dataIndex: 'status',
      width: 170,
      render: (_, item) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: '5px',
              height: '5px',
              background:
                item.status == 'failed'
                  ? RunStateType[RunState.FAILED].color
                  : item.status == 'succeed'
                    ? RunStateType[RunState.SUCCEED].color
                    : item.status == 'running'
                      ? RunStateType[RunState.RUNNING].color
                      : RunStateType[RunState.STOPPED].color,
              borderRadius: '50%'
            }}
          ></div>
          <div style={{ marginLeft: '6px' }}>
            {item.status == RunState.SUCCEED &&
              RunStateType[RunState.SUCCEED].text}
            {item.status == RunState.FAILED &&
              RunStateType[RunState.FAILED].text}
            {item.status == RunState.RUNNING &&
              RunStateType[RunState.RUNNING].text}
            {item.status == RunState.STOPPED &&
              RunStateType[RunState.STOPPED].text}
          </div>
        </div>
      ),
      filters: [
        {
          text: RunStateType[RunState.SUCCEED].text,
          value: RunStateType[RunState.SUCCEED].value
        },
        {
          text: RunStateType[RunState.FAILED].text,
          value: RunStateType[RunState.FAILED].value
        },
        {
          text: RunStateType[RunState.RUNNING].text,
          value: RunStateType[RunState.RUNNING].value
        },
        {
          text: RunStateType[RunState.STOPPED].text,
          value: RunStateType[RunState.STOPPED].value
        }
      ],
      onFilter: (value, row) => row.status == value
    },
    {
      title: '数据源类型',
      dataIndex: 'source_type',
      width: 170,
      render: (_, item) => (
        <span>
          {item.source_type == TYPE_CONFIG[ConnectorType.S3].value
            ? TYPE_CONFIG[ConnectorType.S3].text
            : TYPE_CONFIG[ConnectorType.HDFS].text}
        </span>
      ),
      filters: [
        {
          text: TYPE_CONFIG[ConnectorType.HDFS].text,
          value: TYPE_CONFIG[ConnectorType.HDFS].value
        },
        {
          text: TYPE_CONFIG[ConnectorType.S3].text,
          value: TYPE_CONFIG[ConnectorType.S3].value
        }
      ],
      onFilter: (value, row) => row.source_type == value
    },
    {
      title: '连接器名称',
      dataIndex: 'connector_name',
      width: 230
    },
    {
      title: '载入位置',
      dataIndex: 'dest_path',
      width: 200,
      ellipsis: true
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      width: 240,
      render: (_, item) => <span>{item.created_at}</span>,
      sorter: (a, b) => a.created_at - b.created_at // 排序
    },
    {
      title: '更新时间',
      dataIndex: 'last_run_time',
      width: 240,
      render: (_, item) => <span>{item.last_run_time}</span>,
      sorter: (a, b) => a.last_run_time - b.last_run_time // 排序
    },
    {
      title: '操作',
      fixed: 'right',
      width: 105,
      render: (_, item) => (
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-around'
          }}
        >
          <span
            className={Styles.hoverStyle}
            onClick={() => {
              gotoDetail(item.id);
            }}
          >
            详情
          </span>
          <Popconfirm
            focusLock
            title="删除该连接器"
            content="删除该连接器后，也会终止正在运行的数据载入任务(包括单次载入和周期性载入任务)，是否要继续操作?"
            onOk={() => {
              deleteHan(item.id);
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
            <span className={Styles.hoverStyle}>删除</span>
          </Popconfirm>
        </div>
      )
    }
  ] as any;
  const [data, setData] = useState([
    {
      id: '1',
      name: '中科院大数据库任务1',
      load_type: 'once', //once单次载入 cron周期载入
      status: 'running',
      source_type: 's3',
      connector_name: '连接器名称',
      dest_path: '/232482347287/hshfusdhf/4234',
      created_at: '1749627860785',
      last_run_time: '1749627860785',
      creator: '张三',
      enable: true,
      connector_id: '456'
    },
    {
      id: '2',
      name: '中科院大数据库任务1',
      load_type: 'once', //once单次载入 cron周期载入
      status: 'succeed',
      source_type: 's3',
      connector_name: '连接器名称',
      dest_path: '/232482347287/hshfusdhf/4234',
      created_at: '1749627860785',
      last_run_time: '1749627860785',
      creator: '张三',
      enable: true,
      connector_id: '456'
    },
    {
      id: '3',
      name: '中科院大数据库任务1',
      load_type: 'once', //once单次载入 cron周期载入
      status: 'failed',
      source_type: 's3',
      connector_name: '连接器名称',
      dest_path: '/232482347287/hshfusdhf/4234',
      created_at: '1749627860785',
      last_run_time: '1749627860785',
      creator: '张三',
      enable: true,
      connector_id: '456'
    },
    {
      id: '4',
      name: '中科院大数据库任务1',
      load_type: 'once', //once单次载入 cron周期载入
      status: 'stopped',
      source_type: 's3',
      connector_name: '连接器名称',
      dest_path: '/232482347287/hshfusdhf/4234',
      created_at: '1749627860785',
      last_run_time: '1749627860785',
      creator: '张三',
      enable: true,
      connector_id: '456'
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
  const [searchValue, setSearchValue] = useState('');
  // 根据搜索条件过滤连接器
  const filteredConnectors = useMemo(() => {
    return data.filter((connector) => {
      const query = searchValue.toLowerCase();
      return connector.name.toLowerCase().includes(query);
    });
  }, [data, searchValue]);

  const currentPageData = useMemo(() => {
    const startIndex = (current - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredConnectors.slice(startIndex, endIndex);
  }, [current, pageSize, filteredConnectors]);

  // 点击删除的逻辑
  const deleteHan = (id) => {
    console.log('删除了' + id);
  };

  // 模态框默认状态
  const [visible, setVisible] = React.useState(false);

  // 点击按钮因残模态框(确认||取消同一个方法)
  const hideEditModal = () => {
    setVisible(false);
  };
  // 跳转到详情页面
  const gotoDetail = (id: number) => {
    history.push(`/tenant/compute/modaforge/dataLoad/detail/${id}`);
  };
  // 查询载入任务列表
  const getdataLoadList = async () => {
    // const res = await dataLoadList();
    // if (res.code === 200) {
    //   setData(res.data);
    // }
  };
  return (
    <div
      style={{
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        margin: '10px 20px 10px 0px',
        borderRadius: '10px',
        height: '94%'
      }}
    >
      <h1
        style={{
          fontSize: '20px',
          fontWeight: '600',
          margin: '20px 0px 15px 20px'
        }}
      >
        数据载入
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
          onChange={(value) => {
            setSearchValue(value);
          }}
        />
        <Button
          type="primary"
          icon={<IconPlus />}
          onClick={() => {
            setVisible(true);
          }}
        >
          创建数据载入任务
        </Button>
      </div>
      <Table
        columns={columns}
        data={currentPageData}
        style={{ padding: '10px 20px' }}
        pagination={false}
        rowKey="id"
        border={false}
        scroll={{
          x: true
        }}
      />
      <div className={Styles.arcoPagination}>
        <Pagination
          current={current}
          pageSize={pageSize}
          onPageSizeChange={(pageSize) => {
            setPageSize(pageSize);
            setCurrent(1);
          }}
          onChange={handlePageChange}
          sizeOptions={[1, 2, 5, 10]}
          showTotal
          total={filteredConnectors.length}
          showJumper
          sizeCanChange
          style={{ marginBottom: '20px' }}
        />
      </div>
      <Modal
        style={{ width: '600px' }}
        title="创建数据载入任务"
        visible={visible}
        onOk={() => setVisible(false)}
        onCancel={() => setVisible(false)}
        autoFocus={false}
        focusLock={true}
        footer={null}
        // maskClosable={false}
        unmountOnExit={true}
      >
        <LoadAddModal hideModalHan={hideEditModal} />
      </Modal>
      {console.log(RunStateType[RunState.FAILED].text)}
      <Route
        key="/tenant/compute/modaforge/dataLoad/detail"
        path="/tenant/compute/modaforge/dataLoad/detail"
        component={React.lazy(async () => import('../detail/dataLoad-detail'))}
      />
    </div>
  );
}
