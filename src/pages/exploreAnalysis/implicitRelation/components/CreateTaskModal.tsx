import React, { useEffect, useState } from 'react';
import { Form, Input, Modal, Radio, Spin } from '@arco-design/web-react';
import { DISCOVERY_ALGORITHM_OPTIONS } from '../constants';
import type {
  CreateImplicitRelationTaskInput,
  ImplicitAnalysisScope,
  ImplicitDiscoveryAlgorithm
} from '../types';
import { validateAnalysisScope } from '../services/scopeInstances';
import AnalysisScopeFields, { type SceneOption } from './AnalysisScopeFields';

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
  description?: string;
  algorithm: ImplicitDiscoveryAlgorithm;
}

export default function CreateTaskModal({
  visible,
  saving,
  scenesLoading,
  scenes,
  onCancel,
  onSubmit
}: CreateTaskModalProps) {
  const [form] = Form.useForm<FormValues>();
  const [scope, setScope] = useState<Partial<ImplicitAnalysisScope>>({
    instanceMode: 'all',
    objectTypes: [],
    instances: []
  });
  const [scopeError, setScopeError] = useState<string>();

  useEffect(() => {
    if (visible) {
      form.resetFields();
      form.setFieldsValue({ algorithm: 'community' });
      setScope({
        instanceMode: 'all',
        objectTypes: [],
        instances: []
      });
      setScopeError(undefined);
    }
  }, [form, visible]);

  const handleOk = async () => {
    try {
      const values = await form.validate();
      const error = validateAnalysisScope(scope);
      if (error) {
        setScopeError(error);
        return;
      }
      setScopeError(undefined);
      onSubmit({
        name: values.name,
        description: values.description,
        algorithm: values.algorithm,
        scope: scope as ImplicitAnalysisScope
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
      <Spin loading={scenesLoading} style={{ display: 'block' }}>
        <Form form={form} layout="vertical">
          <Form.Item
            label="任务名称"
            field="name"
            rules={[{ required: true, message: '请输入任务名称' }]}
          >
            <Input placeholder="例如：装备保障关系挖掘" maxLength={64} />
          </Form.Item>

          <div style={{ marginBottom: 16 }}>
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
                  marginTop: 6,
                  color: 'rgb(var(--danger-6))',
                  fontSize: 12
                }}
              >
                {scopeError}
              </div>
            ) : null}
          </div>

          <Form.Item
            label="发现算法"
            field="algorithm"
            rules={[{ required: true, message: '请选择发现算法' }]}
          >
            <Radio.Group>
              {DISCOVERY_ALGORITHM_OPTIONS.map((option) => (
                <Radio key={option.value} value={option.value}>
                  <div>
                    <div>{option.label}</div>
                    <div
                      style={{
                        color: 'var(--color-text-3)',
                        fontSize: 12,
                        lineHeight: 1.5,
                        marginTop: 2
                      }}
                    >
                      {option.description}
                    </div>
                  </div>
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>
          <Form.Item label="任务描述" field="description">
            <TextArea
              placeholder="选填，描述分析目标与业务背景"
              autoSize={{ minRows: 3, maxRows: 6 }}
              maxLength={500}
              showWordLimit
            />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
}
