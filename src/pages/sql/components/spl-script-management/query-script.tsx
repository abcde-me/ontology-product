import React, { useEffect, useState } from 'react';
import {
  Button,
  DatePicker,
  Form,
  Input,
  Message,
  Modal,
  Pagination,
  PaginationProps,
  Popover,
  Select,
  Table
} from '@arco-design/web-react';
import { useHistory } from 'react-router';
import { ColumnProps } from '@arco-design/web-react/es/Table';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import Success11Icon from '@/pages/workflowConfig/styles/images/op-icons/success1.svg';
import noDataElement from '@/components/no-data';
import {
  getWorkflowList,
  workflowDelete,
  workflowCopy
} from '@/api/workflowList';
import { useUserInfo } from '@/store/userInfoStore';
import { SorterInfo } from '@arco-design/web-react/es/Table/interface';
import { PermissionWrapper } from '@/components/PermissionGuard';
import { WORKFLOW_LIST_PERMISSIONS } from '@/config/permissions';
import { IconClockCircle, IconRefresh } from '@arco-design/web-react/icon';
import { openNewPage } from '@/utils/env';
import styles from './query-script.module.scss';
import { VersionType, VersionTypeEnum } from '../sctipt-card';
import ScriptModalTable from '../sctip-modal-table';

const InputSearch = Input.Search;

const QueryScript: React.FC = () => {
  const FormItem = Form.Item;
  const Option = Select.Option;
  const options = ['全部', '已发布', '未发布', '草稿'];
  const history = useHistory();
  const userInfo = useUserInfo();
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
  // 控制弹窗显示隐藏
  const [visible, setVisible] = useState<boolean>(false);
  // 初始化查询脚本数量
  const [queryNum, setQueryNum] = useState<number>(100);
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
  // 跳转目标数据 - 数据集详情
  const handleToTargetDatasetDetail = (id: string) => {
    history.push(`/tenant/compute/modaforge/datasetManagement/detail/${id}`);
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

  // 点击删除操作弹窗
  const handleDelete = (
    workflow_uuid: number | string,
    workflow_version: string
  ) => {
    Modal.confirm({
      title: (
        <span className={styles['workflow-list-modal-title']}>
          确认删除此脚本？
        </span>
      ),
      content: (
        <div className={styles['workflow-list-modal-content']}>
          删除此脚本后，脚本将无法恢复。
        </div>
      ),
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        handleDeleteWorkflow(workflow_uuid, workflow_version);
      }
    });
  };

  // 删除工作流
  const handleDeleteWorkflow = async (
    workflow_uuid: number | string,
    workflow_version: string
  ) => {
    // const res = await workflowDelete(workflow_uuid, workflow_version);
    // if (res.status === 200 && res.code === '') {
    //   Message.success({
    //     content: '删除成功'
    //   });
    //   getList();
    // } else {
    //   Message.error({
    //     content: res?.message ?? '删除失败，请稍后重试'
    //   });
    // }
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
  const getVersionType = (version_type) => {
    switch (version_type) {
      case VersionType.RELEASED:
        return (
          <div className={styles['script-card-content-item-title-icon']}>
            <span
              className={
                version_type === VersionType.RELEASED
                  ? styles['released-icon']
                  : ''
              }
            />
            <div className={styles['script-card-content-item-title-icon-text']}>
              {VersionTypeEnum.RELEASED}
            </div>
          </div>
        );
      case VersionType.UNRELEASED:
        return (
          <div className={styles['script-card-content-item-title-icon']}>
            <span
              className={
                version_type === VersionType.UNRELEASED
                  ? styles['unreleased-icon']
                  : ''
              }
            />
            <div className={styles['script-card-content-item-title-icon-text']}>
              {VersionTypeEnum.UNRELEASED}
            </div>
          </div>
        );
      case VersionType.SCHEDULED:
        return (
          <div className={styles['script-card-content-item-title-icon']}>
            <span
              className={
                version_type === VersionType.SCHEDULED
                  ? styles['scheduled-icon']
                  : ''
              }
            />
            <div className={styles['script-card-content-item-title-icon-text']}>
              {VersionTypeEnum.SCHEDULED}
            </div>
          </div>
        );
      default:
        return (
          <div className={styles['script-card-content-item-title-icon']}>
            <span
              className={
                version_type === VersionType.UNRELEASED
                  ? styles['unreleased-icon']
                  : ''
              }
            />
            <div className={styles['script-card-content-item-title-icon-text']}>
              {VersionTypeEnum.UNRELEASED}
            </div>
          </div>
        );
    }
  };
  // table columns
  const columns: ColumnProps[] = [
    {
      title: '序号',
      dataIndex: 'id',
      width: 100,
      sorter: (a, b) => a.name.length - b.name.length
    },
    {
      title: '脚本名称',
      dataIndex: 'workflow_name',
      width: 320,
      ellipsis: true,
      className: styles['hover-change'] + ' ' + styles['workflow-name'],
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
      title: '脚本说明',
      dataIndex: 'run_cycle',
      width: 320,
      render: (_, record) =>
        record.run_cycle ? <span>周期运行</span> : <span>单次运行</span>
    },
    {
      title: '更新人',
      dataIndex: 'source_path',
      width: 134,
      ellipsis: true,
      className: styles['hover-change']
    },
    {
      title: '更新时间',
      dataIndex: 'create_time',
      width: 180,
      render: (_, record) => (
        <span>
          {record.create_time == '' || record.create_time == null
            ? '-'
            : new Date(record.create_time).toLocaleString()}
        </span>
      )
    },
    {
      title: '操作',
      dataIndex: 'operate',
      fixed: 'right',
      width: 120,
      render: (_, record) => {
        const perms = record.perms || [];
        return (
          <div style={{ display: 'flex' }}>
            <PermissionWrapper permission={WORKFLOW_LIST_PERMISSIONS.CAN_READE}>
              <span
                className={styles['operate-text']}
                onClick={() => {
                  viewDetailWorkflow(
                    record.workflow_uuid,
                    record.ds_workflow_id
                  );
                }}
              >
                详情
              </span>
            </PermissionWrapper>
            <span
              className={
                record.is_online
                  ? styles['disabled-text']
                  : styles['operate-text']
              }
              onClick={() =>
                handleDelete(record.workflow_uuid, record.workflow_version)
              }
            >
              删除
            </span>
          </div>
        );
      }
    }
  ];

  // 点击搜索按钮
  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };
  // 重置搜索框
  const handleReset = () => {
    setSearchValue('');
    setIsClickClear(true);
  };
  return (
    <div className={styles['query-script-wrapper']}>
      <div className={styles['query-script-title']}>查询脚本({queryNum})</div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          marginBottom: '16px'
        }}
      >
        <Form autoComplete="off" layout="inline">
          <FormItem label="脚本名称:" field="script_name">
            <Input style={{ width: 236 }} placeholder="输入脚本名称搜索" />
          </FormItem>
          <FormItem label="更新人:" field="update_user">
            <Input style={{ width: 250 }} placeholder="输入关键字搜索" />
          </FormItem>
          <FormItem label="更新时间:" field="update_time">
            <DatePicker.RangePicker style={{ width: 350 }} />
          </FormItem>
        </Form>
        <div style={{ display: 'flex', flex: 1 }}>
          <Button
            type="text"
            onClick={handleReset}
            icon={<IconRefresh />}
            style={{ marginRight: 8 }}
          >
            重置
          </Button>
          <Button type="primary" onClick={handleSearch} loading={loading}>
            查询
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
  );
};
export default QueryScript;
