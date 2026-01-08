import React, { useEffect, useState } from 'react';
import {
  Input,
  Pagination,
  PaginationProps,
  Table,
  Dropdown,
  Menu,
  Button,
  Modal,
  Message,
  Cascader,
  Form
} from '@arco-design/web-react';
import { useHistory } from 'react-router';
import { ColumnProps } from '@arco-design/web-react/es/Table';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import { NoDataCard } from '@ceai-front/arco-material';
import { useUserInfo } from '@/store/userInfoStore';
import {
  openDataAuthList,
  openDataAuthorizeApi,
  openDataDeleteApi,
  openDataList,
  openDataPublish,
  openDataRevokeApi,
  openDataUnpublish
} from '@/api/dataApi';
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
import { GetProjOrg } from '@/api/modules/project';

const InputSearch = Input.Search;

// 枚举api运行状态
enum ApiStatus {
  running = 0,
  success = 1,
  fail = 2
}

// 枚举请求方式
enum RequestMethod {
  get = 'GET',
  post = 'POST',
  put = 'PUT',
  delete = 'DELETE'
}

// 枚举开始时间结束时间字段
enum sortBy {
  queryCount = 'queryCount',
  updatedTime = 'updatedTime'
}

export default function DataApi() {
  const history = useHistory();
  const userInfo = useUserInfo();

  // 初始化授权弹窗表单
  const [authorizationForm] = Form.useForm();

  // 初始化搜索框value
  const [searchValue, setSearchValue] = useState('');
  // 初始化api列表数据
  const [dataApiData, setDataApiData] = useState([]);
  // 当前的第几页
  const [current, setCurrent] = useState(1);
  // 每页展示数据的数据量
  const [pageSize, setPageSize] = useState(10);
  // 数据总数
  const [total, setTotal] = useState(0);
  // 添加loading状态控制
  const [loading, setLoading] = useState(false);
  // 初始化授权弹窗是否显示
  const [authorizationModalVisible, setAuthorizationModalVisible] =
    useState(false);
  // 初始化授权弹窗loading状态
  const [authorizationLoading, setAuthorizationLoading] = useState(false);
  // 初始化授权弹窗数据
  const [authorizationData, setAuthorizationData] = useState([]);
  // 初始化授权弹窗项目
  const [projects, setProjects] = useState<Record<string, any>[]>([]);
  // 初始化授权弹窗选中的项目id
  const [selectedProjectName, setSelectedProjectName] = useState('');
  // 初始化已授权列表
  const [authorizedData, setAuthorizedData] = useState([]);
  // 初始化授权弹窗选中的行数据
  const [selectedAuthorizationRows, setSelectedAuthorizationRows] = useState<
    Record<string, any>[]
  >([]);
  // 初始化选中的行key
  const [selectedAuthorizationRowKeys, setSelectedAuthorizationRowKeys] =
    useState<string[]>([]);
  // 初始化授权弹窗项目总数
  const [itemsTotal, setItemsTotal] = useState(0);

  // 初始化测试弹窗是否显示
  const [testVisible, setTestVisible] = useState(false);
  // 初始化测试弹窗数据
  const [testDataSource, setTestDataSource] = useState([]);
  // 初始化测试弹窗apiId
  const [testApiId, setTestApiId] = useState<number | null>(null);
  // 初始化查看文件弹窗是否显示
  const [viewFileModalVisible, setViewFileModalVisible] = useState(false);
  // 初始化查看文件弹窗id
  const [viewFileId, setViewFileId] = useState('');
  // 初始化筛选的值
  const [sortValue, setSortValue] = useState({
    status: [] as string[],
    sort: '',
    sortBy: ''
  });
  // 区分是否点击按钮清空搜索框
  const [isClickClear, setIsClickClear] = useState(false);
  // 初始化授权弹窗apiId
  const [apiId, setApiId] = useState<number | null>(null);

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
        name: searchValue,
        page: current,
        pageSize: pageSize,
        ...sortValue
      };
      const res = await openDataList(params);
      if (res.status === 200 && res.code === '') {
        if (res.data) {
          setDataApiData(res.data.list);
          setCurrent(res.data.pageNo);
          setPageSize(res.data.pageSize);
          setTotal(res.data.total || 0);
        }
      } else {
        Message.error(res.message || '获取数据API列表失败');
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
      status: filters.status || [],
      sort:
        sorter.direction === undefined
          ? ''
          : sorter.direction === 'ascend'
            ? 'asc'
            : 'desc',
      sortBy:
        sorter.field === undefined
          ? ''
          : sorter.field === sortBy.queryCount
            ? 'query_count'
            : 'updated_time'
    };

    setSortValue(sortdata);
  };

  // 遍历组织数组，将id转为key，同时处理项目列表
  const transformOrgArray = (orgArray, keepId = true) => {
    const transformProjects = (projects) => {
      return projects.map((project) => {
        const { id, ...rest } = project;
        const newProject = {
          key: id, // id 转为 key
          ...rest
        };
        // 若不需要保留原id字段，则删除
        if (!keepId) delete newProject.id;
        return newProject;
      });
    };

    // 处理顶层组织数组
    return orgArray.map((org) => {
      const { id, projectList, ...rest } = org;
      const newOrg = {
        key: id, // 顶层id转为key
        ...rest,
        children: projectList ? transformProjects(projectList) : [] // projectList转为children
      };
      // 若不需要保留原id字段，则删除
      if (keepId) newOrg.id = id;
      else delete newOrg.id;
      return newOrg;
    });
  };

  const handleAuthorization = async (id: number) => {
    setAuthorizationLoading(true);
    setAuthorizationModalVisible(true);
    setApiId(id);
    const res = await openDataAuthList({
      id: id
    });
    if (res.status === 200 && res.code === '') {
      setAuthorizedData(res.data || []);
    } else {
      Message.error(res.message || '获取已授权列表失败');
    }
    if (projects.length === 0) {
      // 获取授权所有组织及项目
      const response = await GetProjOrg({});
      if (response.data) {
        let itemsTotal = 0;
        const newList = transformOrgArray(response.data);
        newList.forEach((item) => {
          itemsTotal += item.children.length;
        });
        setItemsTotal(itemsTotal);
        setAuthorizationData(newList);
        setAuthorizationLoading(false);
        setProjects(response.data || []);
      }
    }
    setAuthorizationLoading(false);
  };

  const handleAuthSubmit = () => {
    authorizationForm.validate().then(async (values) => {
      console.log(values, 'values');
      const params = {
        apiId: apiId,
        authInfo: {
          projectId: values.projectId[1],
          projectName: selectedProjectName
        }
      };

      const res = await openDataAuthorizeApi(params);
      if (res.status === 200 && res.code === '') {
        Message.success('授权数据API成功');
        handleAuthorization(Number(apiId));
      } else {
        Message.error(res.message || '授权数据API失败');
      }
    });
  };

  const handleCancelAuthorization = async (id: string) => {
    const params = {
      apiId: apiId,
      authInfo: {
        projectId: id
      }
    };
    const res = await openDataRevokeApi(params);
    if (res.status === 200 && res.code === '') {
      Message.success('取消授权数据API成功');
      getList();
      authorizationForm.resetFields();
      setAuthorizationModalVisible(false);
    } else {
      Message.error(res.message || '取消授权数据API失败');
    }
  };

  const handleAuth = async () => {
    if (!apiId) {
      Message.error('请选择数据API');
      return;
    }
    console.log(
      selectedAuthorizationRowKeys,
      selectedAuthorizationRows,
      'selectedAuthorizationRowKeys'
    );
    const params = {
      apiId: apiId,
      AuthInfo: {
        projectId: selectedAuthorizationRowKeys
      }
    };

    const res = await openDataAuthorizeApi(params);
  };

  const handleChangeStatus = async (record) => {
    const params = {
      id: record.id
    };
    if (record.status === ApiStatus.success) {
      Modal.confirm({
        title: (
          <span
            style={{
              fontFamily: 'PingFang SC, sans-serif',
              fontWeight: 500,
              fontSize: 16,
              height: 24,
              display: 'inline-block'
            }}
          >
            确认下线API吗？
          </span>
        ),
        // 内容
        content: (
          <div
            style={{
              fontFamily: 'PingFang SC, sans-serif',
              fontWeight: 400,
              fontSize: 14,
              color: '#1D2129',
              height: 22,
              display: 'inline-block'
            }}
          >
            下线后，API将不可用
          </div>
        ),
        // 按钮文字
        okText: '确定',
        cancelText: '取消',
        // okButtonProps: { status: 'danger' },
        onOk: async () => {
          const res = await openDataUnpublish(params);
          if (res.status === 200 && res.code === '') {
            Message.success('下线数据API成功');
            getList();
          } else {
            Message.error(res.message || '下线数据API失败');
          }
        }
      });
    } else {
      const res = await openDataPublish(params);
      if (res.status === 200 && res.code === '') {
        Message.success('上线数据API成功');
        getList();
      } else {
        Message.error(res.message || '上线数据API失败');
      }
    }
  };

  // 删除数据API
  const handleDeleteApi = (id: string) => {
    Modal.confirm({
      title: (
        <span
          style={{
            fontFamily: 'PingFang SC, sans-serif',
            fontWeight: 500,
            fontSize: 16,
            height: 24,
            display: 'inline-block'
          }}
        >
          确认删除API吗？
        </span>
      ),
      // 内容
      content: (
        <div
          style={{
            fontFamily: 'PingFang SC, sans-serif',
            fontWeight: 400,
            fontSize: 14,
            color: '#1D2129',
            height: 22,
            display: 'inline-block'
          }}
        >
          删除后，API不可恢复
        </div>
      ),
      // 按钮文字
      okText: '确定',
      cancelText: '取消',
      // okButtonProps: { status: 'danger' },
      onOk: async () => {
        const params = {
          id
        };
        const res = await openDataDeleteApi(params);
        if (res.status === 200 && res.code === '') {
          Message.success('删除数据API成功');
          getList();
        } else {
          Message.error(res.message || '删除数据API失败');
        }
      }
    });
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
      title: 'API英文名称',
      dataIndex: 'name',
      className: styles.apiName,
      width: 200,
      ellipsis: true,
      render: (_, record) => (
        <EllipsisPopover
          value={renderEmptyPlaceholder(record.name)}
          isEdit={false}
        />
      )
    },
    {
      title: 'API中文名称',
      dataIndex: 'nameCn',
      className: styles.apiName,
      width: 200,
      ellipsis: true,
      render: (_, record) => (
        <EllipsisPopover
          value={renderEmptyPlaceholder(record.nameCn)}
          isEdit={false}
        />
      )
    },
    {
      title: '请求方式',
      dataIndex: 'requestMethod',
      width: 130,
      render: (_, record) => record.requestMethod || '-'
      // filters: [
      //   {
      //     text: 'GET',
      //     value: RequestMethod.get
      //   },
      //   {
      //     text: 'POST',
      //     value: RequestMethod.post
      //   }
      // ]
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
                    ? '#CBD5E1'
                    : '#007DFA',
              borderRadius: '50%',
              marginRight: '5px'
            }}
          ></div>
          <div>
            {record.status === ApiStatus.success
              ? '使用中'
              : record.status === ApiStatus.fail
                ? '已下线'
                : '开发中'}
          </div>
        </div>
      ),
      filters: [
        {
          text: '使用中',
          value: ApiStatus.success
        },
        {
          text: '已下线',
          value: ApiStatus.fail
        },
        {
          text: '开发中',
          value: ApiStatus.running
        }
      ]
    },
    {
      title: '授权数',
      dataIndex: 'authCount',
      width: 200,
      ellipsis: true
    },
    {
      title: '总调用次数',
      dataIndex: 'queryCount',
      width: 180,
      sorter: true
    },
    {
      title: '更新时间',
      dataIndex: 'updatedTime',
      width: 180,
      sorter: true
    },
    {
      title: '更新人',
      dataIndex: 'creatorName',
      width: 180
    },
    {
      title: '操作',
      dataIndex: 'operate',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <div className="flex items-center">
          <Button
            type="text"
            className="pl-0"
            onClick={() => handleToAddApi('edit', record.id)}
            disabled={record.status !== ApiStatus.running}
          >
            编辑
          </Button>
          <PermissionWrapper permission={WORKFLOW_TASK_PERMISSIONS.CAN_UPDATE}>
            <Button
              type="text"
              className="pl-0"
              onClick={() => {
                setViewFileModalVisible(true);
                setViewFileId(record.id);
              }}
            >
              查看文档
            </Button>
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
                    onClick={() => handleChangeStatus(record)}
                  >
                    {record.status === ApiStatus.success ? '下线' : '上线'}
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
                    onClick={() => {
                      handleAuthorization(Number(record.id));
                    }}
                    disabled={record.status !== ApiStatus.success}
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
                      setTestDataSource(record.paramConfig || []);
                      setTestApiId(record.id);
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
                    onClick={() => {
                      handleDeleteApi(record.id);
                    }}
                    disabled={record.status === ApiStatus.success}
                  >
                    删除
                  </Button>
                </Menu.Item>
              </Menu>
            }
            trigger="hover"
            position="bl"
          >
            <Button type="text" className="px-0">
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
      dataIndex: 'title',
      width: 600
    }
  ];

  // 已授权列表列
  const authorizedColumns: ColumnProps[] = [
    {
      title: '授权KEY',
      dataIndex: 'projectId',
      width: 200,
      ellipsis: true
    },
    {
      title: '项目名称',
      dataIndex: 'projectName',
      width: 180
    },
    {
      title: '授权时间',
      dataIndex: 'createdTime',
      width: 180
    },
    {
      title: '操作',
      dataIndex: 'operation',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <div>
          <span
            className={styles.operateText}
            onClick={() => handleCancelAuthorization(record.projectId)}
          >
            取消授权
          </span>
        </div>
      )
    }
  ];

  // 跳转创建API页面
  const handleToAddApi = (type: 'add' | 'edit', id?: string) => {
    history.push(
      id
        ? `/tenant/compute/modaforge/dataApi/add?type=${type}&id=${id}`
        : `/tenant/compute/modaforge/dataApi/add?type=${type}`
    );
  };

  return (
    <div className={styles['data-api']}>
      <h1
        style={{ fontSize: '20px', fontWeight: 'bold' }}
      >{`数据API(${total})`}</h1>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          margin: '15px 0'
        }}
      >
        <InputSearch
          placeholder="输入API名称搜索"
          allowClear
          style={{ width: 260 }}
          value={searchValue}
          onChange={(value) => {
            setSearchValue(value);
          }}
          onSearch={() => getList()}
          onClear={() => {
            setCurrent(1);
            setSearchValue('');
            setIsClickClear(true);
          }}
        />
        <Button
          type="primary"
          icon={<IconPlus />}
          onClick={() => handleToAddApi('add')}
        >
          创建API
        </Button>
      </div>
      <Table
        border={false}
        columns={columns}
        data={dataApiData}
        pagination={false}
        noDataElement={<NoDataCard title="暂无数据" />}
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
        apiId={testApiId}
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
        onCancel={() => {
          setAuthorizationModalVisible(false);
          authorizationForm.resetFields();
        }}
        onOk={authorizationForm.submit}
      >
        {/* 目前授权仅支持单选，ue稿设计样式暂时隐藏 */}
        {/* <div className={styles.authorizationModalContent}>
          <div className={styles.leftBox}>
            <InputSearch placeholder="搜索组织或项目" />
            <Table
              border={false}
              columns={authorizationColumns}
              data={authorizationData}
              pagination={false}
              noDataElement={noDataElement({ description: '暂无数据' })}
              rowKey="key"
              loading={authorizationLoading}
              rowSelection={{
                type: 'checkbox',
                selectedRowKeys: selectedAuthorizationRowKeys,
                onChange: (selectedRowKeys, selectedRows) => {
                  console.log(selectedRowKeys, selectedRows);
                  const orgKey = new Set();
                  const itemKeys = new Set();
                  selectedRows.forEach((item) => {
                    if (item.children && item.children.length > 0) {
                      orgKey.add(item.key);
                    } else {
                      itemKeys.add(item);
                    }
                  });
                  setSelectedAuthorizationRowKeys(
                    selectedRowKeys.filter(
                      (key) => !orgKey.has(key)
                    ) as string[]
                  );
                  setSelectedAuthorizationRows(
                    selectedRows.filter((item) => itemKeys.has(item))
                  );
                },
                checkStrictly: false
              }}
            />
          </div>
          <div className={styles.rightBox}>
            <div className={styles.title}>
              <div className={styles.selectedCount}>
                已选 {selectedAuthorizationRows.length}/{itemsTotal} 项
              </div>
              <IconDelete
                className={styles.deleteIcon}
                onClick={() => {
                  setSelectedAuthorizationRows([]);
                  setSelectedAuthorizationRowKeys([]);
                }}
              />
            </div>
            <div className={styles.selectedItems}>
              {selectedAuthorizationRows.map((item) => (
                <div key={item.key} className={styles.selectedItem}>
                  <div>{item.title}</div>
                  <IconClose
                    className={styles.deleteIcon}
                    onClick={() => {
                      setSelectedAuthorizationRows(
                        selectedAuthorizationRows.filter(
                          (row) => row.key !== item.key
                        )
                      );
                      setSelectedAuthorizationRowKeys(
                        selectedAuthorizationRowKeys.filter(
                          (key) => key !== item.key
                        )
                      );
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div> */}

        <div className={styles.projectSelector}>
          <Form form={authorizationForm} onSubmit={handleAuthSubmit}>
            <Form.Item
              label="项目："
              field="projectId"
              rules={[{ required: true, message: '请选择项目' }]}
              labelCol={{ span: 2 }}
              wrapperCol={{ span: 22 }}
            >
              <Cascader
                placeholder="请选择项目"
                style={{
                  backgroundColor: '#FFFFFF33',
                  borderRadius: 4
                }}
                fieldNames={{
                  label: 'title',
                  value: 'id',
                  children: 'projectList'
                }}
                options={projects}
                showSearch
                filterOption={(input, node) => {
                  return (
                    node.value.toLowerCase().indexOf(input.toLowerCase()) >
                      -1 ||
                    node.label.toLowerCase().indexOf(input.toLowerCase()) > -1
                  );
                }}
                onChange={(value, option) => {
                  setSelectedProjectName(option[1].pathLabel[1] as string);
                }}
              />
            </Form.Item>
          </Form>
          <h1 className="mb-2 text-base font-semibold">已授权列表</h1>
          <Table
            border={false}
            columns={authorizedColumns}
            data={authorizedData}
            pagination={false}
            noDataElement={<NoDataCard title="暂无数据" />}
            rowKey="key"
            loading={authorizationLoading}
          />
        </div>
      </Modal>
    </div>
  );
}
