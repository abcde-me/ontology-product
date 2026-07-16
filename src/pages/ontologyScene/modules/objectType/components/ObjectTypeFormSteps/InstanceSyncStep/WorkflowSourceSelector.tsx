import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Descriptions,
  Form,
  Message,
  Select,
  Space,
  Spin
} from '@arco-design/web-react';
import { IconPlus, IconRefresh } from '@arco-design/web-react/icon';
import dayjs from 'dayjs';
import { DotStatus } from '@ceai-front/arco-material';
import {
  ExecutionStatus,
  ScheduleType,
  TaskStatus,
  TaskType,
  type DataTaskItem
} from '@/pages/dataTask/types';
import {
  fetchDataTaskDetail,
  fetchDataTaskList,
  loadWorkflowDraft
} from '@/pages/dataTask/services/api';
import { extractWorkflowOutputFields } from '../../../services/extractWorkflowOutputFields';
import WorkflowCanvasPreview from './WorkflowCanvasPreview';
import type {
  ObjectTypeAttributeField,
  SourceTableField,
  SyncSourceDataStrategyFormState
} from '../../ObjectTypeFormUtils/types';

const FormItem = Form.Item;

const DATA_TASK_CREATE_PATH = '/tenant/compute/onto/dataConnection/dataTask2';

const taskTypeLabelMap: Record<TaskType, string> = {
  [TaskType.TABLE_SYNC]: '表-表同步',
  [TaskType.WORKFLOW_DAG]: 'DAG工作流'
};

const scheduleTypeLabelMap: Record<ScheduleType, string> = {
  [ScheduleType.PERIODIC]: '周期调度',
  [ScheduleType.ONCE]: '单次调度',
  [ScheduleType.IMMEDIATE]: '立即执行'
};

const statusLabelMap: Record<TaskStatus, { text: string; color: string }> = {
  [TaskStatus.DEVELOPING]: { text: '开发中', color: '#ff7d00' },
  [TaskStatus.PUBLISHING]: { text: '发布中', color: '#165dff' },
  [TaskStatus.ONLINE]: { text: '已上线', color: '#00b42a' },
  [TaskStatus.OFFLINE]: { text: '已下线', color: '#86909c' }
};

const executionStatusLabelMap: Record<
  ExecutionStatus,
  { text: string; color: string }
> = {
  [ExecutionStatus.RUNNING]: { text: '执行中', color: '#165dff' },
  [ExecutionStatus.SUCCESS]: { text: '执行成功', color: '#00b42a' },
  [ExecutionStatus.FAILED]: { text: '执行失败', color: '#f53f3f' }
};

function buildWorkflowTaskSnapshot(
  task: DataTaskItem
): NonNullable<SyncSourceDataStrategyFormState['workflowDataTaskSnapshot']> {
  return {
    taskType: task.taskType,
    name: task.name,
    scheduleType: task.scheduleType,
    status: task.status,
    latestExecutionStatus: task.latestExecutionStatus,
    updater: task.updater,
    updaterName: task.updaterName,
    updateTime: task.updateTime,
    description: task.description
  };
}

function attributesToSourceFields(
  attributes: ObjectTypeAttributeField[]
): SourceTableField[] {
  return attributes.map((attribute) => ({
    fieldId: attribute.propertyID,
    fieldComment: attribute.propertyComment || attribute.propertyID,
    fieldType: attribute.propertyType || 'varchar'
  }));
}

interface WorkflowSourceSelectorProps {
  form: any;
  syncSourceDataStrategy: SyncSourceDataStrategyFormState;
  objectTypeAttributes?: ObjectTypeAttributeField[];
  onStrategyUpdate: (updates: Partial<SyncSourceDataStrategyFormState>) => void;
  onWorkflowOutputFieldsReady?: (fields: SourceTableField[]) => void;
  styles: Record<string, string>;
  readOnly?: boolean;
}

export default function WorkflowSourceSelector({
  form,
  syncSourceDataStrategy,
  objectTypeAttributes = [],
  onStrategyUpdate,
  onWorkflowOutputFieldsReady,
  styles,
  readOnly = false
}: WorkflowSourceSelectorProps) {
  const [workflowTasks, setWorkflowTasks] = useState<DataTaskItem[]>([]);
  const [workflowTasksLoading, setWorkflowTasksLoading] = useState(false);
  const [workflowDetailLoading, setWorkflowDetailLoading] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const selectedTaskId = syncSourceDataStrategy.workflowDataTaskId;
  const selectedSnapshot = syncSourceDataStrategy.workflowDataTaskSnapshot;
  const objectTypeName = Form.useWatch('name', form) as string | undefined;
  const defaultTaskName = String(objectTypeName ?? '').trim();

  const loadDataTasks = async (keyword?: string) => {
    setWorkflowTasksLoading(true);
    try {
      const response = await fetchDataTaskList({
        pageNo: 1,
        pageSize: 200,
        filter: keyword?.trim() || undefined
      });
      setWorkflowTasks(response.items || []);
    } catch (error) {
      console.error('加载数据任务失败:', error);
      Message.error('加载数据任务失败');
      setWorkflowTasks([]);
    } finally {
      setWorkflowTasksLoading(false);
    }
  };

  useEffect(() => {
    void loadDataTasks();
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (
      !selectedTaskId ||
      selectedSnapshot ||
      workflowTasksLoading ||
      workflowDetailLoading
    ) {
      return;
    }

    const task = workflowTasks.find((item) => item.id === selectedTaskId);
    if (!task) {
      return;
    }

    void applySelectedWorkflowTask(task);
  }, [
    selectedTaskId,
    selectedSnapshot,
    workflowTasks,
    workflowTasksLoading,
    workflowDetailLoading
  ]);

  const workflowTaskOptions = useMemo(
    () =>
      workflowTasks.map((task) => ({
        label: task.name,
        value: task.id
      })),
    [workflowTasks]
  );

  const resolveOutputFields = async (
    task: DataTaskItem
  ): Promise<SourceTableField[]> => {
    try {
      const draft = await loadWorkflowDraft(task.id, task.processId);
      const extracted = extractWorkflowOutputFields(draft);
      if (extracted.length) {
        return extracted;
      }
    } catch (error) {
      console.error('加载工作流输出字段失败:', error);
    }
    return attributesToSourceFields(objectTypeAttributes);
  };

  const applySelectedWorkflowTask = async (task: DataTaskItem) => {
    setWorkflowDetailLoading(true);
    try {
      const detail = await fetchDataTaskDetail(task.id);
      const outputFields = await resolveOutputFields(detail);
      const snapshot = buildWorkflowTaskSnapshot(detail);

      onStrategyUpdate({
        workflowDataTaskId: detail.id,
        workflowDataTaskName: detail.name,
        workflowProcessId: detail.processId,
        workflowDataTaskSnapshot: snapshot,
        workflowOutputFields: outputFields
      });
      form.setFieldValue('syncWorkflowDataTaskId', detail.id);
      onWorkflowOutputFieldsReady?.(outputFields);
    } catch (error) {
      console.error('加载工作流详情失败:', error);
      Message.error('加载工作流详情失败');
    } finally {
      setWorkflowDetailLoading(false);
    }
  };

  const handleWorkflowTaskChange = async (taskId?: string) => {
    if (!taskId) {
      onStrategyUpdate({
        workflowDataTaskId: undefined,
        workflowDataTaskName: undefined,
        workflowProcessId: undefined,
        workflowDataTaskSnapshot: undefined,
        workflowOutputFields: undefined
      });
      form.setFieldValue('syncWorkflowDataTaskId', undefined);
      onWorkflowOutputFieldsReady?.([]);
      return;
    }

    const task = workflowTasks.find((item) => item.id === taskId);
    if (!task) {
      Message.warning('未找到对应的数据任务');
      return;
    }

    await applySelectedWorkflowTask(task);
  };

  const handleTaskSearch = (keyword: string) => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    searchTimerRef.current = setTimeout(() => {
      void loadDataTasks(keyword);
    }, 300);
  };

  const handleCreateWorkflow = () => {
    const params = new URLSearchParams({ create: '1' });
    if (defaultTaskName) {
      params.set('name', defaultTaskName);
    }
    window.open(
      `${DATA_TASK_CREATE_PATH}?${params.toString()}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const renderStatus = (status?: TaskStatus) => {
    if (!status) {
      return '-';
    }
    const config = statusLabelMap[status];
    return <DotStatus text={config.text} color={config.color} />;
  };

  const renderExecutionStatus = (status?: ExecutionStatus) => {
    if (!status) {
      return '-';
    }
    const config = executionStatusLabelMap[status];
    return <DotStatus text={config.text} color={config.color} />;
  };

  return (
    <>
      <FormItem
        label="任务名称"
        field="syncWorkflowDataTaskId"
        rules={[{ required: true, message: '请选择任务名称' }]}
      >
        <Space align="start" className={styles['workflow-selector-row']}>
          <Select
            className={styles['modeling-borderless-control']}
            placeholder="请查询并选择任务名称"
            loading={workflowTasksLoading || workflowDetailLoading}
            value={selectedTaskId}
            disabled={readOnly}
            allowClear
            showSearch
            filterOption={false}
            onSearch={handleTaskSearch}
            onChange={(value) => void handleWorkflowTaskChange(value)}
            options={workflowTaskOptions}
            style={{ minWidth: 320, flex: 1 }}
          />
          <Button
            type="outline"
            icon={<IconRefresh />}
            disabled={readOnly || workflowTasksLoading}
            onClick={() => void loadDataTasks()}
          >
            刷新
          </Button>
          <Button
            type="outline"
            icon={<IconPlus />}
            disabled={readOnly}
            onClick={handleCreateWorkflow}
          >
            创建
          </Button>
        </Space>
      </FormItem>

      {workflowDetailLoading ? (
        <div className={styles['workflow-info-loading']}>
          <Spin size={16} />
          <span>正在加载任务详情...</span>
        </div>
      ) : null}

      {selectedSnapshot ? (
        <div className={styles['workflow-task-info']}>
          <div className={styles['workflow-task-info-header']}>
            <span className={styles['workflow-task-info-title']}>任务详情</span>
          </div>
          <Descriptions
            column={2}
            colon="："
            labelStyle={{ width: 120, paddingRight: 8 }}
            data={[
              {
                label: '任务类型',
                value:
                  taskTypeLabelMap[selectedSnapshot.taskType] ||
                  selectedSnapshot.taskType
              },
              {
                label: '任务名称',
                value: selectedSnapshot.name
              },
              {
                label: '调度方式',
                value:
                  scheduleTypeLabelMap[selectedSnapshot.scheduleType] ||
                  selectedSnapshot.scheduleType
              },
              {
                label: '任务状态',
                value: renderStatus(selectedSnapshot.status)
              },
              {
                label: '最新执行状态',
                value: renderExecutionStatus(
                  selectedSnapshot.latestExecutionStatus
                )
              },
              {
                label: '更新人',
                value: `${selectedSnapshot.updater} [${selectedSnapshot.updaterName}]`
              },
              {
                label: '更新时间',
                value: selectedSnapshot.updateTime
                  ? dayjs(selectedSnapshot.updateTime).format(
                      'YYYY-MM-DD HH:mm:ss'
                    )
                  : '-'
              },
              {
                label: '任务描述',
                value: selectedSnapshot.description || '-',
                span: 2
              }
            ]}
          />
        </div>
      ) : null}

      {selectedTaskId &&
      selectedSnapshot &&
      selectedSnapshot.taskType === TaskType.WORKFLOW_DAG ? (
        <div className={styles['workflow-task-info']}>
          <div className={styles['workflow-task-info-header']}>
            <span className={styles['workflow-task-info-title']}>画布信息</span>
          </div>
          <WorkflowCanvasPreview
            taskId={selectedTaskId}
            processId={syncSourceDataStrategy.workflowProcessId}
            styles={styles}
          />
        </div>
      ) : null}
    </>
  );
}
