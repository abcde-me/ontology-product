import type { Dispatch, SetStateAction } from 'react';
import {
  COLUMN_TYPE_OPTIONS,
  DATA_SOURCE_TYPE
} from '@/pages/ontologyScene/common/constants';
import { UploadStatus } from '@/pages/ontologyScene/types/objectType';
import { cacheDevCsvInstances } from '@/utils/devObjectTypeStore';
import type { ParsedOntologySchemaCsv } from '@/utils/ontologyCsvTemplate';
import { sourceFieldToObjectTypeAttribute } from './attributeFields';
import type {
  ObjectTypeAttributeField,
  ObjectTypeDataSourceState,
  SqlSourceDataInfo
} from './types';

export interface ApplyObjectTypeParsedSchemaParams {
  parsed: ParsedOntologySchemaCsv;
  form: { setFieldValue: (field: string, value: unknown) => void };
  setModelingSourceDataInfo: Dispatch<SetStateAction<SqlSourceDataInfo>>;
  setDataSource: Dispatch<SetStateAction<ObjectTypeDataSourceState>>;
  setObjectTypeAttributes: Dispatch<SetStateAction<ObjectTypeAttributeField[]>>;
  setFileUploaded: Dispatch<SetStateAction<boolean>>;
  setInitialFileList?: Dispatch<SetStateAction<any[]>>;
  /** 展示在上传组件中的文件名 */
  displayFileName?: string;
}

/** 将标准 CSV 解析结果写入建模步骤（与上传 Schema 文件效果一致） */
export const applyObjectTypeParsedSchema = ({
  parsed,
  form,
  setModelingSourceDataInfo,
  setDataSource,
  setObjectTypeAttributes,
  setFileUploaded,
  setInitialFileList,
  displayFileName = 'ai_generated_schema.csv'
}: ApplyObjectTypeParsedSchemaParams) => {
  if (parsed.instances.length) {
    cacheDevCsvInstances(parsed.path, parsed.instances);
  }

  setModelingSourceDataInfo({ queryMode: 'selected' });
  setDataSource((prev) => ({
    ...prev,
    type: DATA_SOURCE_TYPE.LOCAL_CSV,
    file: undefined,
    database: undefined,
    table: undefined,
    filePath: parsed.path,
    queryMode: 'selected'
  }));

  const fields = parsed.columnList.map((column, index) =>
    sourceFieldToObjectTypeAttribute(
      {
        fieldId: column,
        fieldComment: parsed.commentList[index] || column,
        fieldType: parsed.typeList[index] || COLUMN_TYPE_OPTIONS[0].value
      },
      index
    )
  );

  setObjectTypeAttributes(fields);
  form.setFieldValue('objectTypeAttributes', fields);
  form.setFieldValue('dataSourceType', DATA_SOURCE_TYPE.LOCAL_CSV);
  setFileUploaded(true);

  if (setInitialFileList) {
    setInitialFileList([
      {
        uid: `generated-${Date.now()}`,
        name: displayFileName,
        status: UploadStatus.done,
        response: {
          status: 200,
          code: '',
          message: '',
          data: parsed
        }
      }
    ]);
  }
};
