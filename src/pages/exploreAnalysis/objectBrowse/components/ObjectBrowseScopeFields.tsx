import React, { useEffect, useMemo, useState } from 'react';
import { Form, Message, Select } from '@arco-design/web-react';
import type { FormInstance } from '@arco-design/web-react/es/Form';
import type { OntologScene } from '@/types/ontologySceneApi';
import {
  getScenesForObjectType,
  getUniqueObjectTypeOptions,
  loadObjectBrowseScopeOptions,
  resolveObjectTypeInScene,
  type ObjectTypeWithScene
} from '../services/objectTypeScope';
import { createSelectFilterByFields } from '../utils/selectFilter';

const Option = Select.Option;

interface ObjectBrowseScopeFieldsProps {
  form: FormInstance<any>;
  loading?: boolean;
  onObjectTypeChange?: (params: {
    sceneId?: number;
    objectTypeId?: number;
  }) => void;
  onSceneChange?: (params: { sceneId?: number; objectTypeId?: number }) => void;
}

export const ObjectBrowseScopeFields: React.FC<
  ObjectBrowseScopeFieldsProps
> = ({ form, loading = false, onObjectTypeChange, onSceneChange }) => {
  const [scenes, setScenes] = useState<OntologScene[]>([]);
  const [allObjectTypes, setAllObjectTypes] = useState<ObjectTypeWithScene[]>(
    []
  );
  const [optionsLoading, setOptionsLoading] = useState(false);
  const objectTypeId = Form.useWatch('objectTypeId', form as any);
  const sceneId = Form.useWatch('sceneId', form as any);

  useEffect(() => {
    const loadOptions = async () => {
      setOptionsLoading(true);
      try {
        const result = await loadObjectBrowseScopeOptions();
        setScenes(result.scenes);
        setAllObjectTypes(result.allObjectTypes);
      } catch (error) {
        console.error('加载对象类型与场景库失败:', error);
        Message.error('加载对象类型与场景库失败');
      } finally {
        setOptionsLoading(false);
      }
    };

    loadOptions();
  }, []);

  const objectTypeOptions = useMemo(() => {
    if (sceneId) {
      const sceneTypes = allObjectTypes.filter(
        (item) => item.sceneId === sceneId
      );
      if (sceneTypes.length) {
        return sceneTypes;
      }
    }
    return getUniqueObjectTypeOptions(allObjectTypes);
  }, [allObjectTypes, sceneId]);

  const filteredScenes = useMemo(
    () => getScenesForObjectType(allObjectTypes, scenes, objectTypeId),
    [allObjectTypes, objectTypeId, scenes]
  );

  const filterObjectTypeOption = useMemo(
    () =>
      createSelectFilterByFields(
        objectTypeOptions,
        (item) => item.id,
        (item) => [item.name, item.code, item.id]
      ),
    [objectTypeOptions]
  );

  const filterSceneOption = useMemo(
    () =>
      createSelectFilterByFields(
        filteredScenes.filter((scene) => scene.id != null),
        (item) => item.id,
        (item) => [item.name, item.id]
      ),
    [filteredScenes]
  );

  const handleObjectTypeChange = (nextObjectTypeId?: number) => {
    const selected = allObjectTypes.find(
      (item) => item.id === nextObjectTypeId
    );
    const currentSceneId = form.getFieldValue('sceneId') as number | undefined;
    let nextSceneId = selected?.sceneId;
    let resolvedObjectTypeId = nextObjectTypeId;

    if (currentSceneId && nextObjectTypeId) {
      const resolvedId = resolveObjectTypeInScene(
        allObjectTypes,
        currentSceneId,
        nextObjectTypeId
      );
      if (resolvedId) {
        resolvedObjectTypeId = resolvedId;
        nextSceneId = currentSceneId;
      }
    }

    if (resolvedObjectTypeId !== nextObjectTypeId) {
      form.setFieldValue('objectTypeId', resolvedObjectTypeId);
    }

    if (nextSceneId) {
      form.setFieldValue('sceneId', nextSceneId);
    } else {
      form.setFieldValue('sceneId', undefined);
    }

    onObjectTypeChange?.({
      sceneId: nextSceneId,
      objectTypeId: resolvedObjectTypeId
    });
  };

  const handleSceneChange = (nextSceneId?: number) => {
    const currentObjectTypeId = form.getFieldValue('objectTypeId') as
      | number
      | undefined;
    const resolvedObjectTypeId = resolveObjectTypeInScene(
      allObjectTypes,
      nextSceneId,
      currentObjectTypeId
    );

    if (resolvedObjectTypeId && resolvedObjectTypeId !== currentObjectTypeId) {
      form.setFieldValue('objectTypeId', resolvedObjectTypeId);
    }

    onSceneChange?.({
      sceneId: nextSceneId,
      objectTypeId: resolvedObjectTypeId ?? currentObjectTypeId
    });
  };

  return (
    <>
      <Form.Item
        label="对象类型"
        field="objectTypeId"
        rules={[{ required: true, message: '请选择对象类型' }]}
      >
        <Select
          allowClear
          showSearch
          placeholder="请选择对象类型"
          loading={optionsLoading || loading}
          filterOption={filterObjectTypeOption}
          onChange={handleObjectTypeChange}
        >
          {objectTypeOptions.map((item) => (
            <Option key={item.id} value={item.id}>
              {item.name || item.code || item.id}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label="本体场景库"
        field="sceneId"
        rules={[{ required: true, message: '请选择本体场景库' }]}
      >
        <Select
          allowClear
          showSearch
          placeholder="请选择本体场景库"
          loading={optionsLoading || loading}
          disabled={!objectTypeId}
          filterOption={filterSceneOption}
          onChange={handleSceneChange}
        >
          {filteredScenes
            .filter((scene) => scene.id != null)
            .map((scene) => (
              <Option key={scene.id} value={scene.id!}>
                {scene.name || '未命名场景'}
              </Option>
            ))}
        </Select>
      </Form.Item>
    </>
  );
};
