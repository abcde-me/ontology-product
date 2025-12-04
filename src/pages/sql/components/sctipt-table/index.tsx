import React, { useEffect, useState } from 'react';
import {
  Button,
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
import styles from './index.module.scss';
import { VersionType, VersionTypeEnum } from '../sctipt-card';
import ScriptModalTable from '../sctip-modal-table';
import {
  deleteDevelopScript,
  getDevelopScriptList,
  getDevelopScriptLogByScriptId,
  lockDevelopScript
} from '@/api/sql';

interface ScriptTableProps {
  isAll: (type: boolean) => void;
  onToScriptList: (type: string) => void;
}

const ScriptTable: React.FC<ScriptTableProps> = ({ isAll, onToScriptList }) => {
  const FormItem = Form.Item;
  const [form] = Form.useForm();
  const Option = Select.Option;
  const options = [
    {
      value: 1,
      label: '未发版'
    },
    {
      value: 2,
      label: '已发版'
    },
    {
      value: 3,
      label: '调度中'
    }
  ];
  const history = useHistory();
  const userInfo = useUserInfo();
  // 初始化搜索框value
  const [searchValue, setSearchValue] = useState('');
  const [formData, setFormData] = useState({
    script_name: '', // 脚本名称
    version_type: 0, // 版本状态
    create_user: '' // 开发人
  });
  // 初始化开发脚本列表数据
  const [developScriptData, setDevelopScriptData] = useState([]);
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
    sort: ''
  });
  // 控制弹窗显示隐藏
  const [visible, setVisible] = useState<boolean>(false);
  // 初始化历史版本数据
  const [scriptLogList, setScriptLogList] = useState([]);
  // 初始化当前点击的脚本数据
  const [rowData, setRowData] = useState([]);
  // 组件初始化
  useEffect(() => {
    if (userInfo) getList();
  }, [userInfo, current, pageSize, sortValue]);

  // 清空搜索框
  useEffect(() => {
    if (isClickClear) {
      getList();
      setIsClickClear(false);
    }
  }, [isClickClear]);

  const getList = async () => {
    setLoading(true);
    try {
      const params: any = {
        script_name: formData?.script_name,
        status: formData?.version_type,
        create_user: formData?.create_user,
        page: current, //第几页
        page_size: pageSize //每页个数
        // orders: sortValue?.sort
      };
      const res = await getDevelopScriptList(params);
      console.log(res, '123');
      if (res.status === 200 && res.data) {
        setDevelopScriptData(res?.data?.items);
        // setCurrent(res.data.page_info?.page);
        // setPageSize(res.data.page_info?.page_size);
        setTotal(res.data?.total || 10);
      }
    } finally {
      setLoading(false);
    }
  };

  // 创建工作流
  const handleCreateWorkflow = () => {
    openNewPage('/modaforge/tenant/compute/modaforge/workflowConfig');
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
  const handleDelete = (script_id: number) => {
    // 如果当前有人在编辑不让删除
    lockDevelopScript(script_id).then((res) => {
      if (res.status === 200 && res.code === '') {
        Modal.confirm({
          title: (
            <span className={styles['workflow-list-modal-title']}>
              确定删除此脚本吗？
            </span>
          ),
          content: (
            <div className={styles['workflow-list-modal-content']}>
              删除后，该脚本不可恢复。
            </div>
          ),
          okText: '确定',
          cancelText: '取消',
          onOk: () => {
            handleDeleteScript(script_id);
          }
        });
      } else {
        Message.error({
          content: res?.message ?? '删除失败，请稍后重试'
        });
      }
    });
  };

  // 删除工作流
  const handleDeleteScript = async (script_id: number) => {
    const res = await deleteDevelopScript(script_id);
    if (res.status === 200 && res.code === '') {
      Message.success({
        content: '删除成功'
      });
      getList();
    } else {
      Message.error({
        content: res?.message ?? '删除失败，请稍后重试'
      });
    }
  };

  // 筛选排序操作
  const handleTableChange = (
    _pagination: PaginationProps,
    sorter: SorterInfo,
    filters: Partial<Record<string | number | symbol, string[]>>
  ) => {
    setCurrent(1);
    const sortdata = {
      sort:
        sorter.direction === undefined
          ? ''
          : sorter.direction === 'ascend'
            ? 'asc'
            : 'desc'
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
          <div className={styles['script-card-content-item-title-icon']}>-</div>
        );
    }
  };
  // table columns
  const columns: ColumnProps[] = [
    {
      title: '脚本ID',
      dataIndex: 'script_id',
      width: 200,
      sorter: (a, b) => a.length - b.length
    },
    {
      title: '脚本名称',
      dataIndex: 'script_name',
      width: 180,
      ellipsis: true,
      className: styles['hover-change'] + ' ' + styles['workflow-name']
      // render: (_, record) => {
      //   return renderEmptyPlaceholder(record.script_name) !== '-' ? (
      //     <EllipsisPopover
      //       value={record.script_name}
      //       isEdit={false}
      //       isLink
      //       handleLink={() => {
      //         viewDetailWorkflow(record.workflow_uuid, record.ds_workflow_id);
      //       }}
      //     />
      //   ) : (
      //     <span>-</span>
      //   );
      // }
    },
    {
      title: '最近版本号',
      dataIndex: 'max_version_name',
      width: 120
    },
    {
      title: '最新版本状态',
      dataIndex: 'status_name',
      width: 160,
      render: (_, record) => {
        return getVersionType(record.status);
      },
      filters: [
        {
          text: '未发版',
          value: 1
        },
        {
          text: '已发版',
          value: 2
        },
        {
          text: '调度中',
          value: 3
        }
      ]
    },
    {
      title: '开发人',
      dataIndex: 'create_user',
      width: 100,
      ellipsis: true,
      className: styles['hover-change']
    },
    {
      title: '调度版本',
      dataIndex: 'version_name',
      width: 100,
      ellipsis: true
    },
    {
      title: '所属任务节点',
      dataIndex: 'task_name',
      width: 160,
      ellipsis: true
    },
    {
      title: '所属工作流',
      dataIndex: 'process_name',
      width: 160,
      ellipsis: true
    },
    {
      title: '最后执行时间',
      dataIndex: 'update_time',
      width: 180,
      render: (_, record) => (
        <span>
          {record.update_time == '' || record.update_time == null
            ? '-'
            : new Date(record.update_time).toLocaleString()}
        </span>
      )
    },
    {
      title: '操作',
      dataIndex: 'operate',
      fixed: 'right',
      width: 200,
      render: (_, record) => {
        const perms = record.perms || [];
        return (
          <div style={{ display: 'flex' }}>
            <PermissionWrapper permission={WORKFLOW_LIST_PERMISSIONS.CAN_READE}>
              <span
                className={styles['operate-text']}
                onClick={() => {
                  onToScriptList('files');
                }}
              >
                详情
              </span>
            </PermissionWrapper>
            {/* <PermissionWrapper permission={WORKFLOW_LIST_PERMISSIONS.CAN_COPY}> */}
            <span
              className={styles['operate-text']}
              onClick={() => {
                console.log(123);
                setVisible(true);
                setRowData(record);
                getDevelopScriptLogByScriptId(record.script_id).then((res) => {
                  console.log(res, '123');
                  setScriptLogList(res?.data?.items);
                });
              }}
            >
              历史版本
            </span>
            {/* </PermissionWrapper> */}
            {/* <PermissionWrapper
              permission={WORKFLOW_LIST_PERMISSIONS.CAN_DELETE}
            > */}
            <span
              className={styles['operate-text']}
              onClick={() => handleDelete(record.script_id)}
            >
              删除
            </span>
            {/* </PermissionWrapper> */}
          </div>
        );
      }
    }
  ];

  // 点击搜索按钮
  const handleSearch = () => {
    setLoading(true);
    getList();
    isAll(true);
  };
  // 重置搜索框
  const handleReset = () => {
    isAll(false);
    setIsClickClear(true);
    form.resetFields();
  };
  const handleValuesChange = (values: any) => {
    setFormData(values);
  };

  return (
    <div className={styles['script-table-wrapper']}>
      <div className={styles['header-form-content']}>
        <Form
          onValuesChange={handleValuesChange}
          form={form}
          autoComplete="off"
          layout="inline"
        >
          <FormItem label="脚本名称:" field="script_name">
            <Input style={{ width: 236 }} placeholder="输入脚本名称搜索" />
          </FormItem>
          <FormItem label="版本状态:" field="version_type">
            <Select placeholder="请选择版本状态" style={{ width: 236 }}>
              {options.map((option, index) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </FormItem>
          <FormItem label="开发人:" field="create_user">
            <Input style={{ width: 250 }} placeholder="输入关键字搜索" />
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
        data={developScriptData}
        pagination={false}
        noDataElement={noDataElement({
          description: '暂无脚本'
        })}
        rowKey="id"
        loading={loading}
        onChange={(pagination, sorter, filters) =>
          // @ts-expect-error
          handleTableChange(pagination, sorter, filters)
        }
      />
      {/* 分页 */}
      {developScriptData && developScriptData.length > 0 && (
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
      <ScriptModalTable
        rowData={rowData}
        tableData={scriptLogList}
        isVisible={visible}
        setChildStatus={setVisible}
      />
    </div>
  );
};
export default ScriptTable;
