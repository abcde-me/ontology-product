import {
  Input,
  Message,
  Pagination,
  Popconfirm,
  Table,
  Button,
  Modal,
  Form,
  Tooltip
} from '@arco-design/web-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import './index.css';
import { IconExclamationCircle, IconPlus } from '@arco-design/web-react/icon';
import ModalDetail from './detail/detail-modal';
import Add from './add';
import {
  delconnectionList,
  getConnectionList,
  updataConnectionList
} from '@/api/connectionApi';
import Edit from './edit';
import { ConnectionType } from './type';
import { filterValues } from '@/api/filterValues';
import { useParams } from '@/utils/url';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import noDataElement from '@/components/no-data';
import { PermissionWrapper } from '@/components/PermissionGuard';
import { CONNECTION_PERMISSIONS } from '@/config/permissions';
import { OperationColumn } from '@ccf2e/arco-material';
interface ChildComponentMethods {
  displayModalView: () => void; // 根据实际情况调整参数类型
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
    color: '#10B981'
  },
  [ConnectionStatus.DISCONNECTED]: {
    text: '已断开',
    color: '#EF4444'
  }
};

// 类型显示配置
const TYPE_CONFIG = {
  [ConnectorType.S3]: '对象存储',
  [ConnectorType.HDFS]: 'HDFS'
};

export default function Connection() {
  // 获取url路由的参数
  const connectionId = useParams('connector_id');
  // 默认编辑弹框状态
  const [editVisible, setEditVisible] = React.useState(false);
  const [editObject, setEditObject] = React.useState<ConnectionType>({});
  // 编辑表单实例
  const [EditForm] = Form.useForm();
  // 添加编辑弹框的实例
  const addandsetchildRef = useRef<ChildComponentMethods | null>(null);
  // 编辑按钮的状态
  const [editLoadingState, setEditLoadingState] = React.useState(false);
  // 表格默认的状态(Lodaing)
  const [tableLoding, setTableLoding] = React.useState(false);
  // 默认弹框隐藏
  const [visible2, setVisible2] = React.useState(false);
  // 详情页面的默认id
  const [cId, setCId] = useState('0');
  // 搜索框的默认值
  const [searchValue, setSearchValue] = useState(
    connectionId ? connectionId : ''
  );
  // 连接器筛选的默认值
  const [siftValue, setSiftValue] = useState({});
  const [ConnectionData, setConnectionData] = useState([]);
  const [pagination, setPagination] = useState({
    // 当前第1页
    current: 1,
    // 每页默认显示10条
    pageSize: 10,
    total: 0,
    name: connectionId || ''
  });
  // 点击确认按钮编辑连接器
  const editConnectorBtnHandel = async () => {
    try {
      const values = await EditForm.validate();
      const { type, name, ...newValues } = values;
      const filteredValues = filterValues(values);
      const newfrom = {
        name,
        type,
        config: { ...filteredValues }
      };
      setEditLoadingState(true);
      const res = await updataConnectionList({
        connector_id: editObject.id,
        newfrom
      });
      if (res.code == '' && res.status == 200) {
        setEditLoadingState(false);
        // 确保数据更新完成后再调用 getListHan
        setEditVisible(false);
        Message.success('测试通过，连接器创建成功');
      } else {
        Message.error(res.message);
      }
    } catch (error) {
      console.log('验证失败', error);
    } finally {
      setEditLoadingState(false);
      getlist();
    }
  };
  // 连接器配置项
  const columns: any = [
    {
      title: '连接器名称',
      dataIndex: 'name',
      width: 230,
      ellipsis: true,
      render: (_, item) => {
        return (
          <EllipsisPopover
            value={item.name}
            isEdit={false}
            // isLink
          />
        );
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 130,
      render: (_, item) => {
        const statusConfig =
          STATUS_CONFIG[item.status] ||
          STATUS_CONFIG[ConnectionStatus.DISCONNECTED];
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
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
      ]
    },
    {
      title: '数据源类型',
      width: 130,
      dataIndex: 'type',
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
      ]
    },
    {
      title: '创建人',
      width: 120,
      ellipsis: true,
      render: (_, item) => {
        return (
          <EllipsisPopover
            value={item.creator}
            isEdit={false}
            // isLink
          />
        );
      }
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      width: 170,
      render: (_, item) => <div className="fontMM">{item.created_at}</div>,
      sorter: (a, b) => a.created_at.localeCompare(b.created_at)
    },
    {
      title: '更新时间',
      width: 170,
      dataIndex: 'updated_at',
      render: (_, item) => <div className="fontMM">{item.updated_at}</div>,
      sorter: (a, b) => a.updated_at.localeCompare(b.updated_at)
    },
    {
      title: '操作',
      width: 130,
      fixed: 'right',
      render: (_, record) => {
        const perms = record?.perms || [];
        const config = [] as any;
        if (perms.includes(CONNECTION_PERMISSIONS.CAN_GET)) {
          config.push({
            label: '详情',
            onClick: () => viewDetailHan(record.id)
          });
        }
        if (perms.includes(CONNECTION_PERMISSIONS.CAN_UPDATE)) {
          config.push({
            label: '编辑',
            onClick: () => editFormHandle(record)
          });
        }
        if (perms.includes(CONNECTION_PERMISSIONS.CAN_DELETE)) {
          config.push({
            label: '删除',
            onClick: () => delModalHan(record.id)
          });
        }
        return (
          <OperationColumn
            row={record}
            config={config}
            index={0}
            extendFont="操作"
          />
        );
      }
    }
  ];
  // 点击删除显示弹框
  const delModalHan = (id) => {
    Modal.confirm({
      title: (
        <span style={{ fontSize: '16px', fontWeight: '600' }}>
          确定删除该连接器吗？
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
          删除该连接器后，也会终止正在运行的数据载入任务(包括单次载入和周期性载入任务)，是否要继续操作?
        </div>
      ),
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        DeleteMethod(id);
      }
    });
  };
  // 点击详情的回调
  const editFormHandle = (obj) => {
    console.log(obj);
    setEditObject(obj);
    setEditVisible(true);
  };

  // 点击删除按钮执行的方法
  const DeleteMethod = async (id) => {
    const res = await delconnectionList(id);
    if (res.code == '' && res.status == 200) {
      Message.success({
        content: '删除成功'
      });
    } else {
      Message.error(res.message);
    }
    getlist();
  };
  // 点击查看执行的方法
  const viewDetailHan = (id) => {
    setCId(id);
    setVisible2(true);
  };

  const childAddAndSetModalHan = () => {
    if (addandsetchildRef.current) {
      addandsetchildRef.current.displayModalView();
    }
  };
  // 回车触发的事件
  const handlePressEnter = () => {
    setPagination((prev) => ({
      ...prev,
      current: 1, // 搜索时重置到第一页
      name: searchValue
    }));
    getlist();
  };
  // 改变数据的逻辑
  const handlePageChange = (page) => {
    setPagination((prev) => ({
      ...prev,
      current: page
    }));
  };
  const siftHan = (sorter, filters) => {
    setPagination((prev) => ({
      ...prev,
      current: 1
    }));
    const siftdata = {
      status: filters.status == undefined ? '' : filters.status.join(','),
      type: filters.type == undefined ? '' : filters.type.join(','),
      sort:
        sorter.direction == undefined
          ? ''
          : sorter.direction == 'ascend'
            ? 'asc'
            : 'desc',
      sort_by: sorter.field == undefined ? '' : sorter.field
    };

    setSiftValue(siftdata);
  };
  // 获取连接器列表
  const getlist = async () => {
    try {
      setTableLoding(true); // 请求开始时设置为 true
      const res = await getConnectionList({
        page: pagination.current,
        page_size: pagination.pageSize,
        name: searchValue.trim(),
        ...siftValue
      });

      if (res.status !== 200) {
        return;
      }

      setConnectionData(res.data.items);
      setPagination((prev) => ({
        ...prev,
        total: res.data.total
      }));
    } catch (error) {
      console.error('获取连接器列表失败:', error);
    } finally {
      setTableLoding(false); // 无论请求成功与否，最后都设置为 false
    }
  };
  const clearHan = async () => {
    try {
      setTableLoding(true); // 请求开始时设置为 true
      const res = await getConnectionList({
        page: 1,
        page_size: pagination.pageSize,
        name: '',
        ...siftValue
      });

      if (res.status !== 200) {
        return;
      }

      setConnectionData(res.data.items);
      setPagination((prev) => ({
        ...prev,
        total: res.data.total
      }));
    } catch (error) {
      console.error('获取连接器列表失败:', error);
    } finally {
      setTableLoding(false); // 无论请求成功与否，最后都设置为 false
    }
  };
  // 页面挂载和更新时获取连接器列表
  useEffect(() => {
    getlist();
  }, [pagination.current, pagination.pageSize, siftValue]);
  return (
    <div
      style={{
        minHeight: 'calc(100% - 30px)',
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        margin: '20px 20px 20px 0',
        padding: '20px',
        borderRadius: '10px'
      }}
    >
      <h1
        style={{
          fontSize: '20px',
          fontWeight: 'bold',
          margin: '0px 0px 15px 0px'
        }}
      >
        连接器
      </h1>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%'
        }}
      >
        <Input.Search
          allowClear
          placeholder="输入关键词搜索"
          style={{ width: 220 }}
          onPressEnter={handlePressEnter}
          defaultValue={searchValue}
          onChange={(value) => setSearchValue(value)}
          onClear={() => {
            clearHan();
          }}
        />
        <PermissionWrapper permission={CONNECTION_PERMISSIONS.CAN_CREATE}>
          <Button
            type="primary"
            icon={<IconPlus />}
            onClick={() => {
              childAddAndSetModalHan();
            }}
          >
            创建连接器
          </Button>
        </PermissionWrapper>
      </div>
      <Table
        border={false}
        columns={columns}
        data={ConnectionData}
        noDataElement={noDataElement({ description: '暂无数据' })}
        style={{ padding: '16px 0px' }}
        pagination={false}
        rowKey="id"
        loading={tableLoding}
        onChange={(pagination, sorter, filters) => {
          siftHan(sorter, filters);
        }}
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
        sizeOptions={[10, 20, 50, 100]}
        showTotal
        total={pagination.total}
        showJumper
        sizeCanChange
        style={{ marginBottom: '20px' }}
      />

      {/* 详情逻辑 */}

      <Modal
        style={{ width: '760px' }}
        visible={visible2}
        title={
          <div style={{ fontSize: '186x', fontWeight: '500' }}>连接器详情</div>
        }
        footer={null}
        onCancel={() => {
          // 点击关闭隐藏弹框
          setVisible2(false);
        }}
      >
        <ModalDetail detailId={cId} />
      </Modal>
      <Add ref={addandsetchildRef} getListHan={getlist} />
      <Modal
        style={{ width: '700px' }}
        title={'编辑连接器'}
        visible={editVisible}
        autoFocus={false}
        focusLock={false}
        unmountOnExit={true}
        onCancel={() => {
          // 点击关闭隐藏弹框
          setEditVisible(false);
        }}
        footer={
          <div
            style={{
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'flex-end'
            }}
          >
            <Button
              style={{ fontSize: '14px', fontWeight: '400' }}
              onClick={() => {
                setEditVisible(false);

                console.log(editObject);
              }}
            >
              取消
            </Button>
            <Button
              type="primary"
              onClick={editConnectorBtnHandel}
              loading={editLoadingState}
              style={{
                marginLeft: '10px',
                fontSize: '14px',
                fontWeight: '400'
              }}
            >
              测试并创建
            </Button>
          </div>
        }
      >
        <Edit
          inEditForm={EditForm}
          editObj={editObject}
          editDisabled={editLoadingState}
        />
      </Modal>
    </div>
  );
}

// 导出枚举供其他组件使用
export { ConnectionStatus, ConnectorType, STATUS_CONFIG, TYPE_CONFIG };
