import React from 'react';
import {
  getStructuredWorkflowList,
  workflowCopy,
  workflowDeleteNew
} from '@/api/workflowList';
import {
  EXECUTION_TYPE_OPTIONS,
  FAILURE_STRATEGY_OPTIONS,
  FLOW_TYPE_INFO,
  PRIORITY_OPTIONS,
  Schedule,
  SCHEDULE_RELEASE_STATE_OPTIONS,
  SearchWorkflowParams,
  STATUS_FILTER,
  WorkFlowItem
} from '@/pages/workflowList/types';
import styles from './index.module.scss';
import {
  Form,
  Input,
  Grid,
  Table,
  TableColumnProps,
  Tag,
  Button,
  Pagination,
  PaginationProps,
  Message,
  Modal,
  Dropdown,
  Menu
} from '@arco-design/web-react';
import useArcoTable from '@/hooks/use-arco-table';
import { WORKFLOW_LIST_PERMISSIONS } from '@/config/permissions';
import {
  IconCheckCircleFill,
  IconClockCircle,
  IconCopy,
  IconDown,
  IconExclamationCircleFill,
  IconSearch
} from '@arco-design/web-react/icon';
import { SorterInfo } from '@arco-design/web-react/lib/Table/interface';
import { openNewPage } from '@/utils/env';
import { PermissionWrapper } from '@/components/PermissionGuard';
import copy from 'copy-to-clipboard';
import { useHasPermission } from '@/hooks';
import { NoDataCard } from '@ceai-front/arco-material';

const { Row, Col } = Grid;

export function StructuredWorkflowList() {
  const [form] = Form.useForm();
  const viewPermission = useHasPermission(WORKFLOW_LIST_PERMISSIONS.MODIFY);
  const { onSubmit, tableProps, refresh } = useArcoTable(
    ({ pagination, filters, sorter, query }) => {
      const searchParams: SearchWorkflowParams = {
        page: pagination.current,
        page_size: pagination.pageSize,
        ...query
      };
      if (sorter) {
        const { direction, field } = sorter as SorterInfo;
        !!direction &&
          (searchParams.orders = [
            {
              asc: direction === 'ascend',
              column: field as string
            }
          ]);
      }
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) searchParams[key] = value.toString();
        });
      }
      return getStructuredWorkflowList(searchParams);
    },
    {
      defaultPage: 1,
      defaultPageSize: 10,
      deps: [],
      form
    }
  );

  // 查看详情
  const viewDetailWorkflow = (flow: WorkFlowItem) => {
    const { workflow_uuid, workflow_type = 'no_struct', code } = flow;
    openNewPage(
      `/modaforge/tenant/compute/modaforge/workflowConfig/${workflow_type}?workflow_uuid=${workflow_uuid}&ds_workflow_id=${code}`
    );
  };

  // 复制工作流
  const handleCloneWorkflow = async (flow: WorkFlowItem) => {
    const { workflow_uuid, workflow_type } = flow;
    const res = await workflowCopy(workflow_uuid);
    if (res.status === 200 && res.data) {
      Message.success({
        content: '复制成功'
      });
      openNewPage(
        `/modaforge/tenant/compute/modaforge/workflowConfig/${workflow_type}?workflow_uuid=${res.data.workflow_uuid}&ds_workflow_id=${res.data.ds_workflow_id}`
      );
    } else {
      Message.error({
        content: res.message || '复制失败，请稍后重试'
      });
    }
  };

  // 点击删除操作弹窗
  const handleDelete = (flow: WorkFlowItem) => {
    const { code, workflow_uuid } = flow;
    Modal.confirm({
      title: (
        <span className={styles['workflow-list-modal-title']}>
          确定删除此工作流？
        </span>
      ),
      icon: <IconExclamationCircleFill className={'text-[#FF7D00]'} />,
      content: (
        <div className={styles['workflow-list-modal-content']}>
          删除后，该工作流不可恢复。
        </div>
      ),
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        handleDeleteWorkflow({ code, workflow_uuid });
      }
    });
  };

  // 删除工作流
  const handleDeleteWorkflow = async ({
    code,
    workflow_uuid
  }: {
    code: string;
    workflow_uuid: string;
  }) => {
    const res = await workflowDeleteNew({ code, workflow_uuid });
    if (res.status === 200 && res.code === '') {
      Message.success({
        content: '删除成功'
      });
      refresh();
    } else {
      Message.error({
        content: res?.message ?? '删除失败，请稍后重试'
      });
    }
  };

  const columns: TableColumnProps<WorkFlowItem>[] = [
    {
      title: 'ID',
      dataIndex: 'code',
      width: 180,
      fixed: 'left',
      render(value, record) {
        return (
          <div
            className={`flex w-full items-center gap-1 overflow-hidden ${styles['content-with-copy']} text-default`}
            title={value}
          >
            <div
              className={'overflow-hidden overflow-ellipsis whitespace-nowrap'}
            >
              {value}
            </div>
            <IconCopy
              className={`${styles['workflow-name-copy']} flex-shrink-0`}
              onClick={(e) => {
                e.stopPropagation();
                const copied = copy(value);
                if (copied) {
                  Message.success('复制工作流ID成功');
                }
              }}
            />
          </div>
        );
      }
    },
    {
      title: '工作流名称',
      dataIndex: 'name',
      ellipsis: true,
      tooltip: true,
      render: (value, record) => (
        <div
          className={`${styles['workflow-name']} flex w-full items-center gap-1 overflow-hidden hover:${viewPermission ? 'cursor-pointer' : 'cursor-not-allowed'}`}
          onClick={() => {
            if (!viewPermission) return;
            viewDetailWorkflow(record);
          }}
          title={value}
        >
          <div
            className={
              'overflow-hidden overflow-ellipsis whitespace-nowrap font-PingFangSc text-[14px] font-medium leading-[22px]'
            }
          >
            {value}
          </div>
          <IconCopy
            className={`${styles['workflow-name-copy']} flex-shrink-0`}
            onClick={(e) => {
              e.stopPropagation();
              const copied = copy(value);
              if (copied) {
                Message.success('复制工作流名称成功');
              }
            }}
          />
        </div>
      )
    },
    {
      title: '工作流描述',
      dataIndex: 'description',
      ellipsis: true,
      tooltip: true,
      width: 150,
      render(v) {
        return v || '-';
      }
    },
    {
      title: '状态',
      dataIndex: 'release_state',
      width: 100,
      render: (value: string) => {
        if (value === 'ONLINE') {
          return (
            <Tag color={'green'} size={'medium'}>
              <IconCheckCircleFill />
              已上线
            </Tag>
          );
        }
        return (
          <Tag color={'gray'} size={'medium'}>
            <IconClockCircle />
            未上线
          </Tag>
        );
      },
      filterMultiple: false,
      filters: STATUS_FILTER
    },
    {
      title: '运行策略',
      dataIndex: 'execution_type',
      width: 120,
      eclipsis: true,
      filterMultiple: false,
      filters: EXECUTION_TYPE_OPTIONS.map(({ label, value }) => ({
        value,
        text: label
      })),
      render(_, r) {
        return r.execution_type_name || '-';
      }
    },
    {
      title: '运行类型',
      dataIndex: 'schedule_release_state',
      width: 120,
      filterMultiple: false,
      filters: SCHEDULE_RELEASE_STATE_OPTIONS.map(({ label, value }) => ({
        value,
        text: label
      })),
      render(_, r) {
        return r.schedule_type_name;
      }
    },
    {
      title: '运行时间设置',
      dataIndex: 'schedule',
      width: 120,
      render: (value: Schedule) => {
        return value.crontab || '-';
      }
    },
    {
      title: '优先级',
      dataIndex: 'process_instance_priority',
      width: 120,
      render: (_, value) => {
        const priority = value.schedule.process_instance_priority;
        if (!priority) return '-';
        const { label = '最低', color = 'gray' } =
          PRIORITY_OPTIONS.find(({ value: field }) => priority === field) || {};
        return <Tag color={color}>{label}</Tag>;
      },
      filterMultiple: false,
      filters: PRIORITY_OPTIONS.map(({ label, value }) => ({
        value,
        text: label
      }))
    },
    {
      title: '失败策略',
      dataIndex: 'failure_strategy',
      width: 120,
      filterMultiple: false,
      filters: FAILURE_STRATEGY_OPTIONS.map(({ label, value }) => ({
        value,
        text: label
      })),
      render(_, r) {
        return r.schedule.failure_strategy_name || '-';
      }
    },
    {
      title: '更新人',
      dataIndex: 'update_user',
      ellipsis: true
    },
    {
      title: '更新时间',
      dataIndex: 'update_time',
      width: 180,
      sorter: true
    },
    {
      title: '操作',
      dataIndex: 'action',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <div className={'flex gap-4'}>
          <PermissionWrapper permission={WORKFLOW_LIST_PERMISSIONS.MODIFY}>
            <Button
              type="text"
              onClick={() => viewDetailWorkflow(record)}
              className={'p-0'}
            >
              详情
            </Button>
          </PermissionWrapper>
          <PermissionWrapper permission={WORKFLOW_LIST_PERMISSIONS.CREATE}>
            <Button
              type="text"
              onClick={() => handleCloneWorkflow(record)}
              className={'p-0'}
            >
              复制
            </Button>
          </PermissionWrapper>
          <PermissionWrapper permission={WORKFLOW_LIST_PERMISSIONS.DELETE}>
            <Button
              type="text"
              onClick={() => handleDelete(record)}
              disabled={record.release_state === 'ONLINE'}
              className={'p-0'}
            >
              删除
            </Button>
          </PermissionWrapper>
        </div>
      )
    }
  ];

  const dropList = (
    <Menu
      onClickMenuItem={(key) => {
        openNewPage(
          `/modaforge/tenant/compute/modaforge/workflowConfig/${key}`
        );
      }}
      className={styles['flow-type-menu']}
    >
      {FLOW_TYPE_INFO.map(({ title, subTitle, type }) => (
        <Menu.Item key={type}>
          <div
            className={
              'mb-1 h-[22px] text-[14px] font-bold leading-[22px] text-[#0F172A]'
            }
          >{`${title}数据处理`}</div>
          <div
            className={
              'h-[18px] text-[12px] font-[400] leading-[18px] text-[#334155]'
            }
          >
            {`创建用于${subTitle}的工作流`}
          </div>
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <div className={'w-full pt-4'}>
      <Form
        form={form}
        layout={'horizontal'}
        autoComplete={'off'}
        className={'min-w-0'}
        labelAlign={'right'}
        onChange={() => onSubmit()}
      >
        <Row>
          <Col span={6}>
            <Form.Item field="keywords" className={'w-full'}>
              <Input
                placeholder="输入工作流ID或名称进行搜索"
                allowClear
                suffix={<IconSearch />}
              />
            </Form.Item>
          </Col>
          <Col span={18}>
            <div className={'mb-2 flex w-full justify-end'}>
              <PermissionWrapper permission={WORKFLOW_LIST_PERMISSIONS.CREATE}>
                <Dropdown droplist={dropList} trigger="hover" position="br">
                  <Button type="primary">
                    创建工作流 <IconDown />
                  </Button>
                </Dropdown>
              </PermissionWrapper>
            </div>
          </Col>
        </Row>
      </Form>
      <Table
        {...tableProps}
        columns={columns}
        rowKey="id"
        scroll={{ x: 2000 }}
        noDataElement={
          <div className={'py-[100px]'}>
            <NoDataCard
              title={'暂无工作流'}
              primaryBtn={
                <PermissionWrapper
                  permission={WORKFLOW_LIST_PERMISSIONS.CREATE}
                >
                  <Dropdown droplist={dropList} trigger="hover" position="br">
                    <Button type="primary">
                      创建工作流 <IconDown />
                    </Button>
                  </Dropdown>
                </PermissionWrapper>
              }
            />
          </div>
        }
        pagination={false}
        border={false}
      />
      <Pagination
        style={{
          justifyContent: 'flex-end',
          marginTop: '10px'
        }}
        {...(tableProps.pagination as PaginationProps)}
        showTotal
        showJumper
        sizeCanChange
        sizeOptions={[10, 20, 50, 100]}
      ></Pagination>
    </div>
  );
}
