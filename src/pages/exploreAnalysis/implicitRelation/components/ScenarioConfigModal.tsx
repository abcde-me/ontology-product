import React, { useEffect, useState } from 'react';
import { Form, Input, Modal, Spin } from '@arco-design/web-react';
import { buildScenarioScopeDraft } from '../services/applyUsageScenario';
import {
  toAnalysisScope,
  validateAnalysisScope
} from '../services/scopeInstances';
import AnalysisScopeFields, { type SceneOption } from './AnalysisScopeFields';
import DiscoveryAlgorithmRadioGroup from './DiscoveryAlgorithmRadioGroup';
import type {
  CreateImplicitRelationTaskInput,
  ImplicitAnalysisScope,
  ImplicitDiscoveryAlgorithm,
  ImplicitRelationUsageScenario
} from '../types';
import styles from '../index.module.scss';

const { TextArea } = Input;

interface ScenarioConfigModalProps {
  visible: boolean;
  saving?: boolean;
  scenario?: ImplicitRelationUsageScenario;
  scenesLoading?: boolean;
  scenes: SceneOption[];
  onCancel: () => void;
  onSubmit: (values: CreateImplicitRelationTaskInput) => void;
}

interface FormValues {
  description?: string;
  algorithm: ImplicitDiscoveryAlgorithm;
}

export default function ScenarioConfigModal({
  visible,
  saving,
  scenario,
  scenesLoading,
  scenes,
  onCancel,
  onSubmit
}: ScenarioConfigModalProps) {
  const [form] = Form.useForm<FormValues>();
  const [scope, setScope] = useState<Partial<ImplicitAnalysisScope>>({
    instanceMode: 'all',
    objectTypes: [],
    instances: []
  });
  const [scopeError, setScopeError] = useState<string>();
  const [scopeDraftLoading, setScopeDraftLoading] = useState(false);

  useEffect(() => {
    if (!visible || !scenario) {
      return;
    }

    form.setFieldsValue({
      description: scenario.defaultDescription,
      algorithm: scenario.algorithm
    });
    setScopeError(undefined);
    setScopeDraftLoading(true);
    void buildScenarioScopeDraft(scenario)
      .then((draft) => {
        setScope(draft);
      })
      .finally(() => {
        setScopeDraftLoading(false);
      });
  }, [form, scenario, visible]);

  const handleOk = async () => {
    if (!scenario) {
      return;
    }

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
        name: scenario.defaultTaskName,
        description: values.description,
        algorithm: values.algorithm,
        scope: fullScope
      });
    } catch {
      // form validation failed
    }
  };

  return (
    <Modal
      title={scenario ? `配置场景：${scenario.title}` : '配置场景'}
      visible={visible}
      confirmLoading={saving}
      onCancel={onCancel}
      onOk={() => void handleOk()}
      unmountOnExit
      style={{ width: 680 }}
    >
      {scenario?.tip ? (
        <div className={styles.scenarioTip}>{scenario.tip}</div>
      ) : null}
      <Spin
        loading={scopeDraftLoading || scenesLoading}
        style={{ display: 'block' }}
      >
        <Form
          form={form}
          layout="vertical"
          className={styles.scenarioConfigForm}
        >
          <Form.Item
            label={
              <span className={styles.scenarioConfigSectionTitle}>
                任务描述
              </span>
            }
            field="description"
          >
            <TextArea
              placeholder="选填，描述分析目标与业务背景"
              autoSize={{ minRows: 2, maxRows: 4 }}
              maxLength={500}
              showWordLimit
            />
          </Form.Item>
          <Form.Item
            label={
              <span className={styles.scenarioConfigSectionTitle}>
                发现算法
              </span>
            }
            field="algorithm"
            rules={[{ required: true, message: '请选择发现算法' }]}
          >
            <DiscoveryAlgorithmRadioGroup />
          </Form.Item>
        </Form>

        <div className={styles.scenarioConfigScopeSection}>
          <div className={styles.scenarioConfigSectionTitle}>分析范围</div>
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
            <div
              style={{
                marginTop: 8,
                color: 'rgb(var(--danger-6))',
                fontSize: 12
              }}
            >
              {scopeError}
            </div>
          ) : null}
        </div>
      </Spin>
    </Modal>
  );
}
