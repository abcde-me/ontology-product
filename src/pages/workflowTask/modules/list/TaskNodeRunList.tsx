import React, { useCallback, useMemo } from 'react';
import {
  Form,
  Input,
  Select,
  Table,
  Button,
  Pagination,
  Tooltip,
  Message
} from '@arco-design/web-react';
import {
  IconSearch,
  IconQuestionCircle,
  IconRefresh
} from '@arco-design/web-react/icon';
import { useUserInfoStore } from '@/store/userInfoStore';
import { getTaskNodeList } from '@/api/workflowTask';
import {
  type TaskNodeItem,
  type GetTaskNodeListParams,
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

export default function TaskNodeRunList() {
  const [form] = Form.useForm();

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
              <Button type="text" className="px-[4px]">
                强制成功
              </Button>
              <Button type="text" className="px-[4px]">
                重试
              </Button>
              <Button type="text" className="px-[4px]">
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
        {(table.pagination.total ?? 0) > 0 && (
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
              table.onChange({ current: 1, pageSize: size } as PaginationProps);
            }}
          />
        )}
      </div>
    </>
  );
}
