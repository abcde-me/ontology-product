import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Collapse, Form, Input, Modal } from '@arco-design/web-react';
import {
  toAnalysisScope,
  validateAnalysisScope
} from '../services/scopeInstances';
import AnalysisScopeFields, { type SceneOption } from './AnalysisScopeFields';
import DiscoveryAlgorithmRadioGroup from './DiscoveryAlgorithmRadioGroup';
import TaskTypeRadioGroup from './TaskTypeRadioGroup';
import AlgorithmParamsPanel from './AlgorithmParamsPanel';
import {
  findImplicitRelationTaskTypeScenario,
  IMPLICIT_RELATION_TASK_TYPE_OPTIONS
} from '../constants';
import {
  getDefaultAlgorithmParams,
  mergeAlgorithmParams
} from '../services/algorithmParams';
import type {
  CreateImplicitRelationTaskInput,
  ImplicitAnalysisScope,
  ImplicitDiscoveryAlgorithm,
  ImplicitDiscoveryParams,
  ImplicitRelationTaskType
} from '../types';
import styles from './CreateTaskModal.module.scss';

const { TextArea } = Input;

interface CreateTaskModalProps {
  visible: boolean;
  saving?: boolean;
  scenesLoading?: boolean;
  scenes: SceneOption[];
  onCancel: () => void;
  onSubmit: (values: CreateImplicitRelationTaskInput) => void;
}

interface FormValues {
  name: string;
  taskType: ImplicitRelationTaskType;
  description?: string;
  algorithm: ImplicitDiscoveryAlgorithm;
}

const DEFAULT_TASK_TYPE = IMPLICIT_RELATION_TASK_TYPE_OPTIONS[0].value;
const DEFAULT_TASK_TYPE_ALGORITHM: ImplicitDiscoveryAlgorithm =
  'path-prediction';

export default function CreateTaskModal({
  visible,
  saving,
  scenesLoading,
  scenes,
  onCancel,
  onSubmit
}: CreateTaskModalProps) {
  const [form] = Form.useForm<FormValues>();
  const suppressValueChangeRef = useRef(false);
  const [scope, setScope] = useState<Partial<ImplicitAnalysisScope>>({
    instanceMode: 'all',
    objectTypes: [],
    instances: []
  });
  const [scopeError, setScopeError] = useState<string>();
  const [currentAlgorithm, setCurrentAlgorithm] =
    useState<ImplicitDiscoveryAlgorithm>(DEFAULT_TASK_TYPE_ALGORITHM);
  const [algorithmParams, setAlgorithmParams] =
    useState<ImplicitDiscoveryParams>(
      getDefaultAlgorithmParams(DEFAULT_TASK_TYPE_ALGORITHM)
    );

  const resolvedAlgorithmParams = useMemo(
    () => mergeAlgorithmParams(currentAlgorithm, algorithmParams),
    [algorithmParams, currentAlgorithm]
  );

  useEffect(() => {
    if (!visible) {
      return;
    }

    const defaultScenario =
      findImplicitRelationTaskTypeScenario(DEFAULT_TASK_TYPE);
    const defaultAlgorithm =
      defaultScenario?.algorithm || DEFAULT_TASK_TYPE_ALGORITHM;

    suppressValueChangeRef.current = true;
    form.resetFields();
    form.setFieldsValue({
      taskType: DEFAULT_TASK_TYPE,
      algorithm: defaultAlgorithm
    });
    setCurrentAlgorithm(defaultAlgorithm);
    setAlgorithmParams(getDefaultAlgorithmParams(defaultAlgorithm));
    setScope({
      instanceMode: 'all',
      objectTypes: [],
      instances: []
    });
    setScopeError(undefined);

    const timer = window.setTimeout(() => {
      suppressValueChangeRef.current = false;
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [visible]);

  const handleTaskTypeChange = (taskType: ImplicitRelationTaskType) => {
    const scenario = findImplicitRelationTaskTypeScenario(taskType);
    const nextAlgorithm = scenario?.algorithm || DEFAULT_TASK_TYPE_ALGORITHM;
    if (form.getFieldValue('algorithm') !== nextAlgorithm) {
      form.setFieldValue('algorithm', nextAlgorithm);
    }
    setCurrentAlgorithm(nextAlgorithm);
    setAlgorithmParams(getDefaultAlgorithmParams(nextAlgorithm));
  };

  const handleAlgorithmChange = (algorithm: ImplicitDiscoveryAlgorithm) => {
    setCurrentAlgorithm(algorithm);
    setAlgorithmParams(getDefaultAlgorithmParams(algorithm));
  };

  const handleOk = async () => {
    try {
      const values = await form.validate();
      const error = validateAnalysisScope(scope);
      if (error) {
        setScopeError(error);
        return;
      }
      const fullScope = toAnalysisScope(scope);
      if (!fullScope) {
        setScopeError('请选择本体图谱');
        return;
      }
      setScopeError(undefined);
      onSubmit({
        name: values.name,
        scenarioId: values.taskType,
        description: values.description,
        algorithm: values.algorithm,
        algorithmParams: resolvedAlgorithmParams,
        scope: fullScope
      });
    } catch {
      // form validation failed
    }
  };

  return (
    <Modal
      title="新建关系挖掘"
      visible={visible}
      confirmLoading={saving}
      onCancel={onCancel}
      onOk={() => void handleOk()}
      unmountOnExit
      style={{ width: 640 }}
    >
      <Form
        form={form}
        layout="vertical"
        className={styles.createTaskForm}
        onValuesChange={(changed) => {
          if (suppressValueChangeRef.current) {
            return;
          }
          if (changed.taskType) {
            handleTaskTypeChange(changed.taskType);
          }
          if (changed.algorithm) {
            handleAlgorithmChange(changed.algorithm);
          }
        }}
      >
        <Form.Item
          label="任务名称"
          field="name"
          rules={[{ required: true, message: '请输入任务名称' }]}
        >
          <Input placeholder="例如：装备保障关系挖掘" maxLength={64} />
        </Form.Item>

        <Form.Item
          label="任务类型"
          field="taskType"
          rules={[{ required: true, message: '请选择任务类型' }]}
        >
          <TaskTypeRadioGroup />
        </Form.Item>

        <div className={styles.scopeSection}>
          <div className={styles.scopeSectionTitle}>实例范围</div>
          <div className={styles.scopeSectionPanel}>
            <AnalysisScopeFields
              scenes={scenes}
              scenesLoading={scenesLoading}
              value={scope}
              onChange={(next) => {
                setScope(next);
                setScopeError(undefined);
              }}
            />
            {scopeError ? (
              <div className={styles.scopeSectionError}>{scopeError}</div>
            ) : null}
          </div>
        </div>

        <Form.Item
          label="发现算法"
          field="algorithm"
          rules={[{ required: true, message: '请选择发现算法' }]}
        >
          <DiscoveryAlgorithmRadioGroup />
        </Form.Item>

        <Collapse
          bordered={false}
          expandIconPosition="right"
          className={styles.advancedCollapse}
        >
          <Collapse.Item header="高级配置" name="advanced">
            <div className={styles.scopeSectionPanel}>
              <AlgorithmParamsPanel
                algorithm={currentAlgorithm}
                params={resolvedAlgorithmParams}
                onChange={setAlgorithmParams}
              />
            </div>
          </Collapse.Item>
        </Collapse>

        <Form.Item label="任务描述" field="description">
          <TextArea
            placeholder="选填，描述分析目标与业务背景"
            autoSize={{ minRows: 3, maxRows: 6 }}
            maxLength={500}
            showWordLimit
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
