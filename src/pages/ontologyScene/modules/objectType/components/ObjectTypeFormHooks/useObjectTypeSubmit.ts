import { Message } from '@arco-design/web-react';
import { SourceType } from '@/types/objectType';
import {
  DATA_SOURCE_TYPE,
  OBJECT_TYPE_ICON_OPTIONS
} from '@/pages/ontologyScene/common/constants';
import { flattenOntologyPhysicalPropertiesForSubmit } from '../ObjectTypeFormUtils/attributeFields';
import {
  AttributeField,
  ObjectTypeDataSourceState,
  ObjectTypeFormData
} from '../ObjectTypeFormUtils/types';

interface BuildObjectTypeFormDataParams {
  values: any;
  selectedIcon: string;
  initialOntologyModelID?: number;
  dataSource: ObjectTypeDataSourceState;
  attributeFields: AttributeField[];
  isReUpload: boolean;
}

export function buildObjectTypeFormData({
  values,
  selectedIcon,
  initialOntologyModelID,
  dataSource,
  attributeFields,
  isReUpload
}: BuildObjectTypeFormDataParams): ObjectTypeFormData | null {
  if (!dataSource.filePath && dataSource.type === DATA_SOURCE_TYPE.LOCAL_CSV) {
    Message.warning('请上传文件');
    return null;
  }

  if (
    dataSource.type === DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC &&
    (!dataSource.database || !dataSource.table)
  ) {
    Message.warning('请选择数据库和表');
    return null;
  }

  if (attributeFields.length === 0) {
    Message.warning('请先上传文件或选择数据源');
    return null;
  }

  const selectedFields =
    flattenOntologyPhysicalPropertiesForSubmit(attributeFields);

  return {
    code: values.code,
    name: values.name,
    description: values.description,
    icon:
      selectedIcon || values.icon || OBJECT_TYPE_ICON_OPTIONS[0]?.value || '',
    ontologyModelID: values.ontologyModelID || initialOntologyModelID || 0,
    filePath: dataSource.filePath,
    originalDbName:
      dataSource.type === DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC
        ? dataSource.database || ''
        : '',
    originalTableName:
      dataSource.type === DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC
        ? dataSource.table || ''
        : '',
    sourceType:
      dataSource.type === DATA_SOURCE_TYPE.LOCAL_CSV
        ? SourceType.FILE_UPLOAD
        : SourceType.ICEBERG,
    ontologyPhysicalPropertiesList: selectedFields,
    isReUpload:
      dataSource.type === DATA_SOURCE_TYPE.LOCAL_CSV ? isReUpload : false,
    _dataSource: dataSource
  };
}
