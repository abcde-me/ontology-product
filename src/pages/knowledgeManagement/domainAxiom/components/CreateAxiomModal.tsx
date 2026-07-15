import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Message,
  Modal,
  Select,
  Switch
} from '@arco-design/web-react';
import { listOntologyModel } from '@/api/ontologySceneLibrary/ontologyScene';
import { listApplicationScenarios } from '@/pages/applicationScene/services/storage';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import { DEFAULT_DOMAIN_OPTIONS } from '../constants';
import type { CreateDomainAxiomInput } from '../types';
import styles from '../index.module.scss';

const { TextArea } = Input;
const Option = Select.Option;

interface SceneOption {
  id: number;
  name: string;
}

interface ApplicationScenarioOption {
  id: string;
  name: string;
}

interface CreateAxiomFormValues {
  name: string;
  expression: string;
  description?: string;
  domain?: string;
  ontologySceneId?: number;
  applicationScenarioId?: string;
  enabled?: boolean;
}

interface CreateAxiomModalProps {
  visible: boolean;
  saving?: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateDomainAxiomInput) => void;
}

export default function CreateAxiomModal({
  visible,
  saving,
  onCancel,
  onSubmit
}: CreateAxiomModalProps) {
  const [form] = Form.useForm<CreateAxiomFormValues>();
  const [scenesLoading, setScenesLoading] = useState(false);
  const [sceneOptions, setSceneOptions] = useState<SceneOption[]>([]);
  const [appScenarioOptions, setAppScenarioOptions] = useState<
    ApplicationScenarioOption[]
  >([]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    form.resetFields();
    form.setFieldsValue({ enabled: true });
    setAppScenarioOptions(
      listApplicationScenarios().map((item) => ({
        id: item.id,
        name: item.name
      }))
    );
    setScenesLoading(true);

    listOntologyModel({
      pageNo: 1,
      pageSize: 100,
      order: 'desc',
      orderBy: 'create_time'
    })
      .then((res) => {
        if (isOntologyApiSuccess(res) && res.data?.result) {
          setSceneOptions(
            res.data.result
              .filter((scene) => scene.id != null)
              .map((scene) => ({
                id: scene.id as number,
                name: scene.name || `场景 #${scene.id}`
              }))
          );
        }
      })
      .catch(() => {
        Message.error('加载本体场景失败');
      })
      .finally(() => {
        setScenesLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, visible]);

  const handleSubmit = (values: CreateAxiomFormValues) => {
    const scene = sceneOptions.find(
      (item) => item.id === values.ontologySceneId
    );
    const appScenario = appScenarioOptions.find(
      (item) => item.id === values.applicationScenarioId
    );
    onSubmit({
      name: values.name,
      expression: values.expression,
      description: values.description,
      domain: values.domain,
      ontologySceneId: values.ontologySceneId,
      ontologySceneName: scene?.name,
      applicationScenarioId: values.applicationScenarioId,
      applicationScenarioName: appScenario?.name,
      sourceType: 'manual',
      enabled: values.enabled !== false
    });
  };

  return (
    <Modal
      title="人工创建领域公理"
      visible={visible}
      confirmLoading={saving}
      onCancel={onCancel}
      onOk={() => form.submit()}
      unmountOnExit
      style={{ width: 640 }}
    >
      <Form
        form={form}
        layout="vertical"
        className={styles.createModalForm}
        onSubmit={handleSubmit}
      >
        <Form.Item
          label="公理名称"
          field="name"
          rules={[{ required: true, message: '请输入公理名称' }]}
        >
          <Input placeholder="例如：平台武器挂载约束" maxLength={64} />
        </Form.Item>
        <Form.Item
          label="公理表达式"
          field="expression"
          rules={[{ required: true, message: '请输入公理表达式' }]}
          extra="用自然语言或形式化规则描述约束，后续可供推理分析引用"
        >
          <TextArea
            placeholder="例如：每个军事行动必须关联至少一个指挥单元"
            autoSize={{ minRows: 3, maxRows: 8 }}
            maxLength={2000}
            showWordLimit
          />
        </Form.Item>
        <Form.Item label="说明" field="description">
          <TextArea
            placeholder="选填，补充公理适用场景与业务背景"
            autoSize={{ minRows: 2, maxRows: 5 }}
            maxLength={500}
            showWordLimit
          />
        </Form.Item>
        <Form.Item
          label="所属领域"
          field="domain"
          extra="支持选择预置领域，或输入后回车新建"
        >
          <Select
            placeholder="选择或输入所属领域"
            allowClear
            allowCreate
            showSearch
          >
            {DEFAULT_DOMAIN_OPTIONS.map((item) => (
              <Option key={item} value={item}>
                {item}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="应用场景"
          field="applicationScenarioId"
          extra="选填，绑定后便于按应用场景组织与引用公理"
        >
          <Select
            placeholder="请选择应用场景（可选）"
            allowClear
            showSearch
            filterOption={(inputValue, option) =>
              String(option?.props?.children || '')
                .toLowerCase()
                .includes(inputValue.toLowerCase())
            }
          >
            {appScenarioOptions.map((item) => (
              <Option key={item.id} value={item.id}>
                {item.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="关联本体场景"
          field="ontologySceneId"
          extra="选填，绑定后便于推理分析按场景引用"
        >
          <Select
            placeholder="请选择本体场景（可选）"
            allowClear
            showSearch
            loading={scenesLoading}
            filterOption={(inputValue, option) =>
              String(option?.props?.children || '')
                .toLowerCase()
                .includes(inputValue.toLowerCase())
            }
          >
            {sceneOptions.map((scene) => (
              <Option key={scene.id} value={scene.id}>
                {scene.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="启用"
          field="enabled"
          triggerPropName="checked"
          initialValue
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}
