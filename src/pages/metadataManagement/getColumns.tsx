import React from 'react';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import CheckCircleFillIcon from '@/assets/metadata/check-circle-fill.svg';
import CloseCircleFillIcon from '@/assets/metadata/close-circle-fill.svg';
import { ColumnField } from '../dataAsset/components/ColumnSettingModal';
import dayjs from 'dayjs';
import styles from './index.module.scss';

enum MetadataType {
  Iceberg = 'Iceberg',
  Doris = 'Doris',
  MinIO = 'MinIO',
  Milvus = 'Milvus'
}

// table数据为空时展示-
const renderEmptyPlaceholder = (value: string | null) => {
  return value === '' || value == null ? '-' : value;
};

const IcebergFields: ColumnField[] = [
  {
    id: 'tableName',
    nameEn: 'tableName',
    nameZh: '表英文名',
    type: 'string',
    isEnumAbleForColumn: true,
    isEnumAble: false,
    enumLoading: false,
    distinctCount: 0,
    displaySort: 1,
    values: []
  },
  {
    id: 'description',
    nameEn: 'description',
    nameZh: '表中文名',
    type: 'string',
    isEnumAbleForColumn: true,
    isEnumAble: false,
    enumLoading: false,
    distinctCount: 0,
    displaySort: 2,
    values: []
  },
  {
    id: 'databaseName',
    nameEn: 'databaseName',
    nameZh: '所属数据库',
    type: 'string',
    isEnumAbleForColumn: true,
    isEnumAble: false,
    enumLoading: false,
    distinctCount: 0,
    displaySort: 3,
    values: []
  },
  {
    id: 'partitionKey',
    nameEn: 'partitionKey',
    nameZh: '分区字段',
    type: 'string',
    isEnumAbleForColumn: true,
    isEnumAble: false,
    enumLoading: false,
    distinctCount: 0,
    displaySort: 4,
    values: []
  },
  {
    id: 'partitionNum',
    nameEn: 'partitionNum',
    nameZh: '分区数',
    type: 'int',
    isEnumAbleForColumn: true,
    isEnumAble: false,
    enumLoading: false,
    distinctCount: 0,
    displaySort: 5,
    values: []
  },
  {
    id: 'storageSize',
    nameEn: 'storageSize',
    nameZh: '存储大小（G）',
    type: 'double',
    isEnumAbleForColumn: true,
    isEnumAble: false,
    enumLoading: false,
    distinctCount: 0,
    displaySort: 6,
    values: []
  },
  {
    id: 'fileNum',
    nameEn: 'fileNum',
    nameZh: '文件数',
    type: 'int',
    isEnumAbleForColumn: true,
    isEnumAble: false,
    enumLoading: false,
    distinctCount: 0,
    displaySort: 7,
    values: []
  },
  {
    id: 'updataTime',
    nameEn: 'updataTime',
    nameZh: '更新时间',
    type: 'datetime',
    isEnumAbleForColumn: true,
    isEnumAble: false,
    enumLoading: false,
    distinctCount: 0,
    displaySort: 8,
    values: []
  },
  {
    id: 'lastTime',
    nameEn: 'lastTime',
    nameZh: '最后访问时间',
    type: 'datetime',
    isEnumAbleForColumn: true,
    isEnumAble: false,
    enumLoading: false,
    distinctCount: 0,
    displaySort: 9,
    values: []
  }
];

const MinIOFields = [
  {
    id: 'bucketName',
    nameEn: 'bucketName',
    nameZh: '桶名称',
    type: 'string',
    isEnumAbleForColumn: true,
    isEnumAble: false,
    enumLoading: false,
    distinctCount: 0,
    displaySort: 1,
    values: []
  },
  {
    id: 'objectNum',
    nameEn: 'objectNum',
    nameZh: '对象数',
    type: 'double',
    isEnumAbleForColumn: true,
    isEnumAble: false,
    enumLoading: false,
    distinctCount: 0,
    displaySort: 2,
    values: []
  },
  {
    id: 'storageType',
    nameEn: 'storageType',
    nameZh: '存储类型',
    type: 'string',
    isEnumAbleForColumn: true,
    isEnumAble: false,
    enumLoading: false,
    distinctCount: 0,
    displaySort: 3,
    values: []
  },
  {
    id: 'partitionKey',
    nameEn: 'partitionKey',
    nameZh: '分区字段',
    type: 'string',
    isEnumAbleForColumn: true,
    isEnumAble: false,
    enumLoading: false,
    distinctCount: 0,
    displaySort: 4,
    values: []
  },
  {
    id: 'region',
    nameEn: 'region',
    nameZh: '所属区域',
    type: 'string',
    isEnumAbleForColumn: true,
    isEnumAble: false,
    enumLoading: false,
    distinctCount: 0,
    displaySort: 5,
    values: []
  },
  {
    id: 'storageSize',
    nameEn: 'storageSize',
    nameZh: '存储大小（G）',
    type: 'double',
    isEnumAbleForColumn: true,
    isEnumAble: false,
    enumLoading: false,
    distinctCount: 0,
    displaySort: 6,
    values: []
  },
  {
    id: 'versioning',
    nameEn: 'versioning',
    nameZh: '版本控制',
    type: 'boolean',
    isEnumAbleForColumn: true,
    isEnumAble: false,
    enumLoading: false,
    distinctCount: 0,
    displaySort: 7,
    values: []
  },
  {
    id: 'policy',
    nameEn: 'policy',
    nameZh: '策略',
    type: 'string',
    isEnumAbleForColumn: true,
    isEnumAble: false,
    enumLoading: false,
    distinctCount: 0,
    displaySort: 7,
    values: []
  },
  {
    id: 'encryptType',
    nameEn: 'encryptType',
    nameZh: '加密类型',
    type: 'boolean',
    isEnumAbleForColumn: true,
    isEnumAble: false,
    enumLoading: false,
    distinctCount: 0,
    displaySort: 7,
    values: []
  },
  {
    id: 'createTime',
    nameEn: 'createTime',
    nameZh: '创建时间',
    type: 'datetime',
    isEnumAbleForColumn: true,
    isEnumAble: false,
    enumLoading: false,
    distinctCount: 0,
    displaySort: 8,
    values: []
  },
  {
    id: 'lastTime',
    nameEn: 'lastTime',
    nameZh: '最新访问时间',
    type: 'datetime',
    isEnumAbleForColumn: true,
    isEnumAble: false,
    enumLoading: false,
    distinctCount: 0,
    displaySort: 9,
    values: []
  },
  {
    id: 'updataTime',
    nameEn: 'updataTime',
    nameZh: '元数据更新时间',
    type: 'datetime',
    isEnumAbleForColumn: true,
    isEnumAble: false,
    enumLoading: false,
    distinctCount: 0,
    displaySort: 8,
    values: []
  }
];

const MilvusFields = [
  {
    id: 'collectionName',
    nameEn: 'collectionName',
    nameZh: '集合英文名称',
    type: 'string',
    isEnumAbleForColumn: true,
    isEnumAble: false,
    enumLoading: false,
    distinctCount: 0,
    displaySort: 1,
    values: []
  },
  {
    id: 'description',
    nameEn: 'description',
    nameZh: '集合中文名称',
    type: 'string',
    isEnumAbleForColumn: true,
    isEnumAble: false,
    enumLoading: false,
    distinctCount: 0,
    displaySort: 2,
    values: []
  },
  {
    id: 'dbName',
    nameEn: 'dbName',
    nameZh: '所属数据库',
    type: 'string',
    isEnumAbleForColumn: true,
    isEnumAble: false,
    enumLoading: false,
    distinctCount: 0,
    displaySort: 3,
    values: []
  },
  {
    id: 'approxEntityCount',
    nameEn: 'approxEntityCount',
    nameZh: '实体数量',
    type: 'string',
    isEnumAbleForColumn: true,
    isEnumAble: false,
    enumLoading: false,
    distinctCount: 0,
    displaySort: 4,
    values: []
  },
  {
    id: 'status',
    nameEn: 'status',
    nameZh: '状态',
    type: 'string',
    isEnumAbleForColumn: true,
    isEnumAble: false,
    enumLoading: false,
    distinctCount: 0,
    displaySort: 5,
    values: []
  },
  {
    id: 'partitions',
    nameEn: 'partitions',
    nameZh: '分区数量',
    type: 'int',
    isEnumAbleForColumn: true,
    isEnumAble: false,
    enumLoading: false,
    distinctCount: 0,
    displaySort: 6,
    values: []
  },
  {
    id: 'aliasList',
    nameEn: 'aliasList',
    nameZh: '别名',
    type: 'string',
    isEnumAbleForColumn: true,
    isEnumAble: false,
    enumLoading: false,
    distinctCount: 0,
    displaySort: 7,
    values: []
  },
  {
    id: 'shards',
    nameEn: 'shards',
    nameZh: '分片数量',
    type: 'int',
    isEnumAbleForColumn: true,
    isEnumAble: false,
    enumLoading: false,
    distinctCount: 0,
    displaySort: 7,
    values: []
  },
  {
    id: 'consistencyLevel',
    nameEn: 'consistencyLevel',
    nameZh: '一致性级别',
    type: 'string',
    isEnumAbleForColumn: true,
    isEnumAble: false,
    enumLoading: false,
    distinctCount: 0,
    displaySort: 7,
    values: []
  },
  {
    id: 'createTime',
    nameEn: 'createTime',
    nameZh: '创建时间',
    type: 'datetime',
    isEnumAbleForColumn: true,
    isEnumAble: false,
    enumLoading: false,
    distinctCount: 0,
    displaySort: 8,
    values: []
  },
  {
    id: 'lastTime',
    nameEn: 'lastTime',
    nameZh: '最近访问时间',
    type: 'datetime',
    isEnumAbleForColumn: true,
    isEnumAble: false,
    enumLoading: false,
    distinctCount: 0,
    displaySort: 9,
    values: []
  },
  {
    id: 'updataTime',
    nameEn: 'updataTime',
    nameZh: '元数据更新时间',
    type: 'datetime',
    isEnumAbleForColumn: true,
    isEnumAble: false,
    enumLoading: false,
    distinctCount: 0,
    displaySort: 8,
    values: []
  }
];

export const getColumnsSetting = (metadataType: MetadataType | string) => {
  switch (metadataType) {
    case MetadataType.Iceberg:
    case MetadataType.Doris:
      return IcebergFields;
    case MetadataType.MinIO:
      return MinIOFields;
    case MetadataType.Milvus:
      return MilvusFields;
    default:
      return [];
  }
};

export const getColumns = (
  metadataSelectedFields: ColumnField[],
  viewDetailWorkflow: (workflowUuid: string, dsWorkflowId: string) => void,
  page: number,
  size: number
) => {
  const dynamicColumns = [
    {
      title: '序号',
      dataIndex: 'index',
      fixed: 'left' as const,
      width: 80,
      key: 'index',
      className: styles['hover-change'] + ' ' + styles['table-name'],
      render: (_, record, idx: number) => (
        <EllipsisPopover
          value={(page - 1) * size + idx + 1}
          isEdit={false}
          isLink
          handleLink={() => {
            viewDetailWorkflow(record.workflow_uuid, record.ds_workflow_id);
          }}
        />
      )
    },
    // 根据 fields 生成列，保证每一列和表头一一对应
    ...(metadataSelectedFields || [])
      .filter((field) => field.displaySort > 0)
      .map((field) => {
        // 其他字段使用默认渲染
        return {
          title: field.nameZh,
          dataIndex: field.nameEn,
          key: field.nameEn,
          width: 150,
          ellipsis: true,
          render: (value: any) => {
            if (field.type.includes('date')) {
              return value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-';
            }
            if (field.id === 'versioning') {
              return value ? (
                <div className="flex items-center gap-1">
                  <CheckCircleFillIcon /> 启用
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <CloseCircleFillIcon /> 关闭
                </div>
              );
            }
            return value ?? '-';
          },
          sorter: field.type === 'datetime'
        };
      })
  ];

  return dynamicColumns;
};
