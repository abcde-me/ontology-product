import type {
  FileExtractType,
  FileExtractTaskStatus
} from '../types/fileExtract';

export const FILE_EXTRACT_TYPE_OPTIONS: {
  value: FileExtractType;
  label: string;
  description: string;
}[] = [
  {
    value: 'entity_relation',
    label: '实体关系提取',
    description: '提取文档中的实体及其关联关系，并生成实体关系图谱'
  },
  {
    value: 'ontology_model',
    label: '本体模型提取',
    description: '提取对象类型、属性与链接，构成本体模型草案'
  },
  {
    value: 'instance',
    label: '实例提取',
    description:
      '选择数据资源库表，按表结构提取实例数据，结果可插入到库表中（主键去重）'
  }
];

export const FILE_EXTRACT_TYPE_LABEL: Record<FileExtractType, string> = {
  entity_relation: '实体关系提取',
  ontology_model: '本体模型提取',
  instance: '实例提取'
};

export const FILE_EXTRACT_TASK_STATUS_LABEL: Record<
  FileExtractTaskStatus,
  string
> = {
  pending: '待提取',
  running: '提取中',
  completed: '已完成',
  failed: '失败'
};

export const FILE_EXTRACT_TASK_LIST_PATH =
  '/tenant/compute/onto/dataConnection/dataResource/extract';

export const FILE_EXTRACT_RESULT_PATH = FILE_EXTRACT_TASK_LIST_PATH;
