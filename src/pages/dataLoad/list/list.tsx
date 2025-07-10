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
import React, { useEffect, useMemo, useState } from 'react';
import Styles from './index.module.css';
import { ITableData } from './type';
import LoadAddModal from './load-add-modal';
import { useHistory } from 'react-router-dom';
import { delLoad, getLoadList } from '@/api/loadApi';
import './index.css';
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
      render: (_, item) => (
        <div>
          {item.load_type == LoadType[Load.ONCE].value
            ? LoadType[Load.ONCE].text
            : LoadType[Load.CRON].text}
        </div>
      )
    },
    {
      title: '最近运行状态',
      width: 170,
      dataIndex: 'status',
      render: (_, item) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: '5px',
              height: '5px',
              background:
                item.status == RunState.FAILED
                  ? RunStateType[RunState.FAILED].color
                  : item.status == RunState.SUCCEED
                    ? RunStateType[RunState.SUCCEED].color
                    : item.status == RunState.RUNNING
                      ? RunStateType[RunState.RUNNING].color
                      : item.status == RunState.STOPPED
                        ? RunStateType[RunState.STOPPED].color
                        : undefined,
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
      ]
    },
    {
      title: '数据源类型',
      width: 170,
      dataIndex: 'source_type',
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
      ]
    },
    {
      title: '连接器名称',
      width: 230,
      render: (_, item) => {
        return (
          <a
            onClick={() => gotoConnector(item.connector_name)}
            className="jump-a"
          >
            {item.connector_name}
          </a>
        );
      }
    },
    {
      title: '载入位置',
      width: 200,
      ellipsis: true,
      render: (_, item) => {
        return (
          <span
            onClick={() => {
              history.push('/tenant/compute/modaforge/dataCatalog');
            }}
          >
            {item.data_path_name}
          </span>
        );
      }
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      width: 240,
      sorter: (a, b) => {} // 排序
    },
    {
      title: '更新时间',
      dataIndex: 'last_run_time',
      width: 240,
      sorter: (a, b) => {} // 排序
    },
    {
      title: '操作',
      fixed: 'right',
      width: 105,
      render: (_, item) => {
        return (
          <div
            className={Styles.hoverStyle}
            onClick={() => {
              // 跳转到详情页
            }}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-around'
            }}
          >
            <span
              className={Styles.hoverStyle}
              onClick={() => {
                gotoDetail(item.task_id);
              }}
            >
              详情
            </span>
            <Popconfirm
              focusLock
              title="删除该连接器"
              content="删除该连接器后，也会终止正在运行的数据载入任务(包括单次载入和周期性载入任务)，是否要继续操作?"
              onOk={() => {
                deleteLoadHan(item.task_id);
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
        );
      }
    }
  ] as any;
  const [data, setData] = useState<ITableData[]>([
    // {
    //   task_id: '1',
    //   connector_id: '1',
    //   connector_name: '中科院大数据库任务1',
    //   name: '1234',
    //   source_type: 'hdfs',
    //   load_type: 'once',
    //   status: 'succeed',
    //   data_path_id: '2',
    //   data_path_name: '1234',
    //   creator: '111',
    //   created_at: '1234',
    //   last_run_time: '1234'
    // }
  ]);
  // 当前的第几页
  const [current, setCurrent] = useState(1);
  // 每页展示数据的数据量
  const [pageSize, setPageSize] = useState(10);
  // 改变数据的逻辑
  const handlePageChange = (page: number) => {
    setCurrent(page);
  };
  const [loadloading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  // 模态框默认状态
  const [visible, setVisible] = React.useState(false);
  // 整体数据
  const [loadTotal, setLoadTotal] = useState(0);
  // 点击按钮因残模态框(确认||取消同一个方法)
  const hideEditModal = () => {
    setVisible(false);
  };
  const [loadSiftObject, setLoadSiftObject] = useState({});
  // 跳转到详情页面
  const gotoDetail = (task_id: number) => {
    history.push(
      `/tenant/compute/modaforge/dataLoad/detail?task_id=${task_id}`
    );
  };
  // 点击跳转到连接器页面
  const gotoConnector = (connectorId) => {
    history.push(
      `/tenant/compute/modaforge/connection?connector_id=${connectorId}`
    );
  };
  // 查询载入任务列表
  const getdataLoadList = async () => {
    try {
      setLoading(true);
      const res = await getLoadList({
        page: current,
        page_size: pageSize,
        name: searchValue,
        ...loadSiftObject
      });
      if (res.message == 'ok') {
        console.log(res.data.items);
        setData(res.data.items);
        setLoadTotal(res.data.total);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  const loadSiftHan = (sorter, filters) => {
    console.log(filters);
    console.log(sorter);

    const newSiftObj = {
      status: filters.status == undefined ? [] : filters.status,
      load_type: filters.load_type == undefined ? [] : filters.load_type,
      source_type: filters.source_type == undefined ? [] : filters.source_type,
      order_by:
        sorter.field == undefined
          ? ''
          : sorter.field == 'created_at'
            ? 'created_at'
            : 'last_run_time',
      sort:
        sorter.direction == undefined
          ? ''
          : sorter.direction == 'ascend'
            ? 'asc'
            : 'desc'
    };
    setLoadSiftObject(newSiftObj);
    setCurrent(1);
  };
  const handlePressEnter = () => {
    getdataLoadList();
  };
  // 删除列表的方法
  const deleteLoadHan = async (id) => {
    try {
      const res = await delLoad(id);
      if (res.message == 'ok') {
        Message.success('删除成功');
        getdataLoadList();
      } else {
        Message.error(res.message);
      }
    } catch {
      console.error('网络错误');
    }
  };
  useEffect(() => {
    getdataLoadList();
  }, [current, pageSize, loadSiftObject]);
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
          onPressEnter={handlePressEnter}
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
        loading={loadloading}
        columns={columns}
        data={data}
        style={{ padding: '10px 20px' }}
        pagination={false}
        rowKey="task_id"
        border={false}
        scroll={{
          x: true
        }}
        onChange={(pagination, filters, sorter) => {
          loadSiftHan(filters, sorter);
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
          defaultCurrent={10}
          onChange={handlePageChange}
          sizeOptions={[10, 20, 50, 100]}
          showTotal
          total={loadTotal}
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
        <LoadAddModal hideModalHan={hideEditModal} getList={getdataLoadList} />
      </Modal>
      {/* <Route
        key="/tenant/compute/modaforge/dataLoad/detail"
        path="/tenant/compute/modaforge/dataLoad/detail"
        component={React.lazy(async () => import('../detail/dataLoad-detail'))}
      /> */}
    </div>
  );
}
