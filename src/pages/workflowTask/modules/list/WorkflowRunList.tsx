import React, { useCallback, useMemo } from 'react';
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
  Message
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
  GetWorkflowTaskListParams
} from '@/types/workflowTaskApi';
import { WorkflowOperationType } from '@/types/workflowTaskApi';
import { useWorkflowTable } from './hooks/useWorkflowTable';
import { WORKFLOW_RUN_STATUS_MAP, WORKFLOW_STATUS_OPTIONS } from './constants';
import type { ColumnProps } from '@arco-design/web-react/lib/Table';
import type { PaginationProps } from '@arco-design/web-react';
import type { SorterInfo } from '@arco-design/web-react/lib/Table/interface';
import noDataElement from '@/components/no-data';
import ellipsisPopoverCom from '@/components/ellipsis-popover-com';
import EllipsisPopoverCom from '@/components/ellipsis-popover-com';
import copy from 'copy-to-clipboard';

const { Option } = Select;
const FormItem = Form.Item;

export default function WorkflowRunList() {
  const [form] = Form.useForm();

  // 格式化工作流运行记录请求参数
  const formatWorkflowParams = useCallback(
    (
      formValues: any,
      pagination: PaginationProps,
      sorter?: SorterInfo
    ): GetWorkflowTaskListParams => {
      const orders = sorter
        ? [
            {
              asc: sorter.direction === 'ascend',
              column: (sorter.field as string) || ''
            }
          ]
        : [];

      return {
        command_type: formValues.command_type || ('SCHEDULER' as any),
        id: formValues.id ? Number(formValues.id) : undefined,
        keywords: formValues.keywords || '',
        orders,
        state: formValues.state || ('' as any),
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

  // 工作流操作
  const handleWorkflowOperation = useCallback(
    async (type: WorkflowOperationType, processInstanceId: string) => {
      try {
        const res = await workflowOperation({
          executeType: type,
          process_instance_id: processInstanceId
        });
        if (res.status === 200) {
          Message.success('操作成功');
          table.refresh();
        } else {
          Message.error(res.message || '操作失败');
        }
      } catch (error) {
        Message.error('操作失败，请稍后重试');
      }
    },
    [table]
  );

  // 工作流运行记录表格列
  const columns: ColumnProps<WorkflowTaskItem>[] = useMemo(
    () => [
      {
        title: '工作流运行ID',
        dataIndex: 'id',
        width: 180,
        render: (value: string) => (
          <EllipsisPopoverCom value={value} preferTypography />
        )
      },
      {
        title: '工作流名称',
        dataIndex: 'process_definition_name',
        width: 200,
        render: (value: string) => (
          <div className="flex items-center gap-1">
            <EllipsisPopoverCom value={value} preferTypography />
            <IconCopy
              className="cursor-pointer"
              onClick={() => handleCopy(value)}
            />
          </div>
        )
      },
      {
        title: '运行状态',
        dataIndex: 'state',
        filters: [],
        width: 150,
        render: (state: string, record: WorkflowTaskItem) => {
          const statusMap = WORKFLOW_RUN_STATUS_MAP[state.toLowerCase()] ||
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
              <span style={{ color: statusMap.color }}>{statusMap.text}</span>
            </div>
          );
        }
      },
      {
        title: '运行类型',
        dataIndex: 'command_type_name',
        width: 120,
        filters: []
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
        title: '操作',
        width: 200,
        fixed: 'right' as const,
        render: (_: any, record: WorkflowTaskItem) => {
          const state = record.state?.toLowerCase();
          const canPause = state === 'waiting' || state === 'running';
          const canContinue = state === 'paused';
          const canRerun =
            state === 'success' || state === 'kill' || state === 'stopped';

          const operationMenu = (
            <Menu>
              {canPause && (
                <Menu.Item
                  key="pause"
                  className="text-[rgb(var(--primary-6))] hover:text-[rgb(var(--primary-6))]"
                  onClick={() =>
                    handleWorkflowOperation(
                      WorkflowOperationType.EXEC_PAUSE,
                      record.id
                    )
                  }
                >
                  暂停运行
                </Menu.Item>
              )}
              {canContinue && (
                <Menu.Item
                  key="continue"
                  className="text-[rgb(var(--primary-6))] hover:text-[rgb(var(--primary-6))]"
                  onClick={() =>
                    handleWorkflowOperation(
                      WorkflowOperationType.RECOVER_SUSPENDED_PROCESS,
                      record.id
                    )
                  }
                >
                  继续运行
                </Menu.Item>
              )}
              {canRerun && (
                <Menu.Item
                  key="rerun"
                  className="text-[rgb(var(--primary-6))] hover:text-[rgb(var(--primary-6))]"
                  onClick={() =>
                    handleWorkflowOperation(
                      WorkflowOperationType.REPEAT_RUNNING,
                      record.id
                    )
                  }
                >
                  重新运行
                </Menu.Item>
              )}
            </Menu>
          );

          return (
            <div className="flex items-center gap-2">
              <Button type="text" className="px-[4px]">
                详情
              </Button>
              {canPause && (
                <Button
                  type="text"
                  className="px-[4px]"
                  onClick={() =>
                    handleWorkflowOperation(
                      WorkflowOperationType.EXEC_PAUSE,
                      record.id
                    )
                  }
                >
                  暂停运行
                </Button>
              )}
              {canContinue && (
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
              )}
              {canRerun && (
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
              )}
              <Dropdown droplist={operationMenu} trigger="click">
                <Button className="px-[4px]" type="text">
                  更多
                  <IconDown className="ml-[4px]" />
                </Button>
              </Dropdown>
            </div>
          );
        }
      }
    ],
    [handleCopy, handleWorkflowOperation]
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
              placeholder="输入工作流运行ID或名称搜索"
              prefix={<IconSearch />}
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
            <Button type="primary" icon={<IconSearch />} onClick={table.submit}>
              搜索
            </Button>
          </FormItem>
          <FormItem className="!m-0">
            <Button icon={<IconRefresh />} onClick={table.reset}>
              重置
            </Button>
          </FormItem>
        </Form>
      </div>

      {/* 表格 */}
      <Table
        columns={columns}
        scroll={{ x: true }}
        data={table.data}
        loading={table.loading}
        pagination={false}
        border={false}
        rowKey="id"
        noDataElement={noDataElement({ description: '暂无数据' })}
        onChange={(pagination, sorter) => {
          table.onChange(pagination, sorter);
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
    </>
  );
}
