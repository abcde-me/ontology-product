import React, { useEffect, useState } from 'react';
import {
  Form,
  InputNumber,
  Message,
  Popover,
  Radio
} from '@arco-design/web-react';
import { IconQuestionCircle } from '@arco-design/web-react/icon';
import {
  getSqlConnectorTableSchemaToTIDB,
  mapOntologyObjectTypeColumns
} from '@/api/ontologySceneLibrary/objectType';
import {
  InstanceSyncMappingField,
  ObjectTypeAttributeField,
  SourceTableField,
  SqlSourceDataInfo,
  SyncSourceDataStrategyFormState
} from '../../ObjectTypeFormUtils/types';
import { objectTypeAttributeToSyncMapping } from '../../ObjectTypeFormUtils/attributeFields';
import SqlSourceSelector from '../common/SqlSourceSelector';
import InstanceSyncMappingTable from './InstanceSyncMappingTable';

const FormItem = Form.Item;

interface InstanceSyncStepProps {
  form: any;
  objectTypeAttributes: ObjectTypeAttributeField[];
  syncSourceDataStrategy: SyncSourceDataStrategyFormState;
  setSyncSourceDataStrategy: React.Dispatch<
    React.SetStateAction<SyncSourceDataStrategyFormState>
  >;
  syncMappingFields: InstanceSyncMappingField[];
  setSyncMappingFields: React.Dispatch<
    React.SetStateAction<InstanceSyncMappingField[]>
  >;
  fieldsLoading: boolean;
  setFieldsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  styles: Record<string, string>;
}

function isSuccessResponse(response: any): boolean {
  return (
    response &&
    (response.status === 200 || response.status === 0) &&
    (response.code === '' || response.code === 0 || response.code === undefined)
  );
}

export default function InstanceSyncStep({
  form,
  objectTypeAttributes,
  syncSourceDataStrategy,
  setSyncSourceDataStrategy,
  syncMappingFields,
  setSyncMappingFields,
  fieldsLoading,
  setFieldsLoading,
  styles
}: InstanceSyncStepProps) {
  const [sourceFields, setSourceFields] = useState<SourceTableField[]>([]);

  useEffect(() => {
    setSyncMappingFields((prev) => {
      const existingByPropertyID = new Map(
        prev.map((field) => [field.propertyID, field])
      );
      const nextFields = objectTypeAttributes.map((attribute) => ({
        ...objectTypeAttributeToSyncMapping(attribute),
        ...existingByPropertyID.get(attribute.propertyID),
        propertyID: attribute.propertyID,
        propertyComment: attribute.propertyComment,
        propertyType: attribute.propertyType,
        isPrimary: attribute.isPrimary
      }));
      form.setFieldValue('syncMappingFields', nextFields);
      return nextFields;
    });
  }, [objectTypeAttributes, form, setSyncMappingFields]);

  const updateStrategy = (
    updates: Partial<SyncSourceDataStrategyFormState>
  ) => {
    setSyncSourceDataStrategy((prev) => ({
      ...prev,
      ...updates
    }));
  };

  const handleSourceChange = (sourceDataInfo: SqlSourceDataInfo) => {
    setSyncSourceDataStrategy((prev) => ({
      ...prev,
      sourceDataInfo
    }));
    if (sourceDataInfo.queryMode === 'sql') {
      setSourceFields([]);
      setSyncMappingFields(
        objectTypeAttributes.map(objectTypeAttributeToSyncMapping)
      );
    }
  };

  const applyAutoMapping = async (fields: SourceTableField[]) => {
    if (!objectTypeAttributes.length || !fields.length) {
      return;
    }

    try {
      const response = await mapOntologyObjectTypeColumns({
        objectTypeColumns: objectTypeAttributes.map(
          (field) => field.propertyID
        ),
        sourceTableColumns: fields.map((field) => field.fieldId)
      });
      const relationList = isSuccessResponse(response)
        ? response.data?.mapRelations || []
        : [];
      const relationMap = new Map(
        relationList.map((relation) => [
          relation.objectTypeColumnName,
          relation.sourceTableColumnName
        ])
      );
      const sourceFieldMap = new Map(
        fields.map((field) => [field.fieldId, field])
      );
      const nextFields = objectTypeAttributes.map((attribute) => {
        const sourceColumnName = relationMap.get(attribute.propertyID);
        const sourceField = sourceColumnName
          ? sourceFieldMap.get(sourceColumnName)
          : undefined;
        return {
          ...objectTypeAttributeToSyncMapping(attribute),
          sourceColumnName,
          sourceColumnComment: sourceField?.fieldComment,
          sourceColumnType: sourceField?.fieldType
        };
      });
      setSyncMappingFields(nextFields);
      form.setFieldValue('syncMappingFields', nextFields);
    } catch (error) {
      console.error('字段自动映射失败:', error);
      Message.warning('字段自动映射失败，请手动选择表字段');
    }
  };

  const loadTableSchema = async ({
    connectorId,
    databaseName,
    tableName
  }: Required<
    Pick<SqlSourceDataInfo, 'connectorId' | 'databaseName' | 'tableName'>
  >) => {
    setFieldsLoading(true);
    try {
      const response = await getSqlConnectorTableSchemaToTIDB({
        id: connectorId,
        database_name: databaseName,
        table_name: tableName
      });
      if (isSuccessResponse(response)) {
        const fields: SourceTableField[] = (response.data || []).map(
          (field) => ({
            fieldId: field.field_id,
            fieldComment: field.field_comment,
            fieldType: field.field_type
          })
        );
        setSourceFields(fields);
        await applyAutoMapping(fields);
      } else {
        Message.error(response.message || '加载同步源表字段失败');
        setSourceFields([]);
      }
    } catch (error) {
      console.error('加载同步源表字段失败:', error);
      Message.error('加载同步源表字段失败');
      setSourceFields([]);
    } finally {
      setFieldsLoading(false);
    }
  };

  return (
    <>
      <div className="my-[16px] text-[16px] font-[500] leading-[24px] text-[var(--color-text-1)]">
        数据源
      </div>
      <SqlSourceSelector
        form={form}
        value={syncSourceDataStrategy.sourceDataInfo}
        onChange={handleSourceChange}
        onTableSelected={loadTableSchema}
        fieldPrefix="sync"
        styles={styles}
      />

      <div className="my-[16px] text-[16px] font-[500] leading-[24px] text-[var(--color-text-1)]">
        同步策略
      </div>
      <FormItem
        label={
          <span className="inline-flex items-center gap-[4px]">
            同步模式
            <Popover content="选择实例数据同步的触发方式">
              <IconQuestionCircle className="cursor-pointer text-[#86909C]" />
            </Popover>
          </span>
        }
        field="syncMode"
        rules={[{ required: true, message: '请选择同步模式' }]}
      >
        <Radio.Group
          value={syncSourceDataStrategy.mode}
          onChange={(mode) => updateStrategy({ mode })}
        >
          <Radio value="BINLOG_CDC">CDC</Radio>
          <Radio value="JDBC_POLLING">轮询</Radio>
        </Radio.Group>
      </FormItem>

      <FormItem
        label="冲突策略"
        field="conflictStrategy"
        rules={[{ required: true, message: '请选择冲突策略' }]}
      >
        <Radio.Group
          value={syncSourceDataStrategy.conflictStrategy}
          onChange={(conflictStrategy) => updateStrategy({ conflictStrategy })}
        >
          <Radio value="KEEP_SOURCE">保留数据源</Radio>
          <Radio value="KEEP_TARGET">保留目标表</Radio>
        </Radio.Group>
      </FormItem>

      <FormItem
        label="同步范围"
        field="syncScope"
        rules={[{ required: true, message: '请选择同步范围' }]}
      >
        <Radio.Group
          value={syncSourceDataStrategy.syncScope}
          onChange={(syncScope) => updateStrategy({ syncScope })}
        >
          <Radio value="INCREMENTAL">增量</Radio>
          <Radio value="FULL">全量</Radio>
          <Radio value="FULL_THEN_INCREMENTAL">增量+全量</Radio>
        </Radio.Group>
      </FormItem>

      <FormItem
        label={
          <span className="inline-flex items-center gap-[4px]">
            批次同步数
            <Popover content="每批次同步的实例数量">
              <IconQuestionCircle className="cursor-pointer text-[#86909C]" />
            </Popover>
          </span>
        }
        field="pollFetchSize"
        rules={[{ required: true, message: '请输入批次同步数' }]}
      >
        <InputNumber
          min={1}
          step={1}
          value={syncSourceDataStrategy.pollFetchSize}
          onChange={(pollFetchSize) =>
            updateStrategy({ pollFetchSize: Number(pollFetchSize) || 1 })
          }
        />
      </FormItem>

      <FormItem label="并行数" field="parallelism">
        <InputNumber
          min={1}
          step={1}
          value={syncSourceDataStrategy.parallelism}
          onChange={(parallelism) =>
            updateStrategy({ parallelism: Number(parallelism) || 1 })
          }
        />
      </FormItem>

      <FormItem
        label={
          <span className="inline-flex items-center gap-[4px]">
            异常策略
            <Popover content="同步出现异常时的处理方式">
              <IconQuestionCircle className="cursor-pointer text-[#86909C]" />
            </Popover>
          </span>
        }
        field="exceptionStrategy"
        rules={[{ required: true, message: '请选择异常策略' }]}
      >
        <Radio.Group
          value={syncSourceDataStrategy.exceptionStrategy}
          onChange={(exceptionStrategy) =>
            updateStrategy({ exceptionStrategy })
          }
        >
          <Radio value="STOP_ON_ERROR">立即停止</Radio>
          <Radio value="LOG_ERROR_AND_CONTINUE">继续消费</Radio>
        </Radio.Group>
      </FormItem>

      <InstanceSyncMappingTable
        form={form}
        mappingFields={syncMappingFields}
        setMappingFields={setSyncMappingFields}
        sourceFields={sourceFields}
        loading={fieldsLoading}
        styles={styles}
      />
    </>
  );
}
