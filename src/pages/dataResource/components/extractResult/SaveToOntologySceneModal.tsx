import React, { useEffect, useState } from 'react';
import { Form, Message, Modal, Select } from '@arco-design/web-react';
import { listOntologyModel } from '@/api/ontologySceneLibrary/ontologyScene';
import { listOntologyObjectType } from '@/api/ontologySceneLibrary/objectType';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import type { OntologScene } from '@/types/ontologySceneApi';
import {
  findDuplicateObjectTypeNames,
  saveOntologyExtractToScene
} from '../../services/saveOntologyExtractToScene';
import type { OntologyModelObjectType } from '../../types/fileExtract';

interface SaveToOntologySceneModalProps {
  visible: boolean;
  objectTypes: OntologyModelObjectType[];
  onClose: () => void;
  onSuccess?: (params: {
    sceneId: number;
    sceneName: string;
    createdCount: number;
  }) => void;
}

export const SaveToOntologySceneModal: React.FC<
  SaveToOntologySceneModalProps
> = ({ visible, objectTypes, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [scenesLoading, setScenesLoading] = useState(false);
  const [scenes, setScenes] = useState<OntologScene[]>([]);
  const [duplicateNames, setDuplicateNames] = useState<string[]>([]);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);

  useEffect(() => {
    if (!visible) {
      return;
    }

    form.resetFields();
    setDuplicateNames([]);

    const loadScenes = async () => {
      setScenesLoading(true);
      try {
        const res = await listOntologyModel({
          pageNo: -1,
          pageSize: -1,
          order: 'desc'
        });

        if (isOntologyApiSuccess(res)) {
          setScenes(res.data?.result || []);
        } else {
          Message.error(res.message || '加载本体场景库失败');
        }
      } catch {
        Message.error('加载本体场景库失败');
      } finally {
        setScenesLoading(false);
      }
    };

    void loadScenes();
  }, [visible, form]);

  const checkDuplicateNames = async (sceneId?: number) => {
    if (!sceneId || !objectTypes.length) {
      setDuplicateNames([]);
      return;
    }

    setCheckingDuplicates(true);
    try {
      const listRes = await listOntologyObjectType({
        ontologyModelID: sceneId,
        pageNo: -1,
        pageSize: -1
      });
      const existingObjectTypes = isOntologyApiSuccess(listRes)
        ? listRes.data?.result || []
        : [];
      setDuplicateNames(
        findDuplicateObjectTypeNames(objectTypes, existingObjectTypes)
      );
    } catch {
      setDuplicateNames([]);
    } finally {
      setCheckingDuplicates(false);
    }
  };

  const handleSubmit = async () => {
    const values = await form.validate();
    const sceneId = Number(values.sceneId);

    if (!sceneId) {
      Message.warning('请选择本体场景库');
      return;
    }

    if (duplicateNames.length) {
      Message.error(
        `以下对象类型名称已存在：${duplicateNames.join('、')}，请修改提取结果后重试`
      );
      return;
    }

    setLoading(true);
    try {
      const result = await saveOntologyExtractToScene({
        ontologyModelID: sceneId,
        objectTypes
      });

      const scene = scenes.find((item) => item.id === sceneId);
      const sceneName = scene?.name || `场景 #${sceneId}`;

      if (result.created.length && !result.failed.length) {
        Message.success(
          `已成功将 ${result.created.length} 个对象类型保存到「${sceneName}」`
        );
        onSuccess?.({
          sceneId,
          sceneName,
          createdCount: result.created.length
        });
        onClose();
        return;
      }

      if (result.created.length && result.failed.length) {
        Message.warning(
          `部分保存成功：${result.created.length} 个成功，${result.failed.length} 个失败`
        );
        onSuccess?.({
          sceneId,
          sceneName,
          createdCount: result.created.length
        });
        onClose();
        return;
      }

      Message.error(result.failed[0]?.message || '保存失败');
    } catch (error) {
      Message.error(error instanceof Error ? error.message : '保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="保存到本体场景库"
      visible={visible}
      confirmLoading={loading}
      onOk={() => void handleSubmit()}
      onCancel={onClose}
      unmountOnExit
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="本体场景库"
          field="sceneId"
          rules={[{ required: true, message: '请选择本体场景库' }]}
          extra={
            duplicateNames.length
              ? `以下对象类型名称已存在：${duplicateNames.join('、')}`
              : `将创建 ${objectTypes.length} 个对象类型（含属性定义与实例数据）`
          }
        >
          <Select
            placeholder="请选择本体场景库"
            loading={scenesLoading || checkingDuplicates}
            onChange={(value) => void checkDuplicateNames(value)}
            options={scenes
              .filter((scene) => scene.id != null)
              .map((scene) => ({
                label: scene.name || `场景 #${scene.id}`,
                value: scene.id!
              }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
