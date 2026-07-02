import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  Alert,
  Button,
  Checkbox,
  Form,
  Input,
  Message,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography
} from '@arco-design/web-react';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import { useHistory } from 'react-router-dom';
import { OntoModal } from '@/components/OSModal';
import DataResourceTableSelector from '@/pages/ontologyScene/modules/objectType/components/ObjectTypeFormSteps/common/DataResourceTableSelector';
import type { DataResourceTable } from '../types';
import {
  FILE_EXTRACT_RESULT_PATH,
  FILE_EXTRACT_TASK_STATUS_LABEL,
  FILE_EXTRACT_TYPE_LABEL,
  FILE_EXTRACT_TYPE_OPTIONS
} from '../constants/fileExtract';
import type { FileResourceListItem } from '../types';
import type { FileExtractTask, FileExtractType } from '../types/fileExtract';
import { getFileResourceExtractSource } from '../services/fileApi';
import {
  createFileExtractTasks,
  listFileExtractTasksByFileId
} from '../services/fileExtractStorage';
import { runExtractTasks } from '../services/extractTaskRunner';
import styles from '../index.module.scss';

const { TextArea } = Input;

interface InstanceTargetTableFieldProps {
  value?: string;
  onChange?: (value?: string) => void;
  onTableChange?: (table: DataResourceTable | null) => void;
}

const InstanceTargetTableField: React.FC<InstanceTargetTableFieldProps> = ({
  value,
  onChange,
  onTableChange
}) => (
  <DataResourceTableSelector
    multiple={false}
    value={value}
    onChange={(tables) => {
      const table = tables[0] ?? null;
      onTableChange?.(table);
      onChange?.(table?.id);
    }}
  />
);

interface FileExtractModalProps {
  visible: boolean;
  record: FileResourceListItem | null;
  onClose: () => void;
}

const statusColorMap = {
  pending: 'gray',
  running: 'arcoblue',
  completed: 'green',
  failed: 'red'
} as const;

export const FileExtractModal: React.FC<FileExtractModalProps> = ({
  visible,
  record,
  onClose
}) => {
  const history = useHistory();
  const [form] = Form.useForm();
  const [loadingSource, setLoadingSource] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sourceNote, setSourceNote] = useState<string>();
  const [tasks, setTasks] = useState<FileExtractTask[]>([]);
  const [instanceTargetTable, setInstanceTargetTable] =
    useState<DataResourceTable | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const extractTypes = Form.useWatch('extractTypes', form) as
    | FileExtractType[]
    | undefined;
  const showInstanceTableSelector = (extractTypes || []).includes('instance');

  const refreshTasks = useCallback(() => {
    if (!record) {
      setTasks([]);
      return;
    }
    setTasks(listFileExtractTasksByFileId(record.id));
  }, [record]);

  useEffect(() => {
    if (!visible || !record) {
      form.resetFields();
      setSourceNote(undefined);
      setTasks([]);
      setInstanceTargetTable(null);
      return;
    }

    let active = true;
    setLoadingSource(true);
    setSourceNote(undefined);
    form.resetFields();
    refreshTasks();

    void getFileResourceExtractSource(record)
      .then((source) => {
        if (!active) {
          return;
        }
        setSourceNote(source.note);
      })
      .finally(() => {
        if (active) {
          setLoadingSource(false);
        }
      });

    return () => {
      active = false;
    };
  }, [visible, record, form, refreshTasks]);

  useEffect(() => {
    if (!showInstanceTableSelector) {
      setInstanceTargetTable(null);
      form.setFieldValue('instanceTargetTableId', undefined);
    }
  }, [showInstanceTableSelector, form]);

  useEffect(() => {
    if (!visible) {
      abortRef.current?.abort();
      abortRef.current = null;
      return;
    }

    const hasActiveTask = tasks.some(
      (task) => task.status === 'pending' || task.status === 'running'
    );
    if (!hasActiveTask) {
      return;
    }

    const timer = window.setInterval(() => {
      refreshTasks();
    }, 1500);

    return () => window.clearInterval(timer);
  }, [visible, tasks, refreshTasks]);

  const handleClose = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    onClose();
  };

  const handleSubmit = async () => {
    if (!record) {
      return;
    }

    let extractTypes: FileExtractType[] = [];
    let requirement = '';
    let instanceTargetTableId: string | undefined;

    try {
      const values = await form.validate();
      extractTypes = (values.extractTypes || []) as FileExtractType[];
      requirement = String(values.requirement || '').trim();
      instanceTargetTableId = values.instanceTargetTableId as
        | string
        | undefined;
    } catch {
      return;
    }

    if (!extractTypes.length) {
      Message.warning('请至少选择一种提取类型');
      return;
    }

    if (extractTypes.includes('instance') && !instanceTargetTableId) {
      Message.warning('实例提取需选择目标数据资源表');
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setSubmitting(true);

    try {
      const createdTasks = createFileExtractTasks({
        fileId: record.id,
        fileName: record.fileName,
        requirement,
        extractTypes,
        instanceTargetTableId,
        instanceTargetTableName: instanceTargetTable?.tableName
      });
      refreshTasks();

      await runExtractTasks(createdTasks, {
        signal: controller.signal,
        onTaskUpdate: () => refreshTasks()
      });

      refreshTasks();
      Message.success(`已创建 ${createdTasks.length} 个提取任务`);
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }
      const message =
        error instanceof Error ? error.message : '创建提取任务失败';
      Message.error(message);
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
      setSubmitting(false);
    }
  };

  const openResultPage = useCallback(
    (task: FileExtractTask) => {
      history.push(`${FILE_EXTRACT_RESULT_PATH}/${task.id}`);
      abortRef.current?.abort();
      abortRef.current = null;
      onClose();
    },
    [history, onClose]
  );

  const taskColumns: ColumnProps<FileExtractTask>[] = useMemo(
    () => [
      {
        title: '提取类型',
        dataIndex: 'extractType',
        width: 140,
        render: (value: FileExtractType, row) => (
          <Space direction="vertical" size={4}>
            <span>{FILE_EXTRACT_TYPE_LABEL[value]}</span>
            {row.extractType === 'instance' && row.targetTableName ? (
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                目标表：{row.targetTableName}
              </Typography.Text>
            ) : null}
          </Space>
        )
      },
      {
        title: '提取要求',
        dataIndex: 'requirement',
        ellipsis: true
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 100,
        render: (value: FileExtractTask['status'], row) => (
          <Space direction="vertical" size={4}>
            <Tag color={statusColorMap[value]}>
              {FILE_EXTRACT_TASK_STATUS_LABEL[value]}
            </Tag>
            {row.errorMessage ? (
              <Typography.Text type="error" style={{ fontSize: 12 }}>
                {row.errorMessage}
              </Typography.Text>
            ) : null}
          </Space>
        )
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        width: 170
      },
      {
        title: '操作',
        width: 120,
        render: (_, row) => (
          <Button
            type="text"
            className={styles['table-action']}
            disabled={row.status !== 'completed'}
            onClick={() => openResultPage(row)}
          >
            提取结果
          </Button>
        )
      }
    ],
    [openResultPage]
  );

  return (
    <OntoModal
      title={`信息提取 - ${record?.fileName ?? ''}`}
      visible={visible}
      onCancel={handleClose}
      style={{ width: 920 }}
      unmountOnExit
      footer={
        <div className={styles['file-extract-footer']}>
          <Button onClick={handleClose}>关闭</Button>
          <Button
            type="primary"
            loading={submitting}
            disabled={loadingSource}
            onClick={() => void handleSubmit()}
          >
            开始提取
          </Button>
        </div>
      }
    >
      <Spin loading={loadingSource} className={styles['file-extract-spin']}>
        {record ? (
          <div className={styles['file-extract-body']}>
            {sourceNote ? (
              <Alert
                type="info"
                content={sourceNote}
                className={styles['file-extract-alert']}
              />
            ) : null}

            <Form
              form={form}
              layout="vertical"
              autoComplete="off"
              className={styles['file-extract-form']}
            >
              <Form.Item
                label="提取类型"
                field="extractTypes"
                rules={[{ required: true, message: '请至少选择一种提取类型' }]}
              >
                <Checkbox.Group className={styles['file-extract-type-group']}>
                  {FILE_EXTRACT_TYPE_OPTIONS.map((option) => (
                    <Tooltip key={option.value} content={option.description}>
                      <span className={styles['file-extract-type-item']}>
                        <Checkbox value={option.value}>{option.label}</Checkbox>
                      </span>
                    </Tooltip>
                  ))}
                </Checkbox.Group>
              </Form.Item>

              {showInstanceTableSelector ? (
                <Form.Item
                  label="目标数据资源表"
                  field="instanceTargetTableId"
                  rules={[{ required: true, message: '请选择目标数据资源表' }]}
                  extra="实例提取将按所选库表字段结构进行提取，结果可插入到该表中"
                >
                  <InstanceTargetTableField
                    onTableChange={setInstanceTargetTable}
                  />
                </Form.Item>
              ) : null}

              <Form.Item
                label="提取要求"
                field="requirement"
                rules={[
                  { required: true, message: '请填写提取要求' },
                  { minLength: 4, message: '提取要求至少 4 个字符' }
                ]}
              >
                <TextArea
                  placeholder="例如：提取文档中的指挥节点、作战单元及其指挥链路关系"
                  autoSize={{ minRows: 3, maxRows: 6 }}
                  maxLength={2000}
                  showWordLimit
                />
              </Form.Item>
            </Form>

            <div className={styles['file-extract-task-section']}>
              <Typography.Text
                bold
                className={styles['file-extract-task-title']}
              >
                历史提取列表
              </Typography.Text>
              <Table
                rowKey="id"
                columns={taskColumns}
                data={tasks}
                pagination={false}
                border={false}
                scroll={{ y: 240 }}
                className={styles['file-extract-history-table']}
                noDataElement="暂无提取任务"
              />
            </div>
          </div>
        ) : null}
      </Spin>
    </OntoModal>
  );
};
