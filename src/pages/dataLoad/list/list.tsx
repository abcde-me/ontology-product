import {
  Button,
  Input,
  Message,
  Modal,
  Pagination,
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
import EllipsisPopoverCom from '@/components/ellipsis-popover-com';
import noDataElement from '@/components/no-data';
import { PermissionWrapper } from '@/components/PermissionGuard';
import { DATA_LOAD_PERMISSIONS } from '@/config/permissions';
import { OperationColumn } from '@ccf2e/arco-material';
import getLabelByValue from '@/utils/getLabelByValue';
import {
  RunState,
  RunStateType,
  Load,
  LoadType,
  ConnectorType,
  TYPE_CONFIG,
  DATABASE_TYPE_ENUM
} from '../config';

const InputSearch = Input.Search;
export default function DataLoad() {
  const history = useHistory();
  const columns = [
    {
      title: '载入任务名称',
      className: 'hover-change',
      width: 300,
      ellipsis: true,
      render: (_, text) => (
        <EllipsisPopoverCom
          value={text.name}
          isEdit={false}
          isLink
          handleLink={() => {
            text.perms.includes(DATA_LOAD_PERMISSIONS.CAN_GET) &&
              gotoDetail(text.task_id);
          }}
        />
      )
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
              width: '8px',
              height: '8px',
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
      filters: [
        {
          text: TYPE_CONFIG[ConnectorType.HDFS].text,
          value: TYPE_CONFIG[ConnectorType.HDFS].value
        },
        {
          text: TYPE_CONFIG[ConnectorType.S3].text,
          value: TYPE_CONFIG[ConnectorType.S3].value
        },
        {
          text: TYPE_CONFIG[ConnectorType.DB].text,
          value: TYPE_CONFIG[ConnectorType.DB].value
        },
        {
          text: TYPE_CONFIG[ConnectorType.Local].text,
          value: TYPE_CONFIG[ConnectorType.Local].value
        }
      ],
      render: (_, item) => (
        <span>
          {item.source_type == TYPE_CONFIG[ConnectorType.S3].value
            ? TYPE_CONFIG[ConnectorType.S3].text
            : item.source_type == TYPE_CONFIG[ConnectorType.HDFS].value
              ? TYPE_CONFIG[ConnectorType.HDFS].text
              : item.source_type == TYPE_CONFIG[ConnectorType.DB].value
                ? `${TYPE_CONFIG[ConnectorType.DB].text}-${getLabelByValue(DATABASE_TYPE_ENUM, item?.sub_type || '')}`
                : TYPE_CONFIG[ConnectorType.Local].text}
        </span>
      )
    },
    {
      title: '连接器名称',
      className: 'hover-change',
      ellipsis: true,
      width: 230,
      render: (_, item) => {
        return item?.source_type === ConnectorType.Local ? (
          <span>本地上传</span>
        ) : (
          <EllipsisPopoverCom
            value={item.connector_name}
            isEdit={false}
            isLink
            handleLink={() => {
              gotoConnector(item.connector_name);
            }}
          />
        );
      }
    },
    {
      title: '载入位置',
      // className: 'hover-change',
      width: 200,
      ellipsis: true,
      render: (_, item) => {
        return (
          <div>
            {item.data_path_name !== '' ? (
              <EllipsisPopoverCom
                value={item.data_path_name}
                isEdit={false}
                // isLink
                // handleLink={() => {
                //   history.push(
                //     `/tenant/compute/modaforge/dataCatalog?root_type=${item.root_type}&id=${item.data_path_id}&parent_id=${item.parent_id}`
                //   );
                // }}
              />
            ) : (
              '-'
            )}
          </div>
        );
      }
    },
    {
      title: '创建人',
      width: 130,
      render: (_, item) => {
        return <EllipsisPopoverCom value={item.createor} />;
      }
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      width: 240,
      sorter: (a, b) => {} // 排序
    },
    {
      title: '最后运行时间',
      dataIndex: 'last_run_time',
      width: 240,
      sorter: (a, b) => {} // 排序
    },
    {
      title: '操作',
      fixed: 'right',
      width: 105,
      render: (_, item) => {
        const perms = item?.perms || [];
        const config = [] as any;
        if (perms.includes(DATA_LOAD_PERMISSIONS.CAN_GET)) {
          config.push({
            label: '详情',
            onClick: () => {
              gotoDetail(item.task_id);
            }
          });
        }
        if (perms.includes(DATA_LOAD_PERMISSIONS.CAN_DETELE)) {
          config.push({
            label: '删除',
            onClick: () => {
              deleteLoad(item.task_id, item.name);
            }
          });
        }
        return (
          <OperationColumn
            row={item}
            config={config}
            index={0}
            extendFont="操作"
          />
        );
      }
    }
  ] as any;
  const [data, setData] = useState<ITableData[]>([]);
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
        name: searchValue.trim(),
        ...loadSiftObject
      });
      if (res.message == 'ok') {
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
  const deleteLoad = (id, title) => {
    Modal.confirm({
      title: (
        <span style={{ fontSize: '16px', fontWeight: '600' }}>
          确认删除该数据载入任务吗?
        </span>
      ),
      content: (
        <div
          style={{
            padding: '10px 28px 0px 28px',
            fontSize: '14px',
            fontWeight: '400'
          }}
        >
          删除该数据载入任务,{title},是否继续操作
        </div>
      ),
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        deleteLoadHan(id);
      }
    });
  };
  const deleteLoadHan = async (id) => {
    try {
      const res = await delLoad(id);
      if (res.code === '' && res.status === 200) {
        Message.success('删除成功');
        getdataLoadList();
      } else {
        Message.error(res.message);
      }
    } catch {
      console.error('网络错误');
    }
  };
  const clearHan = async () => {
    try {
      setLoading(true);
      const res = await getLoadList({
        page: 1,
        page_size: pageSize,
        name: '',
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
  useEffect(() => {
    getdataLoadList();
  }, [current, pageSize, loadSiftObject]);
  return (
    <div
      className="load-list"
      style={{
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 21px 20px 20px',
        borderRadius: '10px',
        minHeight: '100%'
      }}
    >
      <h1
        style={{
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '15px'
        }}
      >
        数据载入
      </h1>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%'
        }}
      >
        <InputSearch
          allowClear
          onClear={clearHan}
          placeholder="输入关键词搜索"
          style={{ width: 220 }}
          onPressEnter={handlePressEnter}
          onChange={(value) => {
            setSearchValue(value);
          }}
        />
        <PermissionWrapper permission={DATA_LOAD_PERMISSIONS.CAN_CREATE}>
          <Button
            type="primary"
            icon={<IconPlus />}
            onClick={() => {
              setVisible(true);
            }}
          >
            创建数据载入任务
          </Button>
        </PermissionWrapper>
      </div>
      <Table
        loading={loadloading}
        columns={columns}
        data={data}
        noDataElement={noDataElement({ description: '暂无数据' })}
        style={{ padding: '16px 0px' }}
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
        {data && data.length > 0 && (
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
        )}
      </div>
      <Modal
        style={{ width: '680px' }}
        title="创建数据载入任务"
        visible={visible}
        onOk={() => setVisible(false)}
        onCancel={() => setVisible(false)}
        autoFocus={false}
        focusLock={true}
        footer={null}
        unmountOnExit={true}
      >
        <LoadAddModal hideModalHan={hideEditModal} getList={getdataLoadList} />
      </Modal>
    </div>
  );
}
