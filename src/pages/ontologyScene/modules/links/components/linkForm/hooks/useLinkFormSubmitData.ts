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
  isReUpload
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
        if (!intermediateTable.database || !intermediateTable.table) {
          Message.warning('请选择数据库和表');
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
      isReUpload:
        linkType === LinkType.MANY_TO_MANY &&
        intermediateTable.type === 'local_csv'
          ? isReUpload
          : false
    };
  };

  return { buildSubmitData };
}
