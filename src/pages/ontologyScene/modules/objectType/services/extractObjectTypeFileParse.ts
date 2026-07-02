import {
  getFileResourceById,
  getFileResourceExtractSource
} from '@/pages/dataResource/services/fileApi';
import { extractFileResourceWithLlm } from '@/pages/dataResource/services/fileResourceExtract';
import { objectTypeAttributesToInstanceExtractTarget } from '@/pages/dataResource/services/instanceExtractTarget';
import type { InstanceExtractResult } from '@/pages/dataResource/types/fileExtract';
import type { ObjectTypeAttributeField } from '../components/ObjectTypeFormUtils/types';

export const DEFAULT_OBJECT_TYPE_FILE_PARSE_REQUIREMENT =
  '按照对象类型属性提取';

export const buildFileParseRunKey = (params: {
  fileResourceId?: string;
  requirement?: string;
  objectTypeAttributes: ObjectTypeAttributeField[];
}): string => {
  const requirement =
    params.requirement?.trim() || DEFAULT_OBJECT_TYPE_FILE_PARSE_REQUIREMENT;
  const attributeKeys = params.objectTypeAttributes
    .map((attribute) => attribute.propertyID)
    .join(',');

  return `${params.fileResourceId || ''}::${requirement}::${attributeKeys}`;
};

export const extractObjectTypeFileParse = async (params: {
  fileResourceId: string;
  objectTypeAttributes: ObjectTypeAttributeField[];
  objectTypeName?: string;
  requirement?: string;
  signal?: AbortSignal;
}): Promise<InstanceExtractResult> => {
  const file = getFileResourceById(params.fileResourceId);
  if (!file) {
    throw new Error('文件不存在或已被删除');
  }

  if (!params.objectTypeAttributes.length) {
    throw new Error('请先在属性信息步骤配置对象类型属性');
  }

  const requirement =
    params.requirement?.trim() || DEFAULT_OBJECT_TYPE_FILE_PARSE_REQUIREMENT;
  const source = await getFileResourceExtractSource(file);
  const targetSchema = objectTypeAttributesToInstanceExtractTarget(
    params.objectTypeAttributes,
    params.objectTypeName
  );

  const result = await extractFileResourceWithLlm({
    extractType: 'instance',
    source,
    requirement,
    targetSchema,
    signal: params.signal
  });

  return result as InstanceExtractResult;
};
