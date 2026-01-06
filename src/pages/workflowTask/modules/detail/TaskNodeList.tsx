import React, {
  useCallback,
  useMemo,
  useState,
  forwardRef,
  useImperativeHandle
} from 'react';
import {
  Form,
  Select,
  Table,
  Button,
  Pagination,
  Message,
  Popconfirm,
  Popover
} from '@arco-design/web-react';
import { IconSearch, IconRefresh } from '@arco-design/web-react/icon';
import { useParams as useRouteParams } from 'react-router';
import { listTaskInstance, taskNodeRetry } from '@/api/workflowTask';
import type {
  ListTaskInstanceItem,
  ListTaskInstanceParams
} from '@/types/workflowTaskApi';
import {
  TriggerTypeNameMap,
  TriggerType,
  TaskExecuteType,
  TaskExecuteTypeNameMap,
  TaskNodeStatus
} from '@/types/workflowTaskApi';
import { useWorkflowTable } from '../../hooks/useWorkflowTable';
import {
  TASK_NODE_RUN_STATUS_MAP,
  TASK_NODE_STATUS_OPTIONS
} from '../../common/constants';
import type { ColumnProps } from '@arco-design/web-react/lib/Table';
import type { PaginationProps } from '@arco-design/web-react';
import type { SorterInfo } from '@arco-design/web-react/lib/Table/interface';
import noDataElement from '@/components/no-data';
import EllipsisPopoverCom from '@/components/ellipsis-popover-com';
import TaskLogDrawer from '../../components/task-log-drawer';
import { PermissionWrapper } from '@/components/PermissionGuard';
import { WORKFLOW_TASK_PERMISSIONS } from '@/config/permissions';
import classNames from 'classnames';
import styles from './TaskNodeList.module.scss';
import { NoDataCard } from '@ceai-front/arco-material';

const { Option } = Select;
const FormItem = Form.Item;

export interface TaskNodeListRef {
  refresh: () => void;
}

export interface TaskNodeListProps {
  onRetrySuccess?: () => void;
}

const TaskNodeList = forwardRef<TaskNodeListRef, TaskNodeListProps>(
  (props, ref) => {
    const { onRetrySuccess } = props;
    const [form] = Form.useForm();
    const { id: workflowInstanceId } = useRouteParams<{ id: string }>();
    const [logDrawerVisible, setLogDrawerVisible] = useState(false);
    const [currentTaskInstanceId, setCurrentTaskInstanceId] = useState<
      number | null
    >(null);
    const [currentTaskName, setCurrentTaskName] = useState<string>('');

    // 格式化工作流实例文件请求参数
    const formatParams = useCallback(
      (
        formValues: any,
        pagination: PaginationProps,
        sorter?: SorterInfo,
        filters?: Record<string, any>
      ): ListTaskInstanceParams => {
        const orders =
          sorter?.direction && sorter.field
            ? [
                {
                  asc: sorter.direction === 'ascend',
                  column: sorter.field as string
                }
              ]
            : [];

        return {
          process_instance_id: Number(workflowInstanceId),
          page: pagination.current || 1,
          page_size: pagination.pageSize || 10,
          orders,
          trigger_type_list: filters?.trigger_type_name,
          task_execute_type_list: filters?.task_execute_type_name,
          task_type_list: filters?.task_type_name,
          state_list: filters?.state
        };
      },
      [workflowInstanceId]
    );

    // 工作流实例文件表格hook
    const table = useWorkflowTable<
      ListTaskInstanceItem,
      ListTaskInstanceParams
    >({
      service: async (params) => {
        const res = await listTaskInstance(params);
        // 注意：API返回的page, page_size, total是字符串类型，需要转换为数字
        return {
          data: {
            items: res.data?.items || [],
            total: Number(res.data?.total || 0),
            page: Number(res.data?.page || 1),
            page_size: Number(res.data?.page_size || 10)
          }
        };
      },
      form,
      formatParams,
      defaultPageSize: 10,
      manual: false
    });

    const handleTaskNodeRetry = useCallback(
      async (processInstanceId: number, taskCodeId: number) => {
        const res = await taskNodeRetry({
          process_instance_id: processInstanceId,
          task_code_list: [taskCodeId]
        });

        if (res.status === 200 && res.code === '') {
          Message.success('重试成功');
          // 手动执行一次 TaskNodeList 刷新
          // table.refresh();
          // 执行父组件的 runGetDetailData 方法
          onRetrySuccess?.();
        } else {
          Message.error(res.message || '重试失败');
        }
      },
      [table, onRetrySuccess]
    );

    // 暴露刷新方法给父组件
    useImperativeHandle(
      ref,
      () => ({
        refresh: () => {
          table.refresh();
        }
      }),
      [table.refresh]
    );

    // 处理日志操作
    const handleGetRunLogs = useCallback((id: number, taskName: string) => {
      setCurrentTaskInstanceId(id);
      setCurrentTaskName(taskName);
      setLogDrawerVisible(true);
    }, []);

    const handleCloseLogDrawer = useCallback(() => {
      setLogDrawerVisible(false);
      setCurrentTaskInstanceId(null);
      setCurrentTaskName('');
    }, []);

    // 处理日志操作
    const handleLog = useCallback(
      (record: ListTaskInstanceItem) => {
        // 注意：ListTaskInstanceItem 可能没有 id 字段，需要根据实际 API 响应调整
        // 如果 API 返回的字段名不同，请修改这里的字段名
        const taskInstanceId = (record as any).id;
        if (taskInstanceId) {
          handleGetRunLogs(Number(taskInstanceId), record.task_name);
        } else {
          Message.error('无法获取任务实例ID');
        }
      },
      [handleGetRunLogs]
    );

    // 表格列定义
    const columns: ColumnProps<ListTaskInstanceItem>[] = useMemo(
      () => [
        {
          title: '任务节点ID',
          dataIndex: 'task_code',
          width: 180,
          render: (value: string) => (
            <EllipsisPopoverCom value={value} preferTypography />
          )
        },
        {
          title: '任务节点名称',
          dataIndex: 'task_name',
          width: 200,
          render: (value: string) => (
            <EllipsisPopoverCom value={value} preferTypography />
          )
        },
        {
          title: '任务模式',
          dataIndex: 'task_execute_type_name',
          width: 120,
          filters: [
            {
              text: TaskExecuteTypeNameMap[TaskExecuteType.OFFLINE],
              value: TaskExecuteType.OFFLINE
            },
            {
              text: TaskExecuteTypeNameMap[TaskExecuteType.REALTIME],
              value: TaskExecuteType.REALTIME
            }
          ]
        },
        {
          title: '任务节点类型',
          dataIndex: 'task_type_name',
          width: 150,
          filters: []
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
          title: '运行状态',
          dataIndex: 'state',
          width: 150,
          filters: TASK_NODE_STATUS_OPTIONS.map((option) => ({
            text: option.label,
            value: option.value
          })),
          render: (state: string, record: ListTaskInstanceItem) => {
            const statusMap = TASK_NODE_RUN_STATUS_MAP[state] ||
              TASK_NODE_RUN_STATUS_MAP[record.state_name || ''] || {
                text: record.state_name || state,
                color: '#666',
                dotColor: '#666'
              };
            return (
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: statusMap.dotColor }}
                />
                <span style={{ color: statusMap.color }}>{statusMap.text}</span>
              </div>
            );
          }
        },
        {
          title: '运行提交时间',
          dataIndex: 'submit_time',
          width: 180,
          sorter: true,
          sortDirections: ['ascend', 'descend'],
          render: (value: string) => (
            <EllipsisPopoverCom value={value || '-'} preferTypography />
          )
        },
        {
          title: '开始时间',
          dataIndex: 'start_time',
          width: 180,
          sorter: true,
          sortDirections: ['ascend', 'descend'],
          render: (value: string) => (
            <EllipsisPopoverCom value={value || '-'} preferTypography />
          )
        },
        {
          title: '操作',
          width: 116,
          fixed: 'right' as const,
          render: (_: any, record: ListTaskInstanceItem) => {
            return (
              <div
                className={classNames(
                  'flex items-center gap-2',
                  styles['operation-container']
                )}
              >
                {record.state === TaskNodeStatus.FAILURE ? (
                  <PermissionWrapper
                    permission={WORKFLOW_TASK_PERMISSIONS.MODIFY}
                  >
                    <Popconfirm
                      title="确定重新运行吗？"
                      content=""
                      onOk={() =>
                        handleTaskNodeRetry(
                          record.process_instance_id,
                          record.task_code
                        )
                      }
                    >
                      <Button
                        disabled={record.state !== TaskNodeStatus.FAILURE}
                        type="text"
                      >
                        重试
                      </Button>
                    </Popconfirm>
                  </PermissionWrapper>
                ) : (
                  <PermissionWrapper
                    permission={WORKFLOW_TASK_PERMISSIONS.MODIFY}
                  >
                    <Popover
                      content="只能重试已经运行失败的节点"
                      position="top"
                    >
                      <Button disabled={true} type="text">
                        重试
                      </Button>
                    </Popover>
                  </PermissionWrapper>
                )}
                <PermissionWrapper
                  permission={WORKFLOW_TASK_PERMISSIONS.CAN_UPDATE}
                >
                  <Button
                    type="text"
                    className="px-[4px]"
                    onClick={() => handleLog(record)}
                  >
                    日志
                  </Button>
                </PermissionWrapper>
              </div>
            );
          }
        }
      ],
      [handleTaskNodeRetry, handleLog]
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
      <div className="mt-[16px] flex-1 rounded-[12px] bg-white p-[16px]">
        {/* 表格 */}
        <Table
          scroll={{ x: true }}
          columns={columns}
          data={table.data}
          loading={table.loading}
          pagination={false}
          border={false}
          rowKey="id"
          noDataElement={<NoDataCard title="暂无数据" />}
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

        {/* 日志Drawer */}
        {logDrawerVisible && currentTaskInstanceId && (
          <TaskLogDrawer
            visible={logDrawerVisible}
            taskInstanceId={currentTaskInstanceId}
            taskName={currentTaskName}
            onClose={handleCloseLogDrawer}
          />
        )}
      </div>
    );
  }
);

TaskNodeList.displayName = 'TaskNodeList';

export default TaskNodeList;
