import React, { useCallback, useEffect, useMemo } from 'react';
import {
  Button,
  Checkbox,
  Form,
  Input,
  Modal,
  Pagination,
  PaginationProps,
  Spin,
  Typography
} from '@arco-design/web-react';
import styles from './index.module.scss';
import BlockIcon from '@/pages/workflowConfig/workflow/block-icon';
import useArcoTable from '@/hooks/use-arco-table';
import {
  IconArrowLeft,
  IconClose,
  IconDelete,
  IconSearch
} from '@arco-design/web-react/icon';
import { getWorkflowDraft, getWorkflowList } from '@/api/workflowV2';
import { WorkflowDetailRes } from '@/types/workflowApi';
import { BlockEnum, NodeProps } from '@/pages/workflowConfig/workflow/types';
import cn from 'classnames';
import { openNewPage } from '@/utils/env';
import { useDebounceFn, useRequest } from 'ahooks';
import { useDependentTaskStore } from '@/pages/workflowConfig/workflow/nodes/dependent-node/components/dependent-task-dialog/store';
import { DependItem } from '@/pages/workflowConfig/workflow/nodes/dependent-node/types';
import { NoDataCard } from '@ceai-front/arco-material';

type TaskData = WorkflowDetailRes | NodeProps;

interface IProps {
  data: TaskData;
  // 选中 未选中 半选
  status?: 'checked' | 'unchecked' | 'indeterminate';
  type?: 'workflow' | BlockEnum;
  onCheckedStatusChange?: (data: TaskData, checked: boolean) => void;
  onView?: (data: WorkflowDetailRes) => void;
  onViewNodes?: (task: WorkflowDetailRes) => void;
  disabled?: boolean;
}

export const TaskItem = (props: IProps) => {
  const {
    data,
    type,
    status,
    onCheckedStatusChange,
    onView,
    onViewNodes,
    disabled
  } = props;

  const taskDesc = useMemo(() => {
    if (type === 'workflow') {
      return (data as WorkflowDetailRes).description || '';
    }
    return (data as NodeProps).data.desc || '';
  }, [type, data]);

  const taskTitle =
    type === 'workflow'
      ? (data as WorkflowDetailRes).workflow_name
      : (data as NodeProps).data.title;
  return (
    <label
      className={cn({
        [`mb-2 flex items-center gap-4 ${styles['task-item']} overflow-hidden`]: true,
        [styles['task-item-active']]: status !== 'unchecked'
      })}
    >
      <Checkbox
        className={'flex-shrink-0'}
        checked={status === 'checked'}
        indeterminate={status === 'indeterminate'}
        onChange={(checked) => {
          onCheckedStatusChange?.(data, checked);
        }}
        disabled={disabled}
      />
      <div className={'flex flex-1 items-center gap-2 overflow-hidden'}>
        {/*@ts-ignore*/}
        <BlockIcon type={type} size={'md'} className={'flex-shrink-0'} />
        <div
          className={
            'flex-1 overflow-hidden font-PingFangSc text-[14px] leading-[22px]'
          }
        >
          <div
            className={'w-full overflow-hidden font-medium text-default'}
            title={taskTitle}
          >
            <div
              className={`overflow-hidden text-ellipsis whitespace-nowrap ${styles['task-title']}`}
              onClick={(e) => {
                if (type !== 'workflow') return;
                e.stopPropagation();
                e.preventDefault();
                onViewNodes!(data as WorkflowDetailRes);
              }}
            >
              {taskTitle}
            </div>
          </div>
          <div
            className={
              'w-full overflow-hidden text-ellipsis whitespace-nowrap text-[#94A3B8]'
            }
            title={taskDesc || '暂无描述'}
          >
            {taskDesc || '暂无描述'}
          </div>
        </div>
      </div>
      {type === 'workflow' && (
        <div
          className={`${styles['task-operators']} flex flex-shrink-0 items-center gap-2`}
        >
          <Button
            size={'mini'}
            className={`${styles['task-operator']}`}
            type={'default'}
            onClick={() => onView!(data as WorkflowDetailRes)}
          >
            详情
          </Button>
          <Button
            size={'mini'}
            className={`${styles['task-operator']}`}
            type={'default'}
            onClick={() => onViewNodes!(data as WorkflowDetailRes)}
          >
            查看任务节点
          </Button>
        </div>
      )}
    </label>
  );
};

type NodeTaskMap = {
  all: NodeProps[];
  current: NodeProps[];
};
export const DependentTaskDialog = (props: {
  data?: DependItem[];
  open: boolean;
  onClose: () => void;
  onOk: (tasks: DependItem[]) => void;
}) => {
  const [form] = Form.useForm();
  const searchContent = Form.useWatch('search_content', form);
  const { data: currentTasks, onClose, onOk, open } = props;

  const {
    currentFlow,
    setCurrentFlow,
    selectedFlowTask,
    selectedNodeTask,
    selectWorkflow,
    unselectWorkflow,
    selectNode,
    unselectNode,
    clearAll,
    cacheNodes,
    indeterminateFlow,
    unselectTask,
    clearCurrentNodes,
    selectAll,
    initDependentTasks
  } = useDependentTaskStore((state) => {
    const { selectedNodeTask, nodesDataCache, currentFlow, selectedFlowTask } =
      state;
    const indeterminateFlow = new Set<React.Key>();
    for (const [key, value] of selectedNodeTask) {
      indeterminateFlow.add(value.parentFlow!);
    }
    return {
      ...state,
      indeterminateFlow
    };
  });

  const { tableProps, onSubmit } = useArcoTable(
    ({ pagination, query }) => {
      const searchParams = {
        page: pagination.current,
        page_size: pagination.pageSize,
        // 已上线的工作流
        is_online: '1',
        workflow_type: 'struct',
        ...query
      };
      return getWorkflowList(searchParams);
    },
    {
      defaultPage: 1,
      defaultPageSize: 10,
      deps: [],
      form
    }
  );

  const {
    data: flowNodes,
    loading: loadingNodes,
    run
  } = useRequest(
    async (query?: string) => {
      const emptyRes: NodeTaskMap = {
        all: [],
        current: []
      };
      if (!currentFlow) return emptyRes;
      const { workflow_uuid, ds_workflow_id, workflow_version } = currentFlow;
      try {
        const res = await getWorkflowDraft({
          workflowUUID: workflow_uuid,
          dsWorkflowId: ds_workflow_id,
          workflowVersion: workflow_version
        });

        const allNodes = (res.data?.graph?.nodes || []) as NodeProps[];
        if (!query) {
          return {
            all: allNodes,
            current: allNodes
          };
        }
        const searchNodes = allNodes.filter((node) =>
          node.data.title.includes(query)
        );
        return {
          all: allNodes,
          current: searchNodes
        };
      } catch (e) {
        console.error(e);
        return emptyRes;
      }
    },
    {
      refreshDeps: [currentFlow],
      onSuccess(nodesData) {
        cacheNodes(nodesData);
      }
    }
  );

  const { data: list, loading } = tableProps;

  const onSelectWorkflow = (data: WorkflowDetailRes, checked: boolean) => {
    if (checked) {
      selectWorkflow(data);
      return;
    }
    unselectWorkflow(data.ds_workflow_id);
  };

  const onSelectNode = useCallback(
    (data: NodeProps, checked: boolean) => {
      if (checked) {
        selectNode(data);
        return;
      }
      unselectNode(data.id);
    },
    [currentFlow]
  );

  // 查看详情
  const viewDetailWorkflow = (flow: WorkflowDetailRes) => {
    const { workflow_uuid, ds_workflow_id } = flow;
    openNewPage(
      `/modaforge/tenant/compute/modaforge/workflowConfig/struct?workflow_uuid=${workflow_uuid}&ds_workflow_id=${ds_workflow_id}`
    );
  };

  const searchTask = useCallback(() => {
    if (!!currentFlow) {
      run(form.getFieldValue('search_content'));
      return;
    }
    onSubmit();
  }, [onSubmit, currentFlow]);

  useEffect(() => {
    initDependentTasks(currentTasks);
  }, [currentTasks]);

  const { run: debounceSearchTask } = useDebounceFn(searchTask, { wait: 200 });

  const selectedTask = useMemo(() => {
    const flowTask = Array.from(selectedFlowTask.entries()).map(
      ([key, value]) => value
    );
    const nodeTask = Array.from(selectedNodeTask.entries()).map(
      ([key, value]) => value
    );
    return flowTask.concat(nodeTask);
  }, [selectedFlowTask, selectedNodeTask]);

  const isCheckAll = useMemo(() => {
    if (!selectedTask.length || !flowNodes?.current.length) return false;
    return (
      selectedFlowTask.has(currentFlow?.ds_workflow_id || '-') ||
      flowNodes?.current.every(({ id }) => selectedNodeTask.has(id))
    );
  }, [selectedTask, searchContent, flowNodes]);

  const renderFlowTask = () => {
    if (!list?.length)
      return (
        <div className={'py-[100px]'}>
          <NoDataCard type={'block'} />
        </div>
      );
    return (list as WorkflowDetailRes[])?.map((item) => (
      <TaskItem
        key={item.ds_workflow_id}
        data={item}
        type={'workflow'}
        status={
          indeterminateFlow.has(item.ds_workflow_id)
            ? 'indeterminate'
            : !!selectedFlowTask.get(item.ds_workflow_id)
              ? 'checked'
              : 'unchecked'
        }
        onView={viewDetailWorkflow}
        onViewNodes={(flow) => {
          form.resetFields();
          setCurrentFlow(flow);
        }}
        onCheckedStatusChange={(data, checked) =>
          onSelectWorkflow(data as WorkflowDetailRes, checked)
        }
      />
    ));
  };
  const renderNodeTask = () => {
    if (!flowNodes?.current.length) {
      return (
        <div className={'py-[100px]'}>
          <NoDataCard type={'block'} />
        </div>
      );
    }
    return flowNodes.current.map((item) => (
      <TaskItem
        key={item.id}
        disabled={!flowNodes.current.length}
        data={item}
        type={item.data.type}
        status={
          !!selectedNodeTask.get(+item.id) ||
          selectedFlowTask.get(currentFlow!.ds_workflow_id)
            ? 'checked'
            : 'unchecked'
        }
        onCheckedStatusChange={(data, checked) =>
          onSelectNode(data as NodeProps, checked)
        }
      />
    ));
  };

  const closeModal = () => {
    form.resetFields();
    tableProps.onChange?.({ current: 1 }, {}, {}, {} as any);
    setCurrentFlow(undefined);
    onClose();
  };

  return (
    <Modal
      visible={open}
      title={'外部任务设置'}
      style={{ width: '50vw' }}
      onOk={() => {
        onOk(selectedTask);
        closeModal();
      }}
      onCancel={closeModal}
    >
      <div
        className={`flex ${styles['modal-content']} h-[60vh] w-full overflow-hidden`}
      >
        <div
          className={`${styles['left']} flex h-full flex-1 flex-col gap-2 overflow-hidden p-4`}
        >
          <div
            className={`${styles['left-header']} flex flex-shrink-0 justify-between gap-2`}
          >
            {!!currentFlow && (
              <div className={'flex flex-1 items-center gap-2 overflow-hidden'}>
                <div
                  className={
                    'flex flex-1 items-center gap-2 overflow-hidden text-default hover:cursor-pointer'
                  }
                >
                  <IconArrowLeft
                    className={'flex-shrink-0'}
                    onClick={() => {
                      setCurrentFlow(undefined);
                    }}
                  />
                  <div
                    className={
                      'flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-[600] leading-[22px]'
                    }
                    title={currentFlow.workflow_name}
                  >
                    {currentFlow.workflow_name}
                  </div>
                </div>
                <Button
                  className={styles['check-all']}
                  type={'text'}
                  disabled={!flowNodes?.current.length}
                  onClick={() => {
                    isCheckAll ? clearCurrentNodes() : selectAll();
                  }}
                >
                  {isCheckAll ? '取消全选' : '全选'}
                </Button>
              </div>
            )}
            <div>
              <Form
                form={form}
                autoComplete={'off'}
                className={'flex-shrink-1'}
                onValuesChange={debounceSearchTask}
              >
                <Form.Item noStyle field={'search_content'}>
                  <Input
                    className={'w-[200px]'}
                    suffix={<IconSearch />}
                    placeholder={'输入关键词搜索'}
                    allowClear
                  />
                </Form.Item>
              </Form>
            </div>
          </div>
          <div className={`${styles['left-body']} flex-1 overflow-auto`}>
            <Spin
              loading={!!loading || loadingNodes}
              className={'h-full w-full'}
            >
              {currentFlow ? renderNodeTask() : renderFlowTask()}
            </Spin>
          </div>
          {!currentFlow && (
            <div className={`${styles['left-footer']} flex-end flex-shrink-0`}>
              <Pagination
                showJumper={false}
                showTotal={(total) => `共 ${total} 条数据`}
                sizeCanChange={false}
                {...(tableProps.pagination as PaginationProps)}
                className={'justify-end'}
              />
            </div>
          )}
        </div>
        <div
          className={`${styles['right']} flex w-[30%] flex-shrink-0 flex-col gap-y-2 p-4`}
        >
          <div
            className={`${styles['right-header']} flex h-8 w-full flex-shrink-0 items-center justify-between`}
          >
            <Typography.Text
              bold
              className={''}
            >{`已选 (${selectedTask.length})`}</Typography.Text>
            {!!selectedTask.length && (
              <IconDelete
                className={'hover:cursor-pointer'}
                onClick={() => {
                  clearAll();
                }}
              />
            )}
          </div>
          <div className={'flex-1 overflow-auto'}>
            {!!selectedTask.length ? (
              selectedTask.map((item) => {
                const {
                  task_type = 'workflow',
                  desc,
                  title,
                  definitionCode
                } = item;
                return (
                  <div
                    className={'flex items-center justify-between pb-2 pt-2'}
                    key={definitionCode}
                  >
                    <div
                      className={
                        'flex flex-1 items-center gap-2 overflow-hidden'
                      }
                    >
                      <BlockIcon
                        size={'md'}
                        type={task_type}
                        className={'flex-shrink-0'}
                      />
                      <div className={'text-over flex-1 overflow-hidden'}>
                        <div
                          className={
                            'w-full overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[#1E293B]'
                          }
                          title={title}
                        >
                          {title}
                        </div>
                        {!!desc && task_type !== 'workflow' && (
                          <div
                            className={
                              'mt-1 w-full overflow-hidden text-ellipsis whitespace-nowrap text-[#94A3B8]'
                            }
                            title={desc}
                          >
                            {desc}
                          </div>
                        )}
                      </div>
                    </div>
                    <IconClose
                      className={'flex-shrink-0 hover:cursor-pointer'}
                      onClick={() => {
                        unselectTask(item);
                      }}
                    />
                  </div>
                );
              })
            ) : (
              <div className={'py-[100px]'}>
                <NoDataCard type={'block'} />
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
