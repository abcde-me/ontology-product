import React, { useMemo, useState } from 'react';
import {
  Button,
  Checkbox,
  Form,
  Input,
  Modal,
  Pagination,
  Spin,
  Typography
} from '@arco-design/web-react';
import styles from './index.module.scss';
import BlockIcon from '@/pages/workflowConfig/workflow/block-icon';
import useArcoTable from '@/hooks/use-arco-table';
import { IconClose, IconDelete, IconSearch } from '@arco-design/web-react/icon';
import { getWorkflowList } from '@/api/workflowV2';
import { WorkflowDetailRes } from '@/types/workflowApi';
import { BlockEnum, NodeProps } from '@/pages/workflowConfig/workflow/types';
import cn from 'classnames';
import { cloneDeep } from 'lodash-es';
import { DependItem } from '@/pages/workflowConfig/workflow/nodes/dependent-node/types';

interface IState {
  task_type: 'workflow' | BlockEnum;
  title: string;
  desc: string;
}

type TaskData = WorkflowDetailRes | NodeProps;

interface IProps {
  data: TaskData;
  // 选中 未选中 半选
  status?: 'checked' | 'unchecked' | 'indeterminate';
  type?: 'workflow' | BlockEnum;
  onCheckedStatusChange?: (data: TaskData, checked: boolean) => void;
}

export const TaskItem = (props: IProps) => {
  const { data, type, status, onCheckedStatusChange } = props;

  const taskDesc = useMemo(() => {
    if (type === 'workflow') {
      return (data as WorkflowDetailRes).description || '';
    }
    return (data as NodeProps).data.desc || '';
  }, [type, data]);

  return (
    <label
      className={cn({
        [`mb-2 flex items-center gap-2 ${styles['task-item']}`]: true,
        [styles['task-item-active']]: status !== 'unchecked'
      })}
    >
      <Checkbox
        className={'mr-2'}
        onChange={(checked) => {
          onCheckedStatusChange?.(data, checked);
        }}
      />
      <div className={'flex flex-1 items-center gap-2'}>
        {/*@ts-ignore*/}
        <BlockIcon type={type} size={'md'} />
        <div>
          <Typography.Text bold className={'mb-2'}>
            {type === 'workflow'
              ? (data as WorkflowDetailRes).workflow_name
              : (data as NodeProps).data.title}
          </Typography.Text>
          {!!taskDesc && <div>{(data as NodeProps).data.desc}</div>}
        </div>
      </div>
      <div
        className={`${styles['task-operators']} flex flex-shrink-0 items-center gap-2`}
      >
        <Button
          size={'mini'}
          className={`${styles['task-operator']}`}
          type={'default'}
        >
          详情
        </Button>
        <Button
          size={'mini'}
          className={`${styles['task-operator']}`}
          type={'default'}
        >
          查看任务节点
        </Button>
      </div>
    </label>
  );
};

export const DependentTaskDialog = () => {
  const [form] = Form.useForm();
  // 当前选中查看节点的工作流
  const [currentFlow, setCurrentFlow] = useState<string>('');
  // 当前选中的所有任务
  const [currentSelectTask, setCurrentSelectTask] = useState<
    Map<React.Key, DependItem>
  >(new Map<React.Key, DependItem>());
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

  const { data: list, loading } = tableProps;

  const generateNewDependentTasks = (data: TaskData): DependItem => {
    if ('workflow_uuid' in data) {
      return {
        dependentType: 'DEPENDENT_ON_WORKFLOW',
        definitionCode: data.workflow_uuid,
        depTaskCode: 0,
        parameterPassing: false,
        title: data.workflow_name,
        desc: data.description || ''
      };
    }
    return {
      dependentType: 'DEPENDENT_ON_WORKFLOW',
      definitionCode: data.id,
      depTaskCode: 0,
      parameterPassing: false,
      title: data.data.title,
      task_type: data.data.type,
      desc: data.data.desc || ''
    };
  };

  const onSelectWorkflow = (data: WorkflowDetailRes, checked: boolean) => {
    setCurrentSelectTask((prevState) => {
      const map = cloneDeep(prevState);
      checked
        ? map.set(data.workflow_uuid, generateNewDependentTasks(data))
        : map.delete(data.workflow_uuid);
      return map;
    });
  };
  const onSelectNode = (data: TaskData, checked: boolean) => {};

  return (
    <Modal visible={false} title={'外部任务设置'} style={{ width: '50vw' }}>
      <div className={`flex ${styles['modal-content']} h-[60vh] w-full`}>
        <div
          className={`${styles['left']} flex h-full flex-1 flex-col gap-2 p-4`}
        >
          <div className={`${styles['left-header']} flex-shrink-0`}>
            <Form form={form} autoComplete={'off'}>
              <Form.Item noStyle field={'search_content'}>
                <Input
                  className={'w-[200px]'}
                  suffix={<IconSearch />}
                  placeholder={'输入关键词搜索'}
                />
              </Form.Item>
            </Form>
          </div>
          <div className={`${styles['left-body']} flex-1 overflow-auto`}>
            <Spin loading={!!loading} className={'h-full w-full'}>
              {(list as WorkflowDetailRes[])?.map((item) => (
                <TaskItem
                  key={item.workflow_uuid}
                  data={item}
                  type={'workflow'}
                  status={
                    !!currentSelectTask.get(item.workflow_uuid)
                      ? 'checked'
                      : 'unchecked'
                  }
                  onCheckedStatusChange={(data, checked) =>
                    onSelectWorkflow(data as WorkflowDetailRes, checked)
                  }
                />
              ))}
            </Spin>
          </div>
          <div className={`${styles['left-footer']} flex-end flex-shrink-0`}>
            {/*<Pagination {...tableProps.pagination} className={'justify-end'} />*/}
          </div>
        </div>
        <div
          className={`${styles['right']} flex w-[30%] flex-shrink-0 flex-col gap-y-2 p-4`}
        >
          <div
            className={`${styles['right-header']} flex h-8 w-full flex-shrink-0 items-center justify-between`}
          >
            <Typography.Text bold className={''}>{`已选 (3)`}</Typography.Text>
            <IconDelete />
          </div>
          <div className={'flex-1 overflow-auto'}>
            {Array.from(currentSelectTask.entries()).map(([key, item]) => {
              const { task_type = 'workflow', desc, title } = item;
              return (
                <div
                  className={'mb-2 flex items-center justify-between'}
                  key={key}
                >
                  <div className={'flex items-center gap-2'}>
                    {/*@ts-ignore*/}
                    <BlockIcon size={'md'} type={task_type} />
                    <div>
                      <Typography.Text bold className={'mb-1'}>
                        {title}
                      </Typography.Text>
                      {!!desc && <div>{desc}</div>}
                    </div>
                  </div>
                  <IconClose />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};
