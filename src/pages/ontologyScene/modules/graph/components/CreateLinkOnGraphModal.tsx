import React, { useEffect, useMemo, useState } from 'react';
import { Form, Input, Message, Modal, Radio } from '@arco-design/web-react';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import ObjectTypeSelect from '@/pages/ontologyScene/components/ObjectTypeSelect';
import { generateOntologyIdentifier } from '@/utils/generateOntologyIdentifier';
import { createLinkOnGraph } from '../services/graphCreateServices';
import { fetchSceneAllOntologyIdentifiers } from '@/utils/ontologyIdentifier';
import type { GraphObjectTypePick } from '../context/GraphCreateContext';
import { LinkDirection } from '@/pages/ontologyScene/types/link';
import {
  mapFormLinkTypeToApi,
  mapLinkDirectionToFormLinkType
} from '@/pages/ontologyScene/modules/links/components/linkForm/constants';

export interface CreateLinkPreset {
  sourceObjectTypeID?: number;
  targetObjectTypeID?: number;
  name?: string;
  description?: string;
}

interface CreateLinkOnGraphModalProps {
  visible: boolean;
  sceneId: number;
  onClose: () => void;
  onSuccess?: () => void;
  /** 右键选中的源对象类型 */
  presetSource?: GraphObjectTypePick | null;
  /** 预填链接名称、对象类型与描述 */
  preset?: CreateLinkPreset;
  title?: string;
  /** 成功后是否自动关闭，批量创建时可设为 false */
  closeOnSuccess?: boolean;
}

export default function CreateLinkOnGraphModal({
  visible,
  sceneId,
  onClose,
  onSuccess,
  presetSource,
  preset,
  title = '新建链接',
  closeOnSuccess = true
}: CreateLinkOnGraphModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [existingCodes, setExistingCodes] = useState<string[]>([]);
  const nameValue = Form.useWatch('name', form);
  const sourceObjectTypeID = Form.useWatch('sourceObjectTypeID', form);

  const suggestedCode = useMemo(() => {
    if (!nameValue?.trim()) {
      return '';
    }
    return generateOntologyIdentifier(nameValue, existingCodes);
  }, [existingCodes, nameValue]);

  const resolvedSourceId = presetSource?.id ?? sourceObjectTypeID;

  useEffect(() => {
    if (!visible || !sceneId) {
      return;
    }

    form.resetFields();
    form.setFieldValue('linkDirection', LinkDirection.UNIDIRECTIONAL);

    if (presetSource) {
      form.setFieldValue('sourceObjectTypeID', presetSource.id);
    } else if (preset?.sourceObjectTypeID) {
      form.setFieldValue('sourceObjectTypeID', preset.sourceObjectTypeID);
    }

    if (preset?.targetObjectTypeID) {
      form.setFieldValue('targetObjectTypeID', preset.targetObjectTypeID);
    }
    if (preset?.name) {
      form.setFieldValue('name', preset.name);
    }
    if (preset?.description) {
      form.setFieldValue('description', preset.description);
    }

    fetchSceneAllOntologyIdentifiers(sceneId)
      .then((allIds) => {
        setExistingCodes(allIds);
      })
      .catch(() => {
        setExistingCodes([]);
      });
  }, [visible, sceneId, form, preset, presetSource]);

  useEffect(() => {
    if (visible && suggestedCode) {
      form.setFieldValue('code', suggestedCode);
    }
  }, [visible, suggestedCode, form]);

  const handleOk = async () => {
    try {
      const values = await form.validate();

      const sourceId = presetSource?.id ?? values.sourceObjectTypeID;
      const targetId = values.targetObjectTypeID;

      if (!values.linkDirection) {
        Message.warning('请选择链接方向');
        return;
      }

      if (!sourceId || !targetId) {
        Message.warning('请选择源对象类型和目标对象类型');
        return;
      }

      if (sourceId === targetId) {
        Message.warning('源对象类型与目标对象类型不能相同');
        return;
      }

      setLoading(true);

      const linkType = mapLinkDirectionToFormLinkType(values.linkDirection);

      const { response } = await createLinkOnGraph({
        name: values.name,
        code: values.code,
        ontologyModelID: sceneId,
        sourceObjectTypeID: sourceId,
        targetObjectTypeID: targetId,
        type: mapFormLinkTypeToApi(linkType),
        description: values.description
      });

      if (isOntologyApiSuccess(response) && response.data?.id) {
        Message.success('链接创建成功');
        onSuccess?.();
        if (closeOnSuccess) {
          onClose();
        }
        return;
      }

      Message.error(response.message || '创建失败');
    } catch (error) {
      if (error) {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={title}
      visible={visible}
      confirmLoading={loading}
      onOk={handleOk}
      onCancel={onClose}
      unmountOnExit
      style={{ width: 560 }}
    >
      {presetSource ? (
        <div className="mb-4 rounded-md bg-[#F8FAFC] px-3 py-2 text-[13px] text-[#475569]">
          源对象类型：{presetSource.name}
          <span className="ml-2 text-[#94A3B8]">
            （{presetSource.code || presetSource.id}）
          </span>
        </div>
      ) : null}
      <Form form={form} layout="vertical">
        <Form.Item
          label="链接方向"
          field="linkDirection"
          rules={[{ required: true, message: '请选择链接方向' }]}
        >
          <Radio.Group>
            <Radio value={LinkDirection.UNIDIRECTIONAL}>单向</Radio>
            <Radio value={LinkDirection.BIDIRECTIONAL}>双向</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="链接名称"
          field="name"
          rules={[
            { required: true, message: '请输入链接名称' },
            { maxLength: 50, message: '名称不能超过50个字符' }
          ]}
        >
          <Input placeholder="如：单位执行行动" maxLength={50} showWordLimit />
        </Form.Item>

        <Form.Item
          label="链接 id"
          field="code"
          extra="根据名称自动生成英文缩写，可修改"
          rules={[
            { required: true, message: '请输入 id' },
            {
              validator: (value, callback) => {
                if (!value) {
                  callback();
                  return;
                }
                if (!/^[a-zA-Z]/.test(value)) {
                  callback('首字符必须为英文字母');
                  return;
                }
                if (!/^[a-zA-Z0-9]+$/.test(value)) {
                  callback('仅允许英文字母与数字');
                  return;
                }
                callback();
              }
            }
          ]}
        >
          <Input placeholder="自动生成" maxLength={50} />
        </Form.Item>

        {!presetSource ? (
          <Form.Item
            label="源对象类型"
            field="sourceObjectTypeID"
            rules={[{ required: true, message: '请选择源对象类型' }]}
          >
            <ObjectTypeSelect
              ontologyModelID={sceneId}
              placeholder="链接起点"
              label=""
              className="mb-0"
            />
          </Form.Item>
        ) : null}

        <Form.Item
          label="目标对象类型"
          field="targetObjectTypeID"
          rules={[{ required: true, message: '请选择目标对象类型' }]}
        >
          <ObjectTypeSelect
            ontologyModelID={sceneId}
            excludeIds={resolvedSourceId ? [resolvedSourceId] : undefined}
            placeholder="链接终点"
            label=""
            className="mb-0"
          />
        </Form.Item>

        <Form.Item label="描述" field="description">
          <Input.TextArea
            placeholder="可选"
            maxLength={200}
            showWordLimit
            autoSize={{ minRows: 2, maxRows: 4 }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
