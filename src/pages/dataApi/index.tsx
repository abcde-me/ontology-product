import React, { useEffect, useState } from 'react';
import {
  Input,
  Pagination,
  PaginationProps,
  Table,
  Dropdown,
  Menu,
  Button,
  Modal
} from '@arco-design/web-react';
import { useHistory } from 'react-router';
import { ColumnProps } from '@arco-design/web-react/es/Table';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import noDataElement from '@/components/no-data';
import { useUserInfo } from '@/store/userInfoStore';
import { getTaskList } from '@/api/taskList';
import { SorterInfo } from '@arco-design/web-react/es/Table/interface';
import { PermissionWrapper } from '@/components/PermissionGuard';
import { WORKFLOW_TASK_PERMISSIONS } from '@/config/permissions';
import styles from './index.module.scss';
import {
  IconClose,
  IconDelete,
  IconDown,
  IconPlus
} from '@arco-design/web-react/icon';
import TestModal from './compontent/testModal';
import ViewFileModal from './compontent/viewFileModal';

const InputSearch = Input.Search;

// 枚举api运行状态
enum ApiStatus {
  running = 1,
  success = 2,
  fail = 3,
  stop = 4
}

// 枚举请求方式
enum RequestMethod {
  get = 'GET',
  post = 'POST',
  put = 'PUT',
  delete = 'DELETE'
}

// 枚举开始时间结束时间字段
enum StartOrEnd {
  start_time = 'start_time',
  end_time = 'end_time'
}

export default function DataApi() {
  const history = useHistory();
  const userInfo = useUserInfo();
  // 初始化搜索框value
  const [searchValue, setSearchValue] = useState('');
  // 初始化api列表数据
  const [dataApiData, setDataApiData] = useState([]);
  // 当前的第几页
  const [current, setCurrent] = useState(1);
  // 每页展示数据的数据量
  const [pageSize, setPageSize] = useState(10);
  // 数据总数
  const [total, setTotal] = useState(10);
  // 添加loading状态控制
  const [loading, setLoading] = useState(false);
  // 初始化授权弹窗是否显示
  const [authorizationModalVisible, setAuthorizationModalVisible] =
    useState(false);
  // 初始化授权弹窗选中的行数据
  const [selectedRows, setSelectedRows] = useState<Record<string, any>[]>([]);
  // 初始化选中的行key
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  // 初始化测试弹窗是否显示
  const [testVisible, setTestVisible] = useState(false);
  // 初始化测试弹窗数据
  const [testDataSource, setTestDataSource] = useState([]);
  // 初始化查看文件弹窗是否显示
  const [viewFileModalVisible, setViewFileModalVisible] = useState(false);
  // 初始化查看文件弹窗id
  const [viewFileId, setViewFileId] = useState('');
  // 初始化筛选的值
  const [sortValue, setSortValue] = useState({
    status: '',
    sort: '',
    sort_by: ''
  });
  // 区分是否点击按钮清空搜索框
  const [isClickClear, setIsClickClear] = useState(false);

  // 组件初始化
  useEffect(() => {
    if (userInfo) getList();
  }, [userInfo, current, pageSize, sortValue]);

  // 清空搜索框
  useEffect(() => {
    if (isClickClear && searchValue === '') {
      getList();
      setIsClickClear(false);
    }
  }, [isClickClear]);

  const getList = async () => {
    setLoading(true);
    try {
      const params: any = {
        uid: userInfo?.id,
        search_value: searchValue,
        page: current,
        page_size: pageSize,
        ...sortValue
      };
      const res = await getTaskList(params);
      if (res.status === 200 && res.data) {
        setDataApiData(res.data.list);
        setCurrent(res.data.page_info.page);
        setPageSize(res.data.page_info.page_size);
        setTotal(res.data.page_info.total || 10);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderEmptyPlaceholder = (value: string | null) => {
    return value === '' || value == null ? '-' : value;
  };
  // 筛选排序操作
  const handleTableChange = (
    _pagination: PaginationProps,
    sorter: SorterInfo,
    filters: Partial<Record<string | number | symbol, string[]>>
  ) => {
    setCurrent(1);
    const sortdata = {
      status: filters.status === undefined ? '' : filters.status.join(','),
      sort:
        sorter.direction === undefined
          ? ''
          : sorter.direction === 'ascend'
            ? 'asc'
            : 'desc',
      sort_by:
        sorter.field === undefined
          ? ''
          : sorter.field === StartOrEnd.start_time
            ? 'start_run_time'
            : 'end_run_time'
    };

    setSortValue(sortdata);
  };

  // table columns
  const columns: ColumnProps[] = [
    {
      title: '序号',
      dataIndex: 'index',
      width: 80,
      align: 'center',
      render: (_, _record, idx: number) => (current - 1) * pageSize + idx + 1
    },
    {
      title: 'API名称',
      dataIndex: 'name',
      width: 200,
      ellipsis: true,
      render: (_, record) => (
        <EllipsisPopover
          value={renderEmptyPlaceholder(record.instance_name)}
          isEdit={false}
        />
      )
    },
    {
      title: '请求方式',
      dataIndex: 'name_cn',
      width: 130,
      render: (_, record) => record.name_cn || '-',
      filters: [
        {
          text: 'GET',
          value: RequestMethod.get
        },
        {
          text: 'POST',
          value: RequestMethod.post
        }
      ]
    },
    {
      title: 'API路径',
      dataIndex: 'path',
      width: 170,
      ellipsis: true,
      render: (_, record) => (
        <EllipsisPopover value={record.path || '-'} isEdit={false} />
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 110,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              backgroundColor:
                record.status === ApiStatus.success
                  ? '#10B981'
                  : record.status === ApiStatus.fail
                    ? '#EF4444'
                    : record.status === ApiStatus.running
                      ? '#007DFA'
                      : '#CBD5E1',
              borderRadius: '50%',
              marginRight: '5px'
            }}
          ></div>
          <div>
            {record.status === ApiStatus.success
              ? '使用中'
              : record.status === ApiStatus.fail
                ? '开发失败'
                : record.status === ApiStatus.running
                  ? '开发中'
                  : '已下线'}
          </div>
        </div>
      ),
      filters: [
        {
          text: '使用中',
          value: ApiStatus.success
        },
        {
          text: '开发失败',
          value: ApiStatus.fail
        },
        {
          text: '开发中',
          value: ApiStatus.running
        },
        {
          text: '已下线',
          value: ApiStatus.stop
        }
      ]
    },
    {
      title: '授权数',
      dataIndex: 'query_count',
      width: 200,
      ellipsis: true,
      render: (_, record) => (
        <EllipsisPopover value={record.query_count || '-'} isEdit={false} />
      )
    },
    {
      title: '总调用次数',
      dataIndex: 'cache_time',
      width: 180,
      render: (_, record) => <span>{record.cache_time || '-'}</span>,
      sorter: true
    },
    {
      title: '更新时间',
      dataIndex: 'update_time',
      width: 180,
      render: (_, record) => (
        <span>{renderEmptyPlaceholder(record.update_time)}</span>
      ),
      sorter: true
    },
    {
      title: '更新人',
      dataIndex: 'creator_name',
      width: 180,
      render: (_, record) => <span>{record.creator_name || '-'}</span>,
      filters: [
        {
          text: '张三',
          value: '张三'
        },
        {
          text: '李四',
          value: '李四'
        }
      ]
    },
    {
      title: '操作',
      dataIndex: 'operate',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <div>
          <span className={styles['operate-text']}>编辑</span>
          <PermissionWrapper permission={WORKFLOW_TASK_PERMISSIONS.CAN_UPDATE}>
            <span
              className={styles['operate-text'] + ' ml-4'}
              onClick={() => {
                setViewFileModalVisible(true);
                setViewFileId(record.id);
              }}
            >
              查看文档
            </span>
          </PermissionWrapper>
          <Dropdown
            droplist={
              <Menu>
                <Menu.Item key="export">
                  <Button
                    type="text"
                    style={{
                      padding: '0 8px 0 5px',
                      height: '100%',
                      borderTop: 'none',
                      borderBottom: 'none'
                    }}
                  >
                    上线
                  </Button>
                </Menu.Item>
                <Menu.Item key="authorize">
                  <Button
                    type="text"
                    style={{
                      padding: '0 8px 0 5px',
                      height: '100%',
                      borderTop: 'none',
                      borderBottom: 'none'
                    }}
                    onClick={() => setAuthorizationModalVisible(true)}
                  >
                    授权
                  </Button>
                </Menu.Item>
                <Menu.Item key="test">
                  <Button
                    type="text"
                    style={{
                      padding: '0 8px 0 5px',
                      height: '100%',
                      borderTop: 'none',
                      borderBottom: 'none'
                    }}
                    onClick={() => {
                      setTestVisible(true);
                      setTestDataSource(record);
                    }}
                  >
                    测试
                  </Button>
                </Menu.Item>
                <Menu.Item key="delete">
                  <Button
                    type="text"
                    style={{
                      padding: '0 8px 0 5px',
                      height: '100%',
                      borderTop: 'none',
                      borderBottom: 'none'
                    }}
                  >
                    删除
                  </Button>
                </Menu.Item>
              </Menu>
            }
            trigger="hover"
            position="bl"
          >
            <Button type="text">
              更多
              <IconDown />
            </Button>
          </Dropdown>
        </div>
      )
    }
  ];

  // 授权表列
  const authorizationColumns: ColumnProps[] = [
    {
      title: '名称',
      dataIndex: 'name',
      width: 600
    }
  ];

  // 授权表数据
  const authorizationData = [
    {
      key: '1',
      name: 'Jane Doe',
      salary: 23000,
      address: '32 Park Road, London',
      email: 'jane.doe@example.com',
      parentKey: '',
      children: [
        {
          key: '1-1',
          name: 'Christina',
          address: '332 Park Road, London',
          email: 'christina@example.com',
          parentKey: '1'
        }
      ]
    },
    {
      key: '2',
      name: 'Alisa Ross',
      salary: 25000,
      address: '35 Park Road, London',
      email: 'alisa.ross@example.com',
      parentKey: '',
      children: [
        {
          key: '2-1',
          name: 'Ed Hellen',
          salary: 17000,
          address: '42 Park Road, London',
          email: 'ed.hellen@example.com',
          parentKey: '2',
          children: [
            {
              key: '2-1-1',
              name: 'Eric Miller',
              salary: 23000,
              address: '67 Park Road, London',
              email: 'eric.miller@example.com',
              parentKey: '2-1'
            },
            {
              key: '2-1-2',
              name: 'Tom Jerry',
              salary: 666,
              address: '67 Park Road, London',
              email: 'tom.jerry@example.com',
              parentKey: '2-1'
            }
          ]
        },
        {
          key: '2-2',
          name: 'William Smith',
          salary: 27000,
          address: '62 Park Road, London',
          email: 'william.smith@example.com',
          parentKey: '2'
        },
        {
          key: '2-3',
          name: 'George Bush',
          salary: 24000,
          address: '62 Park Road, London',
          email: 'george.bush@example.com',
          parentKey: '2'
        }
      ]
    }
  ];

  // 跳转创建API页面
  const handleToAddApi = () => {
    history.push('/tenant/compute/modaforge/dataApi/add');
  };

  return (
    <div className={styles['data-api']}>
      <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>数据API</h1>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          margin: '15px 0'
        }}
      >
        <InputSearch
          placeholder="输入API名称或请求方式搜索"
          allowClear
          style={{ width: 260 }}
          value={searchValue}
          onChange={(value) => {
            setSearchValue(value);
          }}
          onPressEnter={() => getList()}
          onClear={() => {
            setCurrent(1);
            setSearchValue('');
            setIsClickClear(true);
          }}
        />
        <Button type="primary" icon={<IconPlus />} onClick={handleToAddApi}>
          创建API
        </Button>
      </div>
      <Table
        border={false}
        columns={columns}
        data={dataApiData}
        pagination={false}
        noDataElement={noDataElement({ description: '暂无数据' })}
        rowKey="id"
        loading={loading}
        onChange={(pagination, sorter, filters) =>
          handleTableChange(pagination, sorter as SorterInfo, filters)
        }
      />
      {/* 分页 */}
      {dataApiData && dataApiData.length > 0 && (
        <Pagination
          current={current}
          pageSize={pageSize}
          onPageSizeChange={(pageSize) => {
            setPageSize(pageSize);
            setCurrent(1);
          }}
          onChange={(page) => {
            setCurrent(page);
          }}
          sizeOptions={[10, 20, 50, 100]}
          showTotal
          total={total}
          showJumper
          sizeCanChange
          style={{ justifyContent: 'flex-end', marginTop: '10px' }}
        />
      )}

      {/* 测试弹窗 */}
      <TestModal
        visible={testVisible}
        dataSource={testDataSource}
        onCancel={() => setTestVisible(false)}
      />

      {/* 查看文件弹窗 */}
      <ViewFileModal
        visible={viewFileModalVisible}
        onCancel={() => setViewFileModalVisible(false)}
        id={viewFileId}
      />

      {/* 授权弹窗 */}
      <Modal
        className={styles.authorizationModal}
        visible={authorizationModalVisible}
        title="授权"
        onCancel={() => setAuthorizationModalVisible(false)}
      >
        <div className={styles.authorizationModalContent}>
          <div className={styles.leftBox}>
            <InputSearch placeholder="搜索组织或项目" />
            <Table
              border={false}
              columns={authorizationColumns}
              data={authorizationData}
              pagination={false}
              noDataElement={noDataElement({ description: '暂无数据' })}
              rowKey="key"
              loading={loading}
              rowSelection={{
                type: 'checkbox',
                selectedRowKeys,
                onChange: (selectedRowKeys, selectedRows) => {
                  console.log(selectedRowKeys, selectedRows);
                  // 组织下的项目全选时，只保留组织，不保留项目
                  const allKeys = new Set(selectedRows.map((item) => item.key));
                  const filteredArr = selectedRows.filter((item) => {
                    // 无parentKey → 保留
                    if (!item.parentKey) return true;
                    // 有parentKey但不在key集合中 → 保留；否则剔除
                    return !allKeys.has(item.parentKey);
                  });
                  setSelectedRowKeys(filteredArr.map((item) => item.key));
                  setSelectedRows(filteredArr);
                  console.log(filteredArr, 'filteredArr');
                },
                checkStrictly: false
              }}
            />
          </div>
          <div className={styles.rightBox}>
            <div className={styles.title}>
              <div className={styles.selectedCount}>
                已选 {selectedRows.length}/50 项
              </div>
              <IconDelete
                className={styles.deleteIcon}
                onClick={() => {
                  setSelectedRows([]);
                  setSelectedRowKeys([]);
                }}
              />
            </div>
            <div className={styles.selectedItems}>
              {selectedRows.map((item) => (
                <div key={item.key} className={styles.selectedItem}>
                  <div>{item.name}</div>
                  <IconClose
                    className={styles.deleteIcon}
                    onClick={() => {
                      setSelectedRows(
                        selectedRows.filter((row) => row.key !== item.key)
                      );
                      setSelectedRowKeys(
                        selectedRowKeys.filter((key) => key !== item.key)
                      );
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
