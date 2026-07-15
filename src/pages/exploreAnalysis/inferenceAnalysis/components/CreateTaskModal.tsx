import React, { useEffect, useState } from 'react';
import { Form, Input, Message, Modal, Select } from '@arco-design/web-react';
import { listOntologyModel } from '@/api/ontologySceneLibrary/ontologyScene';
import { listDomainAxioms } from '@/pages/knowledgeManagement/domainAxiom/services/axiomStorage';
import { listSemanticMappings } from '@/pages/knowledgeManagement/semanticMapping/services/mappingStorage';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import { INFERENCE_TYPE_LABEL, INFERENCE_TYPE_OPTIONS } from '../constants';
import type { CreateInferenceAnalysisTaskInput, InferenceType } from '../types';
import styles from '../index.module.scss';

const { TextArea } = Input;
const Option = Select.Option;

interface SceneOption {
  id: number;
  name: string;
}

interface NamedOption {
  id: string;
  name: string;
}

interface CreateTaskModalProps {
  visible: boolean;
  saving?: boolean;
  title?: string;
  initialValues?: Partial<CreateInferenceAnalysisTaskInput>;
  onCancel: () => void;
  onSubmit: (values: CreateInferenceAnalysisTaskInput) => void;
}

export default function CreateTaskModal({
  visible,
  saving,
  title = '新建推理',
  initialValues,
  onCancel,
  onSubmit
}: CreateTaskModalProps) {
  const [form] = Form.useForm<CreateInferenceAnalysisTaskInput>();
  const [scenesLoading, setScenesLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [sceneOptions, setSceneOptions] = useState<SceneOption[]>([]);
  const [semanticMappingOptions, setSemanticMappingOptions] = useState<
    NamedOption[]
  >([]);
  const [domainAxiomOptions, setDomainAxiomOptions] = useState<NamedOption[]>(
    []
  );

  useEffect(() => {
    if (!visible) {
      return;
    }

    form.resetFields();
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
    setScenesLoading(true);
    setOptionsLoading(true);

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

    try {
      setSemanticMappingOptions(
        listSemanticMappings().map((item) => ({
          id: item.id,
          name: item.domainName
            ? `${item.standardTerm}（${item.domainName}）`
            : item.standardTerm
        }))
      );
      setDomainAxiomOptions(
        listDomainAxioms().map((item) => ({
          id: item.id,
          name: item.enabled === false ? `${item.name}（已禁用）` : item.name
        }))
      );
    } catch {
      Message.error('加载语义映射或领域公理失败');
    } finally {
      setOptionsLoading(false);
    }
    // 仅在打开弹窗时初始化，避免 initialValues 引用变化导致反复重置
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, visible]);

  return (
    <Modal
      title={title}
      visible={visible}
      confirmLoading={saving}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText={saving ? '正在推理...' : '确定'}
      unmountOnExit
    >
      <Form
        form={form}
        layout="vertical"
        className={styles.createForm}
        onSubmit={onSubmit}
      >
        <Form.Item
          label="任务名称"
          field="name"
          rules={[{ required: true, message: '请输入任务名称' }]}
        >
          <Input placeholder="例如：装备保障正向推理" maxLength={64} />
        </Form.Item>
        <Form.Item label="任务描述" field="description">
          <TextArea
            placeholder="选填，描述推理目标与业务背景"
            autoSize={{ minRows: 3, maxRows: 6 }}
            maxLength={500}
            showWordLimit
          />
        </Form.Item>
        <Form.Item
          label="推理类型"
          field="inferenceType"
          rules={[{ required: true, message: '请选择推理类型' }]}
        >
          <Select
            placeholder="请选择推理类型"
            dropdownMenuStyle={{ maxWidth: 480 }}
            renderFormat={(_, value) =>
              INFERENCE_TYPE_LABEL[value as InferenceType] ||
              String(value ?? '')
            }
          >
            {INFERENCE_TYPE_OPTIONS.map((item) => (
              <Option key={item.value} value={item.value}>
                <div className={styles.inferenceTypeOption}>
                  <div className={styles.inferenceTypeOptionLabel}>
                    {item.label}
                  </div>
                  <div className={styles.inferenceTypeOptionDesc}>
                    {item.description}
                  </div>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(prev, next) =>
            prev.inferenceType !== next.inferenceType
          }
        >
          {(values) => {
            const selected = INFERENCE_TYPE_OPTIONS.find(
              (item) => item.value === values.inferenceType
            );
            if (!selected) {
              return null;
            }
            return (
              <div className={styles.inferenceTypeSelectedHint}>
                {selected.description}
              </div>
            );
          }}
        </Form.Item>
        <Form.Item
          label="本体场景"
          field="ontologySceneIds"
          rules={[
            {
              validator: (value, callback) => {
                if (!value || (Array.isArray(value) && value.length === 0)) {
                  callback('请选择本体场景');
                  return;
                }
                callback();
              }
            }
          ]}
        >
          <Select
            mode="multiple"
            allowClear
            placeholder="请选择本体场景，可多选"
            loading={scenesLoading}
            showSearch
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
        <Form.Item label="语义映射" field="semanticMappingIds">
          <Select
            mode="multiple"
            allowClear
            placeholder="选填，可多选语义映射"
            loading={optionsLoading}
            showSearch
            filterOption={(inputValue, option) =>
              String(option?.props?.children || '')
                .toLowerCase()
                .includes(inputValue.toLowerCase())
            }
          >
            {semanticMappingOptions.map((item) => (
              <Option key={item.id} value={item.id}>
                {item.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="领域公理" field="domainAxiomIds">
          <Select
            mode="multiple"
            allowClear
            placeholder="选填，可多选领域公理"
            loading={optionsLoading}
            showSearch
            filterOption={(inputValue, option) =>
              String(option?.props?.children || '')
                .toLowerCase()
                .includes(inputValue.toLowerCase())
            }
          >
            {domainAxiomOptions.map((item) => (
              <Option key={item.id} value={item.id}>
                {item.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}
