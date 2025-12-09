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

const Icebergfields: ColumnField[] = [
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

export const getColumnsSetting = (metadataType: MetadataType | string) => {
  switch (metadataType) {
    case MetadataType.Iceberg:
    case MetadataType.Doris:
      return Icebergfields;
    // case MetadataType.MinIO:
    // case MetadataType.Milvus:
    //   return MinIOMilvusColumns;
    default:
      return Icebergfields;
  }
};

export const getColumns = (
  metadataType: MetadataType | string,
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
      render: (_: any, __: any, idx: number) => (page - 1) * size + idx + 1
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
            return value ?? '-';
          },
          sorter: field.type === 'datetime'
        };
      })
  ];

  return dynamicColumns;
};
