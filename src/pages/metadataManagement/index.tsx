import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Menu,
  Pagination,
  PaginationProps,
  Table,
  Select
} from '@arco-design/web-react';
import { useHistory } from 'react-router';
import { ColumnProps } from '@arco-design/web-react/es/Table';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import noDataElement from '@/components/no-data';
import { getWorkflowList } from '@/api/workflowList';
import { useUserInfo } from '@/store/userInfoStore';
import { SorterInfo } from '@arco-design/web-react/es/Table/interface';
import { PermissionWrapper } from '@/components/PermissionGuard';
import { WORKFLOW_LIST_PERMISSIONS } from '@/config/permissions';
import { openNewPage } from '@/utils/env';
import SettingsIcon from '@/assets/metadata/settings.svg';
import ColumnSettingIcon from '@/assets/metadata/column-setting.svg';
import StorageIcon from '@/assets/metadata/storage.svg';
import styles from './index.module.scss';
import { IconPlus, IconRefresh } from '@arco-design/web-react/icon';

const InputSearch = Input.Search;

export default function WorkflowList() {
  const history = useHistory();
  const userInfo = useUserInfo();
  const MenuItem = Menu.Item;
  // 搜索表单
  const searchForm = useRef<any>(null);

  // 初始化搜索框value
  const [searchValue, setSearchValue] = useState('');
  // 初始化工作流列表数据
  const [workflowData, setWorkflowData] = useState([]);
  // 当前的第几页
  const [current, setCurrent] = useState(1);
  // 每页展示数据的数据量
  const [pageSize, setPageSize] = useState(10);
  // 总数据量
  const [total, setTotal] = useState(10);
  // 添加loading状态控制
  const [loading, setLoading] = useState(false);
  // 区分是否点击按钮清空搜索框
  const [isClickClear, setIsClickClear] = useState(false);
  // 初始化筛选的值
  const [sortValue, setSortValue] = useState({
    run_cycle: '',
    sort: ''
  });

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
        search_content: searchValue,
        page: current, //第几页
        page_size: pageSize, //每页个数
        ...sortValue
      };
      const res = await getWorkflowList(params);
      if (res.status === 200 && res.data) {
        setWorkflowData(res.data.list);
        setCurrent(res.data.page_info?.page);
        setPageSize(res.data.page_info?.page_size);
        setTotal(res.data.page_info?.total || 10);
      }
    } finally {
      setLoading(false);
    }
  };

  // 创建工作流
  const handleCreateWorkflow = () => {
    openNewPage('/modaforge/tenant/compute/modaforge/workflowConfig');
  };

  // 跳转目录
  const handleToDirectoryPath = (
    id: string,
    parent_id: string,
    root_type: string | number
  ) => {
    history.push(
      `/tenant/compute/modaforge/dataCatalog/list?root_type=${root_type}&id=${id}&parent_id=${parent_id}`
    );
  };
  // 查看详情
  const viewDetailWorkflow = (
    workflow_uuid: number | string,
    ds_workflow_id: number | string
  ) => {
    openNewPage(
      `/modaforge/tenant/compute/modaforge/workflowConfig?workflow_uuid=${workflow_uuid}&ds_workflow_id=${ds_workflow_id}`
    );
  };

  // 筛选排序操作
  const handleTableChange = (
    _pagination: PaginationProps,
    sorter: SorterInfo,
    filters: Partial<Record<string | number | symbol, string[]>>
  ) => {
    setCurrent(1);
    const sortdata = {
      run_cycle:
        filters.run_cycle === undefined ? '' : filters.run_cycle.join(','),
      is_online:
        filters.is_online === undefined ? '' : filters.is_online.join(','),
      sort:
        sorter.direction === undefined
          ? ''
          : sorter.direction === 'ascend'
            ? 'create_time:ASC'
            : 'create_time:DESC'
    };

    setSortValue(sortdata);
  };

  // table数据为空时展示-
  const renderEmptyPlaceholder = (value: string | null) => {
    return value === '' || value == null ? '-' : value;
  };

  // 搜索表单提交
  const handleSearch = (values: any) => {
    console.log(values, 'vvvvv');
    // setSearchValue(values.search_content);
    // setCurrent(1);
  };

  // table columns
  const columns: ColumnProps[] = [
    {
      title: '序号',
      dataIndex: 'index',
      width: 60,
      align: 'center',
      render: (_, record, index) => index + 1
    },
    {
      title: '表英文名称',
      dataIndex: 'workflow_name_english',
      width: 280,
      ellipsis: true,
      className: styles['hover-change'] + ' ' + styles['table-name'],
      render: (_, record) => {
        return renderEmptyPlaceholder(record.workflow_name) !== '-' ? (
          <EllipsisPopover
            value={record.workflow_name}
            isEdit={false}
            isLink
            handleLink={() => {
              viewDetailWorkflow(record.workflow_uuid, record.ds_workflow_id);
            }}
          />
        ) : (
          <span>-</span>
        );
      }
    },
    {
      title: '表中文名称',
      dataIndex: 'workflow_name',
      width: 280,
      ellipsis: true,
      className: styles['hover-change'] + ' ' + styles['table-name'],
      render: (_, record) => {
        return renderEmptyPlaceholder(record.workflow_name) !== '-' ? (
          <EllipsisPopover
            value={record.workflow_name}
            isEdit={false}
            isLink
            handleLink={() => {
              viewDetailWorkflow(record.workflow_uuid, record.ds_workflow_id);
            }}
          />
        ) : (
          <span>-</span>
        );
      }
    },
    {
      title: '所属数据库',
      dataIndex: 'source_path',
      width: 120,
      ellipsis: true,
      className: styles['hover-change'],
      render: (_, record) => {
        return renderEmptyPlaceholder(record.source_path) !== '-' ? (
          <EllipsisPopover
            value={record.source_path}
            isEdit={false}
            isLink
            handleLink={() => {
              handleToDirectoryPath(
                record.source_path_id,
                record.parent_source_path_id,
                1
              );
            }}
          />
        ) : (
          <span>-</span>
        );
      }
    },
    {
      title: '分区字段',
      dataIndex: 'target_path',
      width: 120,
      ellipsis: true,
      className: styles['hover-change'],
      render: (_, record) => {
        return renderEmptyPlaceholder(record.dataset_name) !== '-' ? (
          <EllipsisPopover value={record.dataset_name} isEdit={false} />
        ) : (
          <span>-</span>
        );
      }
    },
    {
      title: '分区数',
      dataIndex: 'partition_num',
      width: 100,
      ellipsis: true,
      render: (_, record) => (
        <EllipsisPopover
          value={renderEmptyPlaceholder(record.user_name)}
          isEdit={false}
        />
      )
    },
    {
      title: '存储大小（G）',
      dataIndex: 'storage_size',
      width: 150,
      ellipsis: true,
      render: (_, record) => (
        <EllipsisPopover
          value={renderEmptyPlaceholder(record.user_name)}
          isEdit={false}
        />
      )
    },
    {
      title: '文件数',
      dataIndex: 'user_name',
      width: 100,
      ellipsis: true,
      render: (_, record) => (
        <EllipsisPopover
          value={renderEmptyPlaceholder(record.user_name)}
          isEdit={false}
        />
      )
    },
    {
      title: '更新时间',
      dataIndex: 'create_time',
      width: 160,
      render: (_, record) => (
        <span>
          {record.create_time == '' || record.create_time == null
            ? '-'
            : new Date(record.create_time).toLocaleString()}
        </span>
      ),
      sorter: true
    },
    {
      title: '最近访问时间',
      dataIndex: 'update_time',
      width: 160,
      render: (_, record) => (
        <span>
          {record.update_time == '' || record.update_time == null
            ? '-'
            : new Date(record.update_time).toLocaleString()}
        </span>
      ),
      sorter: true
    }
  ];

  return (
    <div className={styles['metadataManagement']}>
      <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>元数据管理</h1>
      <div className="mt-4 flex">
        <div className={styles['leftBox']}>
          <Menu defaultSelectedKeys={['Iceberg']}>
            <MenuItem key="Iceberg">Iceberg</MenuItem>
            <MenuItem key="Doris">Doris</MenuItem>
            <MenuItem key="MinIO">MinIO</MenuItem>
            <MenuItem key="Milvus">Milvus</MenuItem>
          </Menu>
        </div>
        <div className={styles['rightBox']}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              padding: '16px 0',
              borderRadius: '4px',
              borderBottom: '1px solid var(--LineLine-color-border-2, #E2E8F0)'
            }}
          >
            <Form
              ref={searchForm}
              onSubmit={handleSearch}
              layout="inline"
              style={{
                justifyContent: 'space-between'
              }}
            >
              <Form.Item label="目录类型：" field="directory_type">
                <Select placeholder="请选择文件类型" />
              </Form.Item>
              <Form.Item label="表名：" field="table_name">
                <Input placeholder="请输入关键字搜索" />
              </Form.Item>
              <Form.Item label="表中文：" field="table_name_zh">
                <Input placeholder="请输入关键字搜索" />
              </Form.Item>
            </Form>
            <div className="flex items-center justify-between">
              <div>
                <PermissionWrapper
                  permission={WORKFLOW_LIST_PERMISSIONS.CREATE}
                >
                  <Button
                    type="outline"
                    onClick={() => searchForm?.current?.submit()}
                    loading={loading}
                  >
                    查询
                  </Button>
                  <Button
                    type="text"
                    onClick={() => searchForm?.current?.submit()}
                    loading={loading}
                  >
                    重置
                  </Button>
                </PermissionWrapper>
              </div>
              <Button
                type="text"
                className={styles['settingBtn']}
                icon={<SettingsIcon />}
                loading={loading}
              >
                设置搜索条件
              </Button>
            </div>
          </div>
          <div className="mb-3 mt-4 flex items-center justify-between">
            <h1 className="text-base font-semibold">数据列表(500)</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#6E7B8D]">
                2025-12-12 00:00:00 更新
              </span>
              <Button
                className={styles['refreshBtn']}
                icon={<IconRefresh className="text-[#1E293B]" />}
              />
              <Button className={styles['refreshBtn']} icon={<StorageIcon />}>
                表转API
              </Button>
              <Button
                className={styles['refreshBtn']}
                icon={<IconPlus className="text-[#1E293B]" />}
              >
                创建数据库
              </Button>
              <Button
                className={styles['refreshBtn']}
                icon={<IconPlus className="text-[#1E293B]" />}
              >
                创建物理表
              </Button>
              <Button
                className={styles['refreshBtn']}
                icon={<ColumnSettingIcon />}
              >
                列设置
              </Button>
            </div>
          </div>
          <Table
            border={false}
            columns={columns}
            data={workflowData}
            pagination={false}
            noDataElement={noDataElement({
              description: '暂无工作流',
              btnText: '创建工作流',
              perms: WORKFLOW_LIST_PERMISSIONS.CREATE,
              handleBtn: () => handleCreateWorkflow()
            })}
            rowKey="id"
            loading={loading}
            onChange={(pagination, sorter, filters) =>
              // @ts-expect-error
              handleTableChange(pagination, sorter, filters)
            }
            scroll={{
              x: true
            }}
          />
          {/* 分页 */}
          {workflowData && workflowData.length > 0 && (
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
        </div>
      </div>
    </div>
  );
}
