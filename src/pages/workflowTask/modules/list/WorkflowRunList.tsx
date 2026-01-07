import React, { useCallback, useMemo } from 'react';
import styles from './WorkflowRunList.module.scss';
import {
  Form,
  Input,
  Select,
  Table,
  Button,
  Pagination,
  Tooltip,
  Dropdown,
  Menu,
  Message,
  Popover
} from '@arco-design/web-react';
import {
  IconSearch,
  IconQuestionCircle,
  IconCopy,
  IconMore,
  IconRefresh,
  IconDown
} from '@arco-design/web-react/icon';
import { getWorkflowTaskList, workflowOperation } from '@/api/workflowTask';
import type {
  WorkflowTaskItem,
  GetWorkflowTaskListParams,
  WorkflowType
} from '@/types/workflowTaskApi';
import {
  TriggerType,
  TriggerTypeNameMap,
  WorkflowOperationType,
  WorkflowTaskStatus,
  WorkflowTaskStatusNameMap
} from '@/types/workflowTaskApi';
import { useWorkflowTable } from '../../hooks/useWorkflowTable';
import {
  WORKFLOW_RUN_STATUS_MAP,
  WORKFLOW_STATUS_OPTIONS
} from '../../common/constants';
import type { ColumnProps } from '@arco-design/web-react/lib/Table';
import type { PaginationProps } from '@arco-design/web-react';
import type { SorterInfo } from '@arco-design/web-react/lib/Table/interface';
import noDataElement from '@/components/no-data';
import ellipsisPopoverCom from '@/components/ellipsis-popover-com';
import EllipsisPopoverCom from '@/components/ellipsis-popover-com';
import copy from 'copy-to-clipboard';
import { useHistory } from 'react-router';
import { openNewPage } from '@/utils/env';
import { PermissionWrapper } from '@/components/PermissionGuard';
import { WORKFLOW_TASK_PERMISSIONS } from '@/config/permissions';
import { delay } from 'lodash-es';
import { NoDataCard } from '@ceai-front/arco-material';

const { Option } = Select;
const FormItem = Form.Item;

export default function WorkflowRunList() {
  const [form] = Form.useForm();
  const history = useHistory();

  // 工作流详情
  const handleWorkflowDetail = useCallback(
    (
      id: string,
      params?: {
        workflow_type?: WorkflowType;
        workflow_uuid?: string;
        ds_workflow_id?: string;
        workflow_version?: string;
      }
    ) => {
      const url = `/tenant/compute/modaforge/workflowTask/detail/${id}`;
      const queryParams = `?workflow_type=${params?.workflow_type}&workflow_uuid=${params?.workflow_uuid}&ds_workflow_id=${params?.ds_workflow_id}&workflow_version=${params?.workflow_version}`;
      history.push(`${url}${queryParams}`);
    },
    [history]
  );

  // 跳转到工作流配置页面
  const handleWorkflowConfig = useCallback((record: WorkflowTaskItem) => {
    if (!record.workflow_uuid || !record.process_definition_code) {
      Message.warning('工作流信息不完整，无法跳转');
      return;
    }
    const url = `/modaforge/tenant/compute/modaforge/workflowConfig/${record.workflow_type || 'struct'}`;
    const queryParams = `?workflow_uuid=${record.workflow_uuid}&ds_workflow_id=${record.process_definition_code}&workflow_version=${record.workflow_version}`;
    openNewPage(`${url}${queryParams}`);
  }, []);

  // 格式化工作流运行记录请求参数
  const formatWorkflowParams = useCallback(
    (
      formValues: any,
      pagination: PaginationProps,
      sorter?: SorterInfo,
      filters?: Record<string, any>
    ): GetWorkflowTaskListParams => {
      const orders =
        sorter?.direction && sorter.field
          ? [
              {
                asc: sorter.direction === 'ascend',
                column: sorter.field as string
              }
            ]
          : [];

      // 从 filters 中获取 command_type_list 和 state_list
      const trigger_type_list = filters?.trigger_type_name ?? [];
      const state_list = formValues.state ? [formValues.state] : [];

      return {
        trigger_type_list,
        id: formValues.id ? Number(formValues.id) : undefined,
        keywords: formValues.keywords || '',
        orders,
        state_list,
        page: pagination.current || 1,
        page_size: pagination.pageSize || 10
      };
    },
    []
  );

  // 工作流运行记录表格hook
  const table = useWorkflowTable<WorkflowTaskItem, GetWorkflowTaskListParams>({
    service: async (params) => {
      const res = await getWorkflowTaskList(params);
      return {
        data: {
          items: res.data?.items || [],
          total: res.data?.total || 0,
          page: res.data?.page || 1,
          page_size: res.data?.page_size || 10
        }
      };
    },
    form,
    formatParams: formatWorkflowParams,
    defaultPageSize: 10,
    manual: false
  });

  // 复制文本
  const handleCopy = useCallback((text: string) => {
    const success = copy(text);
    Message[success ? 'success' : 'error'](success ? '复制成功' : '复制失败');
  }, []);

  const getOperationSuccessMessage = useCallback(
    (type: WorkflowOperationType) => {
      switch (type) {
        case WorkflowOperationType.STOP:
          return '结束运行成功';
        case WorkflowOperationType.PAUSE:
          return '暂停运行成功';
        case WorkflowOperationType.RECOVER_SUSPENDED_PROCESS:
          return '继续运行成功';
        case WorkflowOperationType.REPEAT_RUNNING:
          return '重新运行成功';
        case WorkflowOperationType.START_FAILURE_TASK_PROCESS:
          return '重试所有失败任务成功，可前往任务节点运行记录查看';
        default:
          return '操作成功';
      }
    },
    []
  );

  // 工作流操作
  const handleWorkflowOperation = useCallback(
    async (type: WorkflowOperationType, processInstanceId: string) => {
      try {
        const res = await workflowOperation({
          execute_type: type,
          process_instance_id: Number(processInstanceId)
        });
        if (res.status === 200) {
          Message.success(getOperationSuccessMessage(type));
          delay(() => {
            table.refresh();
          }, 500);
        } else {
          Message.error(res.message || '操作失败');
        }
      } catch (error) {
        console.error('操作失败:', error);
        Message.error('操作失败，请稍后重试');
      }
    },
    [table.refresh, getOperationSuccessMessage]
  );

  // 工作流运行记录表格列
  const columns: ColumnProps<WorkflowTaskItem>[] = useMemo(
    () => [
      {
        title: '工作流运行ID',
        dataIndex: 'id',
        width: 180,
        className: styles['hover-change'],
        render: (value: string, record: WorkflowTaskItem) => (
          <EllipsisPopoverCom
            value={value}
            isLink={!!record.workflow_type}
            handleLink={() =>
              handleWorkflowDetail(value, {
                workflow_type: record.workflow_type,
                workflow_uuid: record.workflow_uuid,
                ds_workflow_id: record.process_definition_code,
                workflow_version: record.workflow_version
              })
            }
          />
        )
      },
      {
        title: '工作流名称',
        dataIndex: 'process_definition_name',
        width: 200,
        className: styles['hover-change'],
        render: (value: string, record: WorkflowTaskItem) => {
          const isLink =
            !!record.workflow_type &&
            !!record.workflow_uuid &&
            !!record.process_definition_code;

          return (
            <div
              className={`flex items-center gap-1 ${styles['workflow-name-container']} ${
                isLink ? styles['is-link'] : ''
              }`}
            >
              <EllipsisPopoverCom
                isLink={isLink}
                value={value}
                preferTypography
                handleLink={() => {
                  handleWorkflowConfig(record);
                }}
              />
              <IconCopy
                className={styles['workflow-name-copy']}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(value);
                }}
              />
            </div>
          );
        }
      },
      {
        title: '运行状态',
        dataIndex: 'state',
        width: 150,
        render: (state: string, record: WorkflowTaskItem) => {
          // 使用原始状态值（新的枚举值），如果不存在则使用 stateName，最后使用默认值
          const statusMap = WORKFLOW_RUN_STATUS_MAP[state] ||
            WORKFLOW_RUN_STATUS_MAP[record.stateName] || {
              text: record.stateName || state,
              color: '#666',
              dotColor: '#666'
            };
          return (
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: statusMap.dotColor }}
              />
              <span className="text-var(--color-text-1)">{statusMap.text}</span>
            </div>
          );
        }
      },
      {
        title: '运行类型',
        dataIndex: 'trigger_type_name',
        width: 120,
        filters: [
          {
            text: TriggerTypeNameMap[TriggerType.SCHEDULE],
            value: TriggerType.SCHEDULE
          },
          {
            text: TriggerTypeNameMap[TriggerType.MANUAL],
            value: TriggerType.MANUAL
          }
        ]
      },
      {
        title: '运行提交时间',
        dataIndex: 'command_start_time',
        width: 180,
        sorter: true,
        sortDirections: ['ascend', 'descend'],
        render: (value: string) => (
          <EllipsisPopoverCom value={value} preferTypography />
        )
      },
      {
        title: '提交人',
        dataIndex: 'operator',
        width: 120,
        render: (value: string) => (
          <EllipsisPopoverCom value={value} preferTypography />
        )
      },
      {
        title: '开始时间',
        dataIndex: 'start_time',
        width: 180,
        sorter: true,
        sortDirections: ['ascend', 'descend'],
        render: (value: string) => (
          <EllipsisPopoverCom value={value} preferTypography />
        )
      },
      {
        title: '结束时间',
        dataIndex: 'end_time',
        width: 180,
        sorter: true,
        sortDirections: ['ascend', 'descend'],
        render: (value: string) => (
          <EllipsisPopoverCom value={value} preferTypography />
        )
      },
      {
        title: '运行时长',
        dataIndex: 'duration',
        width: 180,
        render: (value: string) => <span>{value ?? '-'}</span>
      },
      // {
      //   title: '重试次数',
      //   dataIndex: 'try_times',
      //   width: 180,
      //   render: (value: string) => <span>{value ?? '-'}</span>
      // },
      {
        title: '操作',
        width: 240,
        fixed: 'right' as const,
        render: (_: any, record: WorkflowTaskItem) => {
          let tooltipTitle = '';

          if (record.state === WorkflowTaskStatus.FAILURE) {
            tooltipTitle = '';
          } else {
            tooltipTitle = '无失败任务';
          }

          // const operationMenu = (
          //   <Menu>
          //     {/** 只有运行中状态展示结束运行 */}
          //     {record.state === WorkflowTaskStatus.RUNNING_EXECUTION && (
          //       <Menu.Item
          //         key="pause"
          //         className="text-[rgb(var(--primary-6))] hover:text-[rgb(var(--primary-6))]"
          //         onClick={() =>
          //           handleWorkflowOperation(
          //             WorkflowOperationType.STOP,
          //             record.id
          //           )
          //         }
          //       >
          //         结束运行
          //       </Menu.Item>
          //     )}
          //     <Tooltip content={tooltipTitle} position="left">
          //       <Menu.Item
          //         key="rerun"
          //         className="text-[rgb(var(--primary-6))]"
          //         disabled={tooltipTitle !== ''}
          //         onClick={() =>
          //           handleWorkflowOperation(
          //             WorkflowOperationType.START_FAILURE_TASK_PROCESS,
          //             record.id
          //           )
          //         }
          //       >
          //         重试失败任务
          //       </Menu.Item>
          //     </Tooltip>
          //   </Menu>
          // );

          /**
           * 展示逻辑
           * 运行状态非上面两种情况展示重新运行
           */
          const canPause =
            record.state === WorkflowTaskStatus.RUNNING_EXECUTION;
          const canContinue = record.state === WorkflowTaskStatus.PAUSE;
          const canRerun =
            record.state !== WorkflowTaskStatus.RUNNING_EXECUTION &&
            record.state !== WorkflowTaskStatus.PAUSE;

          return (
            <div
              className={`flex items-center gap-2 ${styles['operation-container']}`}
            >
              <PermissionWrapper
                permission={WORKFLOW_TASK_PERMISSIONS.CAN_UPDATE}
              >
                <Button
                  type="text"
                  className="px-[4px]"
                  disabled={!record.workflow_type}
                  onClick={() =>
                    handleWorkflowDetail(record.id, {
                      workflow_type: record.workflow_type,
                      workflow_uuid: record.workflow_uuid,
                      ds_workflow_id: record.process_definition_code,
                      workflow_version: record.workflow_version
                    })
                  }
                >
                  详情
                </Button>
              </PermissionWrapper>

              {/** 只有运行中状态展示暂停运行 */}
              {canPause && (
                <PermissionWrapper
                  permission={WORKFLOW_TASK_PERMISSIONS.MODIFY}
                >
                  <Button
                    type="text"
                    className="px-[4px]"
                    onClick={() =>
                      handleWorkflowOperation(
                        WorkflowOperationType.PAUSE,
                        record.id
                      )
                    }
                  >
                    暂停运行
                  </Button>
                </PermissionWrapper>
              )}
              {/** 只有运行暂停状态展示继续运行 */}
              {canContinue && (
                <PermissionWrapper
                  permission={WORKFLOW_TASK_PERMISSIONS.MODIFY}
                >
                  <Button
                    type="text"
                    className="px-[4px]"
                    onClick={() =>
                      handleWorkflowOperation(
                        WorkflowOperationType.RECOVER_SUSPENDED_PROCESS,
                        record.id
                      )
                    }
                  >
                    继续运行
                  </Button>
                </PermissionWrapper>
              )}
              {/** 其他状态展示重新运行 */}
              {canRerun && (
                <PermissionWrapper
                  permission={WORKFLOW_TASK_PERMISSIONS.MODIFY}
                >
                  <Button
                    type="text"
                    className="px-[4px]"
                    onClick={() =>
                      handleWorkflowOperation(
                        WorkflowOperationType.REPEAT_RUNNING,
                        record.id
                      )
                    }
                  >
                    重新运行
                  </Button>
                </PermissionWrapper>
              )}
              {/** 只有运行中状态展示结束运行 */}
              {record.state === WorkflowTaskStatus.RUNNING_EXECUTION && (
                <PermissionWrapper
                  permission={WORKFLOW_TASK_PERMISSIONS.MODIFY}
                >
                  <Button
                    type="text"
                    className="px-[4px]"
                    onClick={() =>
                      handleWorkflowOperation(
                        WorkflowOperationType.STOP,
                        record.id
                      )
                    }
                  >
                    KILL
                  </Button>
                </PermissionWrapper>
              )}
              <PermissionWrapper permission={WORKFLOW_TASK_PERMISSIONS.MODIFY}>
                {record.state !== WorkflowTaskStatus.RUNNING_EXECUTION && (
                  <Popover content={tooltipTitle} position="top">
                    <Button
                      type="text"
                      disabled={tooltipTitle !== ''}
                      onClick={() =>
                        handleWorkflowOperation(
                          WorkflowOperationType.START_FAILURE_TASK_PROCESS,
                          record.id
                        )
                      }
                    >
                      重试失败任务
                    </Button>
                  </Popover>
                )}
              </PermissionWrapper>
              {/* <PermissionWrapper permission={WORKFLOW_TASK_PERMISSIONS.MODIFY}>
                <Dropdown
                  droplist={operationMenu}
                  trigger="click"
                  position="br"
                >
                  <Button className="px-[4px]" type="text">
                    更多
                    <IconDown className="ml-[4px]" />
                  </Button>
                </Dropdown>
              </PermissionWrapper> */}
            </div>
          );
        }
      }
    ],
    [
      handleCopy,
      handleWorkflowOperation,
      handleWorkflowDetail,
      handleWorkflowConfig
    ]
  );

  const hasPagination = useMemo(() => {
    if (!table?.pagination?.total) {
      return false;
    }

    if (!table?.pagination?.pageSize) {
      return false;
    }

    return table.pagination.total > table.pagination.pageSize;
  }, [table.pagination.total, table.pagination.pageSize]);

  return (
    <>
      {/* 搜索区域 */}
      <div className="border-b pb-[16px]">
        <Form
          form={form}
          layout="inline"
          className="flex items-center gap-[16px]"
        >
          <FormItem field="keywords" className="!m-0">
            <Input
              placeholder="输入工作流运行ID或名称搜索"
              className="w-64"
              allowClear
            />
          </FormItem>
          <FormItem field="state" className="!m-0">
            <Select placeholder="选择运行状态搜索" className="w-48" allowClear>
              {WORKFLOW_STATUS_OPTIONS.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </FormItem>
          <FormItem className="!m-0">
            <Button type="primary" onClick={table.submit}>
              查询
            </Button>
          </FormItem>
          <FormItem className="!m-0">
            <Button type="outline" onClick={table.reset}>
              重置
            </Button>
          </FormItem>
        </Form>
      </div>

      {/* 表格 */}
      <Table
        className={styles['table-container']}
        columns={columns}
        scroll={{ x: true }}
        data={table.data}
        loading={table.loading}
        pagination={false}
        border={false}
        rowKey="id"
        noDataElement={
          <div className="py-[100px]">
            <NoDataCard title="暂无数据" />
          </div>
        }
        onChange={(pagination, sorter, filters) => {
          table.onChange(pagination, sorter, filters);
        }}
      />

      {/* 分页 */}
      <div className="mt-[16px] flex items-center justify-end">
        {hasPagination && (
          <Pagination
            current={table.pagination.current}
            pageSize={table.pagination.pageSize}
            total={table.pagination.total}
            sizeOptions={[10, 20, 50, 100]}
            showTotal
            showJumper
            sizeCanChange
            pageSizeChangeResetCurrent
            onChange={(page, pageSize) => {
              table.onChange({ current: page, pageSize } as PaginationProps);
            }}
            onPageSizeChange={(size) => {
              table.onChange({
                current: 1,
                pageSize: size
              } as PaginationProps);
            }}
          />
        )}
      </div>
    </>
  );
}
