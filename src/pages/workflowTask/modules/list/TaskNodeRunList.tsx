import React, { useCallback, useMemo, useState } from 'react';
import {
  Form,
  Input,
  Select,
  Table,
  Button,
  Pagination,
  Tooltip,
  Message,
  Popconfirm
} from '@arco-design/web-react';
import {
  getTaskNodeList,
  taskNodeForcesSuccess,
  taskNodeRetry
} from '@/api/workflowTask';
import {
  type TaskNodeItem,
  type GetTaskNodeListParams,
  CommandTypeNameMap,
  CommandType,
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

const { Option } = Select;
const FormItem = Form.Item;

export default function TaskNodeRunList() {
  const [form] = Form.useForm();
  const [logDrawerVisible, setLogDrawerVisible] = useState(false);
  const [currentTaskInstanceId, setCurrentTaskInstanceId] = useState<
    number | null
  >(null);
  const [currentTaskName, setCurrentTaskName] = useState<string>('');

  const handleTaskNodeForcesSuccess = useCallback(async (id: number) => {
    const res = await taskNodeForcesSuccess({
      task_instance_id: id
    });

    if (res.status === 200 && res.code === '') {
      Message.success('强制成功成功');
      table.refresh();
    } else {
      Message.error(res.message || '强制成功失败');
    }
  }, []);

  const handleTaskNodeRetry = useCallback(
    async (processInstanceId: number, taskCodeId: number) => {
      const res = await taskNodeRetry({
        process_instance_id: processInstanceId,
        task_code_list: [taskCodeId]
      });

      if (res.status === 200 && res.code === '') {
        Message.success('重试成功');
        table.refresh();
      } else {
        Message.error(res.message || '重试失败');
      }
    },
    []
  );

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

  // 格式化任务节点运行记录请求参数
  const formatTaskParams = useCallback(
    (
      formValues: any,
      pagination: PaginationProps,
      sorter?: SorterInfo,
      filters?: Record<string, any>
    ): GetTaskNodeListParams => {
      const orders =
        sorter?.direction && sorter.field
          ? [
              {
                asc: sorter.direction === 'ascend',
                column: sorter.field as string
              }
            ]
          : [];

      console.log('filters', filters);

      return {
        page: pagination.current || 1,
        page_size: pagination.pageSize || 10,
        keywords: formValues.keywords || '',
        state_list: formValues.state ? [formValues.state] : [],
        command_type_list: filters?.command_type_name ?? [],
        task_execute_type_list: filters?.task_execute_type_name ?? [],
        task_type: filters?.task_type_name ?? '',
        orders,
        id: 0,
        process_instance_id: formValues.process_instance_id
      };
    },
    []
  );

  // 任务节点运行记录表格hook
  const table = useWorkflowTable<TaskNodeItem, GetTaskNodeListParams>({
    service: async (params) => {
      const res = await getTaskNodeList(params);
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
    formatParams: formatTaskParams,
    defaultPageSize: 10,
    manual: false
  });

  // 任务节点运行记录表格列
  const columns: ColumnProps<TaskNodeItem>[] = useMemo(
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
        dataIndex: 'command_type_name',
        width: 120,
        filters: [
          {
            text: CommandTypeNameMap[CommandType.SCHEDULER],
            value: CommandType.SCHEDULER
          },
          {
            text: CommandTypeNameMap[CommandType.START_PROCESS],
            value: CommandType.START_PROCESS
          }
        ]
      },
      {
        title: '运行状态',
        dataIndex: 'state',
        width: 150,
        render: (state: string, record: TaskNodeItem) => {
          // 使用原始状态值（新的枚举值），如果不存在则使用 state_name，最后使用默认值
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
        title: '所属工作流ID',
        dataIndex: 'process_instance_id',
        width: 180,
        render: (value: string) => (
          <EllipsisPopoverCom value={value} preferTypography />
        )
      },
      {
        title: '所属工作流名称',
        dataIndex: 'process_name',
        width: 200,
        render: (value: string) => (
          <EllipsisPopoverCom value={value} preferTypography />
        )
      },
      {
        title: '运行提交时间',
        dataIndex: 'submit_time',
        width: 180,
        render: (value: string) => (
          <EllipsisPopoverCom value={value} preferTypography />
        )
      },
      {
        title: '开始时间',
        dataIndex: 'start_time',
        width: 180,
        render: (value: string) => (
          <EllipsisPopoverCom value={value} preferTypography />
        )
      },
      {
        title: '结束时间',
        dataIndex: 'end_time',
        width: 180,
        render: (value: string) => (
          <EllipsisPopoverCom value={value} preferTypography />
        )
      },
      {
        title: '操作',
        width: 200,
        fixed: 'right' as const,
        render: (_: any, record: TaskNodeItem) => {
          return (
            <div className="flex items-center gap-2">
              {record.state === TaskNodeStatus.FAILURE ? (
                <Popconfirm
                  title="确定强制成功吗？"
                  content="强制成功后，将继续运行后续任务"
                  onOk={() => handleTaskNodeForcesSuccess(record.id)}
                >
                  <Button
                    disabled={record.state !== TaskNodeStatus.FAILURE}
                    type="text"
                    className="px-[4px]"
                  >
                    强制成功
                  </Button>
                </Popconfirm>
              ) : (
                <Button disabled={true} type="text" className="px-[4px]">
                  强制成功
                </Button>
              )}
              {record.state === TaskNodeStatus.FAILURE ? (
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
                    className="px-[4px]"
                  >
                    重试
                  </Button>
                </Popconfirm>
              ) : (
                <Button disabled={true} type="text" className="px-[4px]">
                  重试
                </Button>
              )}
              <Button
                type="text"
                className="px-[4px]"
                onClick={() => handleGetRunLogs(record.id, record.task_name)}
              >
                日志
              </Button>
            </div>
          );
        }
      }
    ],
    []
  );

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
              placeholder="输入任务节点ID或名称搜索"
              className="w-64"
              allowClear
            />
          </FormItem>
          <FormItem field="state" className="!m-0">
            <Select placeholder="选择运行状态搜索" className="w-48" allowClear>
              {TASK_NODE_STATUS_OPTIONS.map((option) => (
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
        scroll={{ x: true }}
        columns={columns}
        data={table.data}
        loading={table.loading}
        pagination={false}
        border={false}
        rowKey="task_code"
        noDataElement={noDataElement({ description: '暂无数据' })}
        onChange={(pagination, sorter, filters) => {
          table.onChange(pagination, sorter, filters);
        }}
      />

      {/* 分页 */}
      <div className="mt-[16px] flex items-center justify-end">
        {table.pagination.total &&
          table.pagination.pageSize &&
          table.pagination.total > table.pagination.pageSize && (
            <Pagination
              current={table.pagination.current}
              pageSize={table.pagination.pageSize}
              total={table.pagination.total}
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
    </>
  );
}
