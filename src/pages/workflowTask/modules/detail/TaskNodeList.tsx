import React, { useCallback, useMemo } from 'react';
import {
  Form,
  Select,
  Table,
  Button,
  Pagination,
  Message
} from '@arco-design/web-react';
import { IconSearch, IconRefresh } from '@arco-design/web-react/icon';
import { useParams as useRouteParams } from 'react-router';
import { listTaskInstance } from '@/api/workflowTask';
import type {
  WorkflowInstanceFileItem,
  ListTaskInstanceParams
} from '@/types/workflowTaskApi';
import {
  CommandTypeNameMap,
  CommandType,
  TaskExecuteType,
  TaskExecuteTypeNameMap
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

const { Option } = Select;
const FormItem = Form.Item;

export default function TaskNodeList() {
  const [form] = Form.useForm();
  const { id: workflowInstanceId } = useRouteParams<{ id: string }>();

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
        id: workflowInstanceId,
        page: pagination.current || 1,
        page_size: pagination.pageSize || 10,
        orders,
        command_type_list: filters?.command_type_name,
        task_execute_type_list: filters?.task_execute_type_name,
        task_type_list: filters?.task_type_name,
        state_list: filters?.state
      };
    },
    [workflowInstanceId]
  );

  // 工作流实例文件表格hook
  const table = useWorkflowTable<
    WorkflowInstanceFileItem,
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

  // 处理重试操作
  const handleRetry = useCallback((record: WorkflowInstanceFileItem) => {
    // TODO: 实现重试逻辑
    Message.info('重试功能待实现');
  }, []);

  // 处理日志操作
  const handleLog = useCallback((record: WorkflowInstanceFileItem) => {
    // TODO: 实现日志查看逻辑
    Message.info('日志功能待实现');
  }, []);

  // 表格列定义
  const columns: ColumnProps<WorkflowInstanceFileItem>[] = useMemo(
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
        filters: TASK_NODE_STATUS_OPTIONS.map((option) => ({
          text: option.label,
          value: option.value
        })),
        render: (state: string, record: WorkflowInstanceFileItem) => {
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
        width: 200,
        fixed: 'right' as const,
        render: (_: any, record: WorkflowInstanceFileItem) => {
          return (
            <div className="flex items-center gap-2">
              <Button
                type="text"
                className="px-[4px]"
                onClick={() => handleRetry(record)}
              >
                重试
              </Button>
              <Button
                type="text"
                className="px-[4px]"
                onClick={() => handleLog(record)}
              >
                日志
              </Button>
            </div>
          );
        }
      }
    ],
    [handleRetry, handleLog]
  );

  return (
    <div className="mt-[16px] rounded-[12px] bg-white p-[16px]">
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
        {(table.pagination.total ?? 0) > 0 && (
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
              table.onChange({ current: 1, pageSize: size } as PaginationProps);
            }}
          />
        )}
      </div>
    </div>
  );
}
