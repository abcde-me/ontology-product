import React from 'react';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import CheckCircleFillIcon from '@/assets/metadata/check-circle-fill.svg';
import CloseCircleFillIcon from '@/assets/metadata/close-circle-fill.svg';
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

export const getColumns = (
  metadataType: MetadataType | string,
  viewDetailWorkflow: (workflowUuid: string, dsWorkflowId: string) => void
) => {
  const IceDorisColumns = [
    {
      title: '序号',
      dataIndex: 'index',
      width: 60,
      align: 'center',
      render: (_, record, index) => index + 1
    },
    {
      title: '表英文名称',
      dataIndex: 'workflow_name_english',
      width: 280,
      ellipsis: true,
      className: styles['hover-change'] + ' ' + styles['table-name'],
      render: (_, record) => {
        return renderEmptyPlaceholder(record.workflow_name) !== '-' ? (
          <EllipsisPopover
            value={record.workflow_name}
            isEdit={false}
            isLink
            handleLink={() => {
              viewDetailWorkflow(record.workflow_uuid, record.ds_workflow_id);
            }}
          />
        ) : (
          <span>-</span>
        );
      }
    },
    {
      title: '表中文名称',
      dataIndex: 'workflow_name',
      width: 280,
      ellipsis: true,
      className: styles['hover-change'] + ' ' + styles['table-name'],
      render: (_, record) => {
        return renderEmptyPlaceholder(record.workflow_name) !== '-' ? (
          <EllipsisPopover
            value={record.workflow_name}
            isEdit={false}
            isLink
            handleLink={() => {
              viewDetailWorkflow(record.workflow_uuid, record.ds_workflow_id);
            }}
          />
        ) : (
          <span>-</span>
        );
      }
    },
    {
      title: '所属数据库',
      dataIndex: 'source_path',
      width: 120,
      ellipsis: true,
      className: styles['hover-change'],
      render: (_, record) => {
        return renderEmptyPlaceholder(record.source_path) !== '-' ? (
          <EllipsisPopover value={record.source_path} isEdit={false} />
        ) : (
          <span>-</span>
        );
      }
    },
    {
      title: '分区字段',
      dataIndex: 'target_path',
      width: 120,
      ellipsis: true,
      className: styles['hover-change'],
      render: (_, record) => {
        return renderEmptyPlaceholder(record.dataset_name) !== '-' ? (
          <EllipsisPopover value={record.dataset_name} isEdit={false} />
        ) : (
          <span>-</span>
        );
      }
    },
    {
      title: '分区数',
      dataIndex: 'partition_num',
      width: 100,
      ellipsis: true,
      render: (_, record) => (
        <EllipsisPopover
          value={renderEmptyPlaceholder(record.user_name)}
          isEdit={false}
        />
      )
    },
    {
      title: '存储大小（G）',
      dataIndex: 'storage_size',
      width: 150,
      ellipsis: true,
      render: (_, record) => (
        <EllipsisPopover
          value={renderEmptyPlaceholder(record.user_name)}
          isEdit={false}
        />
      )
    },
    {
      title: '文件数',
      dataIndex: 'user_name',
      width: 100,
      ellipsis: true,
      render: (_, record) => (
        <EllipsisPopover
          value={renderEmptyPlaceholder(record.user_name)}
          isEdit={false}
        />
      )
    },
    {
      title: '更新时间',
      dataIndex: 'create_time',
      width: 160,
      render: (_, record) => (
        <span>
          {record.create_time == '' || record.create_time == null
            ? '-'
            : new Date(record.create_time).toLocaleString()}
        </span>
      ),
      sorter: true
    },
    {
      title: '最近访问时间',
      dataIndex: 'update_time',
      width: 160,
      render: (_, record) => (
        <span>
          {record.update_time == '' || record.update_time == null
            ? '-'
            : new Date(record.update_time).toLocaleString()}
        </span>
      ),
      sorter: true
    }
  ];

  const MinIOColumns = [
    {
      title: '序号',
      dataIndex: 'index',
      width: 60,
      align: 'center',
      render: (_, record, index) => index + 1
    },
    {
      title: '桶名称',
      dataIndex: 'bucket_name',
      width: 280,
      ellipsis: true,
      className: styles['hover-change'] + ' ' + styles['table-name'],
      render: (_, record) => {
        return renderEmptyPlaceholder(record.workflow_name) !== '-' ? (
          <EllipsisPopover
            value={record.workflow_name}
            isEdit={false}
            isLink
            handleLink={() => {
              viewDetailWorkflow(record.workflow_uuid, record.ds_workflow_id);
            }}
          />
        ) : (
          <span>-</span>
        );
      }
    },
    {
      title: '对象数',
      dataIndex: 'object_num',
      width: 100,
      className: styles['hover-change'] + ' ' + styles['table-name'],
      render: (_, record) => {
        return renderEmptyPlaceholder(record.workflow_name) !== '-' ? (
          <EllipsisPopover
            value={record.workflow_name}
            isEdit={false}
            isLink
            handleLink={() => {
              viewDetailWorkflow(record.workflow_uuid, record.ds_workflow_id);
            }}
          />
        ) : (
          <span>-</span>
        );
      },
      sorter: true
    },
    {
      title: '存储类型',
      dataIndex: 'storage_type',
      width: 120,
      ellipsis: true,
      className: styles['hover-change'],
      render: (_, record) => {
        return renderEmptyPlaceholder(record.source_path) !== '-' ? (
          <EllipsisPopover value={record.source_path} isEdit={false} />
        ) : (
          <span>-</span>
        );
      }
    },
    {
      title: '所属区域',
      dataIndex: 'region',
      width: 120,
      ellipsis: true,
      className: styles['hover-change'],
      render: (_, record) => {
        return renderEmptyPlaceholder(record.dataset_name) !== '-' ? (
          <EllipsisPopover value={record.dataset_name} isEdit={false} />
        ) : (
          <span>-</span>
        );
      }
    },
    {
      title: '存储大小（G）',
      dataIndex: 'storage_size',
      width: 150,
      ellipsis: true,
      render: (_, record) => (
        <EllipsisPopover
          value={renderEmptyPlaceholder(record.user_name)}
          isEdit={false}
        />
      )
    },
    {
      title: '版本控制',
      dataIndex: 'version_control',
      width: 100,
      ellipsis: true,
      render: (_, record) =>
        record.version_control ? (
          <div className="flex items-center gap-1">
            <CheckCircleFillIcon /> 启用
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <CloseCircleFillIcon /> 关闭
          </div>
        )
    },
    {
      title: '访问策略',
      dataIndex: 'access_policy',
      width: 150,
      ellipsis: true,
      render: (_, record) => (
        <EllipsisPopover
          value={renderEmptyPlaceholder(record.user_name)}
          isEdit={false}
        />
      )
    },
    {
      title: '加密类型',
      dataIndex: 'encryption_type',
      width: 150,
      ellipsis: true,
      render: (_, record) => (
        <EllipsisPopover
          value={renderEmptyPlaceholder(record.user_name)}
          isEdit={false}
        />
      )
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      width: 160,
      render: (_, record) => (
        <span>
          {record.create_time == '' || record.create_time == null
            ? '-'
            : new Date(record.create_time).toLocaleString()}
        </span>
      ),
      sorter: true
    },
    {
      title: '最近访问时间',
      dataIndex: 'update_time',
      width: 160,
      render: (_, record) => (
        <span>
          {record.update_time == '' || record.update_time == null
            ? '-'
            : new Date(record.update_time).toLocaleString()}
        </span>
      ),
      sorter: true
    },
    {
      title: '元数据更新时间',
      dataIndex: 'metadata_update_time',
      width: 160,
      render: (_, record) => (
        <span>
          {record.update_time == '' || record.update_time == null
            ? '-'
            : new Date(record.update_time).toLocaleString()}
        </span>
      ),
      sorter: true
    },
    {
      title: '数据更新时间',
      dataIndex: 'data_update_time',
      width: 160,
      render: (_, record) => (
        <span>
          {record.update_time == '' || record.update_time == null
            ? '-'
            : new Date(record.update_time).toLocaleString()}
        </span>
      ),
      sorter: true
    },
    {
      title: '元数据采集时间',
      dataIndex: 'metadata_collect_time',
      width: 160,
      render: (_, record) => (
        <span>
          {record.update_time == '' || record.update_time == null
            ? '-'
            : new Date(record.update_time).toLocaleString()}
        </span>
      ),
      sorter: true
    }
  ];

  const MilvusColumns = [
    {
      title: '序号',
      dataIndex: 'index',
      width: 60,
      align: 'center',
      render: (_, record, index) => index + 1
    },
    {
      title: '集合英文名称',
      dataIndex: 'collection_name',
      width: 280,
      ellipsis: true,
      className: styles['hover-change'] + ' ' + styles['table-name'],
      render: (_, record) => {
        return renderEmptyPlaceholder(record.workflow_name) !== '-' ? (
          <EllipsisPopover
            value={record.workflow_name}
            isEdit={false}
            isLink
            handleLink={() => {
              viewDetailWorkflow(record.workflow_uuid, record.ds_workflow_id);
            }}
          />
        ) : (
          <span>-</span>
        );
      }
    },
    {
      title: '集合中文名称',
      dataIndex: 'collection_name_zh',
      width: 280,
      ellipsis: true,
      className: styles['hover-change'] + ' ' + styles['table-name'],
      render: (_, record) => {
        return renderEmptyPlaceholder(record.workflow_name) !== '-' ? (
          <EllipsisPopover
            value={record.workflow_name}
            isEdit={false}
            isLink
            handleLink={() => {
              viewDetailWorkflow(record.workflow_uuid, record.ds_workflow_id);
            }}
          />
        ) : (
          <span>-</span>
        );
      },
      sorter: true
    },
    {
      title: '所属数据库',
      dataIndex: 'database_name',
      width: 120,
      ellipsis: true,
      className: styles['hover-change'],
      render: (_, record) => {
        return renderEmptyPlaceholder(record.source_path) !== '-' ? (
          <EllipsisPopover value={record.source_path} isEdit={false} />
        ) : (
          <span>-</span>
        );
      }
    },
    {
      title: '维度',
      dataIndex: 'dimension',
      width: 120,
      ellipsis: true,
      className: styles['hover-change'],
      render: (_, record) => {
        return renderEmptyPlaceholder(record.dataset_name) !== '-' ? (
          <EllipsisPopover value={record.dataset_name} isEdit={false} />
        ) : (
          <span>-</span>
        );
      }
    },
    {
      title: '向量数量',
      dataIndex: 'vector_num',
      width: 150,
      ellipsis: true,
      render: (_, record) => (
        <EllipsisPopover
          value={renderEmptyPlaceholder(record.user_name)}
          isEdit={false}
        />
      )
    },
    {
      title: '度量类型',
      dataIndex: 'metric_type',
      width: 100,
      ellipsis: true,
      render: (_, record) => record.metric_type || '-'
    },
    {
      title: '存储大小（G）',
      dataIndex: 'storage_size',
      width: 150,
      ellipsis: true,
      render: (_, record) => (
        <EllipsisPopover
          value={renderEmptyPlaceholder(record.user_name)}
          isEdit={false}
        />
      )
    },
    {
      title: '分区字段',
      dataIndex: 'partition_field',
      width: 150,
      ellipsis: true,
      render: (_, record) => (
        <EllipsisPopover
          value={renderEmptyPlaceholder(record.user_name)}
          isEdit={false}
        />
      )
    },
    {
      title: '分区数',
      dataIndex: 'partition_num',
      width: 150,
      ellipsis: true,
      render: (_, record) => (
        <EllipsisPopover
          value={renderEmptyPlaceholder(record.user_name)}
          isEdit={false}
        />
      )
    },
    {
      title: '索引数',
      dataIndex: 'index_num',
      width: 150,
      ellipsis: true,
      render: (_, record) => (
        <EllipsisPopover
          value={renderEmptyPlaceholder(record.user_name)}
          isEdit={false}
        />
      )
    },
    {
      title: '元数据更新时间',
      dataIndex: 'metadata_update_time',
      width: 160,
      render: (_, record) => (
        <span>
          {record.update_time == '' || record.update_time == null
            ? '-'
            : new Date(record.update_time).toLocaleString()}
        </span>
      ),
      sorter: true
    },
    {
      title: '数据更新时间',
      dataIndex: 'data_update_time',
      width: 160,
      render: (_, record) => (
        <span>
          {record.update_time == '' || record.update_time == null
            ? '-'
            : new Date(record.update_time).toLocaleString()}
        </span>
      ),
      sorter: true
    },
    {
      title: '元数据采集时间',
      dataIndex: 'metadata_collect_time',
      width: 160,
      render: (_, record) => (
        <span>
          {record.update_time == '' || record.update_time == null
            ? '-'
            : new Date(record.update_time).toLocaleString()}
        </span>
      ),
      sorter: true
    }
  ];

  switch (metadataType) {
    case MetadataType.Iceberg:
      return IceDorisColumns;
    case MetadataType.Doris:
      return IceDorisColumns;
    case MetadataType.MinIO:
      return MinIOColumns;
    case MetadataType.Milvus:
      return MilvusColumns;
    default:
      return [];
  }
};
