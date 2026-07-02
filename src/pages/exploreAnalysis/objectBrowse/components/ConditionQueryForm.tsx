import React, { useCallback, useEffect, useState } from 'react';
import { Button, Form, Message } from '@arco-design/web-react';
import {
  buildFieldList,
  DEFAULT_CONDITION_PAGE_SIZE,
  fetchQueryableProperties,
  queryInstancesByCondition
} from '../services/conditionQuery';
import { INSTANCE_RESOURCE_NOT_FOUND_MESSAGE } from '../services/instanceQuery';
import { fetchAllObjectTypesWithScene } from '../services/objectTypeScope';
import type {
  ConditionQueryFormValues,
  ConditionSearchContext,
  InstanceQueryResult,
  QueryableProperty
} from '../types';
import { AttributeFilterField } from './AttributeFilterField';
import { ObjectBrowseScopeFields } from './ObjectBrowseScopeFields';
import { resolveObjectTypeCode } from '../utils/objectTypeOptions';
import styles from '../index.module.scss';
import type { ObjectType } from '@/types/objectType';

const defaultFormValues: ConditionQueryFormValues = {
  sceneId: undefined,
  objectTypeId: undefined,
  attributes: {}
};

interface ConditionQueryFormProps {
  loading: boolean;
  onLoadingChange: (loading: boolean) => void;
  onSearchComplete: (
    result: InstanceQueryResult,
    context: ConditionSearchContext
  ) => void;
  onReset?: () => void;
}

export const ConditionQueryForm: React.FC<ConditionQueryFormProps> = ({
  loading,
  onLoadingChange,
  onSearchComplete,
  onReset
}) => {
  const [form] = Form.useForm<ConditionQueryFormValues>();
  const [objectTypes, setObjectTypes] = useState<ObjectType[]>([]);
  const [properties, setProperties] = useState<QueryableProperty[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(false);

  useEffect(() => {
    fetchAllObjectTypesWithScene()
      .then(setObjectTypes)
      .catch((error) => {
        console.error('加载对象类型失败:', error);
      });
  }, []);

  const loadProperties = useCallback(
    async (nextSceneId?: number, nextObjectTypeId?: number) => {
      if (!nextSceneId || !nextObjectTypeId) {
        setProperties([]);
        return;
      }

      setPropertiesLoading(true);
      try {
        const result = await fetchQueryableProperties(
          nextSceneId,
          nextObjectTypeId
        );
        setProperties(result);
      } catch (error) {
        console.error('加载属性失败:', error);
        Message.error('加载属性失败');
        setProperties([]);
      } finally {
        setPropertiesLoading(false);
      }
    },
    []
  );

  const handleScopeChange = (params: {
    sceneId?: number;
    objectTypeId?: number;
  }) => {
    form.setFieldValue('attributes', {});
    loadProperties(params.sceneId, params.objectTypeId);
  };

  const handleReset = () => {
    form.setFieldsValue(defaultFormValues);
    setProperties([]);
    onReset?.();
  };

  const handleSearch = async () => {
    try {
      const values = await form.validate();
      onLoadingChange(true);
      const fieldList = buildFieldList(properties, values.attributes || {});
      const objectTypeId = values.objectTypeId!;
      const result = await queryInstancesByCondition({
        sceneId: values.sceneId!,
        objectTypeId,
        fieldList,
        page: 1,
        pageSize: DEFAULT_CONDITION_PAGE_SIZE
      });
      if (result.resourceNotFound) {
        Message.warning(INSTANCE_RESOURCE_NOT_FOUND_MESSAGE);
      }
      onSearchComplete(result, {
        sceneId: values.sceneId!,
        objectTypeId,
        objectTypeCode: resolveObjectTypeCode(objectTypes, objectTypeId),
        fieldList
      });
    } catch (error) {
      if (!(error as { errorFields?: unknown[] })?.errorFields) {
        console.error('查询实例失败:', error);
        const rawMessage =
          error instanceof Error
            ? error.message?.trim()
            : String(error || '').trim();
        Message.error(rawMessage || '查询实例失败');
      }
    } finally {
      onLoadingChange(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      className={styles['semantic-form']}
      initialValues={defaultFormValues}
    >
      <ObjectBrowseScopeFields
        form={form as any}
        loading={propertiesLoading}
        onObjectTypeChange={handleScopeChange}
        onSceneChange={handleScopeChange}
      />

      {properties.length > 0 && (
        <>
          <div className={styles['attribute-divider']} />
          {properties.map((property) => (
            <AttributeFilterField
              key={property.fieldName}
              property={property}
            />
          ))}
        </>
      )}

      <div className={styles['semantic-form-actions']}>
        <Button type="primary" loading={loading} onClick={handleSearch}>
          查询实例
        </Button>
        <Button type="secondary" onClick={handleReset}>
          重置
        </Button>
      </div>
    </Form>
  );
};
