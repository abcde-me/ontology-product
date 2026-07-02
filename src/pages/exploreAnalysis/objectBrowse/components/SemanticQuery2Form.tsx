import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Message,
  Select,
  Tooltip
} from '@arco-design/web-react';
import { IconQuestionCircle } from '@arco-design/web-react/icon';
import type { ObjectType } from '@/types/objectType';
import {
  fetchVectorFieldOptions,
  searchByVectorField
} from '../services/semanticQuery2';
import { fetchAllObjectTypesWithScene } from '../services/objectTypeScope';
import { resolveObjectTypeCode } from '../utils/objectTypeOptions';
import { ALL_VECTOR_FIELDS_LABEL, ALL_VECTOR_FIELDS_VALUE } from '../constants';
import type {
  ObjectBrowseSelectionContext,
  SemanticQuery2FormValues,
  VectorFieldOption,
  VectorSearchRow
} from '../types';
import { ObjectBrowseScopeFields } from './ObjectBrowseScopeFields';
import { filterSelectByLabel } from '../utils/selectFilter';
import styles from '../index.module.scss';

const Option = Select.Option;
const TextArea = Input.TextArea;

const defaultFormValues: SemanticQuery2FormValues = {
  sceneId: undefined,
  objectTypeId: undefined,
  vectorFieldName: undefined,
  queryText: '',
  topK: 3,
  scoreThreshold: 0.35
};

interface SemanticQuery2FormProps {
  loading: boolean;
  onLoadingChange: (loading: boolean) => void;
  onSearchComplete: (
    rows: VectorSearchRow[],
    context: ObjectBrowseSelectionContext
  ) => void;
  onReset?: () => void;
}

export const SemanticQuery2Form: React.FC<SemanticQuery2FormProps> = ({
  loading,
  onLoadingChange,
  onSearchComplete,
  onReset
}) => {
  const [form] = Form.useForm<SemanticQuery2FormValues>();
  const objectTypeId = Form.useWatch('objectTypeId', form as any);
  const [objectTypes, setObjectTypes] = useState<ObjectType[]>([]);
  const [vectorFields, setVectorFields] = useState<VectorFieldOption[]>([]);
  const [vectorFieldsLoading, setVectorFieldsLoading] = useState(false);

  useEffect(() => {
    fetchAllObjectTypesWithScene()
      .then(setObjectTypes)
      .catch((error) => {
        console.error('加载对象类型失败:', error);
        Message.error('加载对象类型失败');
      });
  }, []);

  const loadVectorFields = useCallback(
    async (nextSceneId?: number, nextObjectTypeId?: number) => {
      if (!nextSceneId || !nextObjectTypeId) {
        setVectorFields([]);
        return;
      }

      setVectorFieldsLoading(true);
      try {
        const result = await fetchVectorFieldOptions(
          nextSceneId,
          nextObjectTypeId
        );
        setVectorFields(result);
      } catch (error) {
        console.error('加载向量字段失败:', error);
        Message.error('加载向量字段失败');
        setVectorFields([]);
      } finally {
        setVectorFieldsLoading(false);
      }
    },
    []
  );

  const handleScopeChange = (params: {
    sceneId?: number;
    objectTypeId?: number;
  }) => {
    form.setFieldValue('vectorFieldName', undefined);
    loadVectorFields(params.sceneId, params.objectTypeId);
  };

  const handleReset = () => {
    form.setFieldsValue(defaultFormValues);
    setVectorFields([]);
    onReset?.();
  };

  const handleSearch = async () => {
    try {
      const values = await form.validate();
      onLoadingChange(true);
      const result = await searchByVectorField({
        ontologyModelID: values.sceneId!,
        objectTypeId: values.objectTypeId!,
        vectorFieldName: values.vectorFieldName!,
        query: values.queryText?.trim() || '',
        topK: values.topK,
        scoreThreshold: values.scoreThreshold
      });
      onSearchComplete(result.items, {
        sceneId: values.sceneId!,
        objectTypeId: values.objectTypeId!,
        objectTypeCode: resolveObjectTypeCode(objectTypes, values.objectTypeId)
      });
    } catch (error) {
      console.error('相似性检索失败:', error);
      if ((error as { errorFields?: unknown[] })?.errorFields) {
        return;
      }

      const rawMessage = error instanceof Error ? error.message?.trim() : '';
      const isHttpError =
        !!rawMessage &&
        (/status code \d{3}/i.test(rawMessage) ||
          rawMessage.includes('Network Error'));
      Message.error(
        isHttpError
          ? '相似性检索接口暂不可用，请确认后端已部署'
          : rawMessage || '相似性检索失败'
      );
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
        loading={vectorFieldsLoading}
        onObjectTypeChange={handleScopeChange}
        onSceneChange={handleScopeChange}
      />

      <Form.Item
        label="向量字段名称"
        field="vectorFieldName"
        rules={[{ required: true, message: '请选择向量字段' }]}
      >
        <Select
          allowClear
          showSearch
          placeholder="请选择向量字段"
          loading={vectorFieldsLoading}
          disabled={!objectTypeId}
          filterOption={filterSelectByLabel}
        >
          {vectorFields.length > 0 && (
            <Option
              key={ALL_VECTOR_FIELDS_VALUE}
              value={ALL_VECTOR_FIELDS_VALUE}
            >
              {ALL_VECTOR_FIELDS_LABEL}
            </Option>
          )}
          {vectorFields.map((item) => (
            <Option key={item.value} value={item.value}>
              {item.label}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label="相似性查询输入"
        field="queryText"
        rules={[{ required: true, message: '请输入检索文本' }]}
      >
        <TextArea
          placeholder="输入待检索的文本；选择「全部」时将在所有向量字段上匹配并取最高相似度结果..."
          autoSize={{ minRows: 4, maxRows: 6 }}
        />
      </Form.Item>

      <Form.Item
        label={
          <span className={styles['label-with-tip']}>
            召回 topK
            <Tooltip content="召回的内容条数，数值越高展示条数越多">
              <IconQuestionCircle className={styles['label-tip-icon']} />
            </Tooltip>
          </span>
        }
        field="topK"
        rules={[
          { required: true, message: '召回 topK 不能为空' },
          {
            validator: (value, callback) => {
              if (value == null || value === '') {
                callback('召回 topK 不能为空');
                return;
              }
              if (Number(value) <= 0) {
                callback('召回 topK 必须大于 0');
              }
            }
          }
        ]}
      >
        <InputNumber min={1} precision={0} placeholder="3" />
      </Form.Item>

      <Form.Item
        label={
          <span className={styles['label-with-tip']}>
            分数过滤阈值
            <Tooltip content="相似度判定标准，展示分值达标的内容，数值越高匹配精度越高">
              <IconQuestionCircle className={styles['label-tip-icon']} />
            </Tooltip>
          </span>
        }
        field="scoreThreshold"
        rules={[
          { required: true, message: '分数过滤阈值不能为空' },
          {
            validator: (value, callback) => {
              if (value == null || value === '') {
                callback('分数过滤阈值不能为空');
                return;
              }
              const num = Number(value);
              if (Number.isNaN(num) || num < 0 || num > 1) {
                callback('分数过滤阈值取值范围为 0-1');
              }
            }
          }
        ]}
      >
        <InputNumber min={0} max={1} step={0.01} placeholder="0.35" />
      </Form.Item>

      <div className={styles['semantic-form-actions']}>
        <Button type="primary" loading={loading} onClick={handleSearch}>
          相似性检索
        </Button>
        <Button type="secondary" onClick={handleReset}>
          重置
        </Button>
      </div>
    </Form>
  );
};
