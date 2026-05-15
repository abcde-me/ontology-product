import { Message } from '@arco-design/web-react';
import { COLUMN_TYPE_OPTIONS } from '@/pages/ontologyScene/common/constants';
import { LinkType } from '../../../../../types/link';
import {
  AttributeField,
  IntermediateTable,
  LinkFormData,
  PrimaryAttribute
} from '../types';
import { normalizeFieldTypeForPrimary } from '../utils/linkFormUtils';
import { SyncSourceDataStrategyFormState } from '@/pages/ontologyScene/modules/objectType/components/ObjectTypeFormUtils/types';

interface UseLinkFormSubmitDataParams {
  form: any;
  linkType: LinkType;
  sourceObjectType?: number;
  targetObjectType?: number;
  intermediateTable: IntermediateTable;
  fileUploaded: boolean;
  attributeFields: AttributeField[];
  sourcePrimaryAttribute: PrimaryAttribute | null;
  isReUpload: boolean;
  syncSourceDataStrategy: SyncSourceDataStrategyFormState;
}

export function useLinkFormSubmitData({
  form,
  linkType,
  sourceObjectType,
  targetObjectType,
  intermediateTable,
  fileUploaded,
  attributeFields,
  sourcePrimaryAttribute,
  isReUpload,
  syncSourceDataStrategy
}: UseLinkFormSubmitDataParams) {
  const buildSubmitData = async (): Promise<LinkFormData | undefined> => {
    await form.validate();

    const values = form.getFieldsValue();
    const currentSourceObjectType =
      sourceObjectType ||
      form.getFieldValue('sourceObjectType') ||
      values.sourceObjectType;
    const currentTargetObjectType =
      targetObjectType ||
      form.getFieldValue('targetObjectType') ||
      values.targetObjectType;

    if (!currentSourceObjectType || !currentTargetObjectType) {
      Message.warning('请选择源对象类型和目标对象类型');
      return undefined;
    }

    if (linkType === LinkType.MANY_TO_MANY) {
      if (intermediateTable.type === 'local_csv') {
        if (
          !intermediateTable.filePath &&
          !fileUploaded &&
          attributeFields.length === 0
        ) {
          Message.warning('请上传中间表文件');
          return undefined;
        }
      } else if (intermediateTable.type === 'data_lake_sync') {
        const syncSource = syncSourceDataStrategy.sourceDataInfo;
        const isSqlMode = syncSource.queryMode === 'sql';
        const isPollingMode = syncSourceDataStrategy.mode === 'JDBC_POLLING';

        if (!syncSource.connectorId) {
          Message.warning('请选择数据源链接');
          return undefined;
        }

        if (!isSqlMode && (!syncSource.databaseName || !syncSource.tableName)) {
          Message.warning('请选择数据表');
          return undefined;
        }

        if (isSqlMode && !syncSource.sql?.trim()) {
          Message.warning('请输入自定义SQL');
          return undefined;
        }

        if (
          isPollingMode &&
          (!syncSourceDataStrategy.jdbcPollingIntervalSeconds ||
            !syncSourceDataStrategy.pollFetchSize ||
            !syncSourceDataStrategy.jdbcIncrementalTimeField?.trim() ||
            !syncSourceDataStrategy.jdbcCheckpointField?.trim())
        ) {
          Message.warning('请完整填写轮询参数');
          return undefined;
        }

        if (isPollingMode && isSqlMode) {
          const needFullSql =
            syncSourceDataStrategy.syncScope === 'FULL' ||
            syncSourceDataStrategy.syncScope === 'FULL_THEN_INCREMENTAL';
          const needIncrementSql =
            syncSourceDataStrategy.syncScope === 'INCREMENTAL' ||
            syncSourceDataStrategy.syncScope === 'FULL_THEN_INCREMENTAL';

          if (needFullSql && !syncSourceDataStrategy.jdbcSyncSqlFull?.trim()) {
            Message.warning('请输入全量SQL');
            return undefined;
          }

          if (
            needIncrementSql &&
            !syncSourceDataStrategy.jdbcSyncSqlIncrement?.trim()
          ) {
            Message.warning('请输入增量SQL');
            return undefined;
          }
        }

        if (!syncSourceDataStrategy.conflictStrategy) {
          Message.warning('请选择冲突策略');
          return undefined;
        }

        if (!syncSourceDataStrategy.syncScope) {
          Message.warning('请选择同步范围');
          return undefined;
        }

        if (!syncSourceDataStrategy.exceptionStrategy) {
          Message.warning('请选择异常策略');
          return undefined;
        }
      }

      if (!values.sourceAttribute || !values.targetAttribute) {
        Message.warning('请选择关联中间表的属性');
        return undefined;
      }

      if (attributeFields.length === 0) {
        Message.warning('请先上传中间表');
        return undefined;
      }
    } else if (!values.targetObjectAttribute) {
      Message.warning('请选择目标对象类型属性');
      return undefined;
    }

    const processedAttributeFields =
      linkType === LinkType.MANY_TO_MANY
        ? attributeFields.map((field) => {
            if (intermediateTable.type === 'local_csv') {
              return {
                ...field,
                fieldType: field.fieldType || COLUMN_TYPE_OPTIONS[0].value
              };
            }
            return {
              ...field,
              fieldType: normalizeFieldTypeForPrimary(
                field.fieldType || COLUMN_TYPE_OPTIONS[0].value,
                field.isPrimary
              )
            };
          })
        : [];

    return {
      name: values.name || '',
      id: values.id || '',
      sourceObjectType: currentSourceObjectType,
      targetObjectType: currentTargetObjectType,
      linkType,
      targetObjectAttribute: values.targetObjectAttribute,
      linkTargetColumnName: values.targetObjectAttribute,
      linkSourceColumnName:
        linkType === LinkType.MANY_TO_MANY
          ? undefined
          : sourcePrimaryAttribute?.name,
      sourceAttribute: values.sourceAttribute,
      targetAttribute: values.targetAttribute,
      intermediateTable:
        linkType === LinkType.MANY_TO_MANY ? intermediateTable : undefined,
      attributeFields: processedAttributeFields,
      syncSourceDataStrategy:
        linkType === LinkType.MANY_TO_MANY &&
        intermediateTable.type === 'data_lake_sync'
          ? syncSourceDataStrategy
          : undefined,
      isReUpload:
        linkType === LinkType.MANY_TO_MANY &&
        intermediateTable.type === 'local_csv'
          ? isReUpload
          : false
    };
  };

  return { buildSubmitData };
}
