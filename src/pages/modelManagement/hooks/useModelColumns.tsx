import React, { useMemo } from 'react';
import { Button, Space, Tag, Tooltip } from '@arco-design/web-react';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import { PermissionWrapper } from '@/components/PermissionGuard/PermissionWrapper';
import { MODEL_MANAGEMENT_PERMISSIONS } from '@/config/permissions';
import dayjs from 'dayjs';
import type { LlmModelConfig } from '@/types/llmModel';
import type { LlmModelTokenUsageMap } from '@/types/llmTokenUsage';
import { formatTokenCount } from '@/services/llmTokenUsageStorage';
import styles from '../index.module.scss';

interface UseModelColumnsProps {
  onEdit: (record: LlmModelConfig) => void;
  onDelete: (record: LlmModelConfig) => void;
  deletingId?: string;
  tokenUsageMap?: LlmModelTokenUsageMap;
}

const MODEL_TYPE_LABEL: Record<LlmModelConfig['modelType'], string> = {
  chat: '对话模型',
  embedding: '向量模型'
};

export const useModelColumns = ({
  onEdit,
  onDelete,
  deletingId,
  tokenUsageMap = {}
}: UseModelColumnsProps) => {
  const columns: ColumnProps<LlmModelConfig>[] = useMemo(
    () => [
      {
        title: '模型名称',
        dataIndex: 'name',
        width: 180,
        render: (name: string, record) => (
          <Space size={6}>
            <span>{name}</span>
            {record.isBuiltin && (
              <Tag size="small" color="arcoblue">
                预置
              </Tag>
            )}
          </Space>
        )
      },
      {
        title: '类型',
        dataIndex: 'modelType',
        width: 100,
        render: (modelType: LlmModelConfig['modelType']) =>
          MODEL_TYPE_LABEL[modelType]
      },
      {
        title: '提供商 / 模型 ID',
        dataIndex: 'model',
        width: 220,
        render: (_, record) => (
          <Tooltip
            content={`${record.provider} / ${record.model}`}
            position="top"
          >
            <div className={styles['model-config-cell']}>
              <span className={styles['provider-tag']}>{record.provider}</span>
              <span className={styles['model-id']}>{record.model}</span>
            </div>
          </Tooltip>
        )
      },
      {
        title: 'API Key',
        dataIndex: 'apiName',
        width: 120,
        render: (apiName: string) => (
          <span className={styles['api-key-tag']}>{apiName}</span>
        )
      },
      {
        title: 'Base URL',
        dataIndex: 'baseUrl',
        width: 200,
        render: (baseUrl: string) => (
          <Tooltip content={baseUrl} position="top">
            <div className={styles['description-cell']}>{baseUrl}</div>
          </Tooltip>
        )
      },
      {
        title: 'Token 统计',
        dataIndex: 'tokenUsage',
        width: 160,
        render: (_, record) => {
          const usage = tokenUsageMap[record.id];
          if (!usage || usage.requestCount <= 0) {
            return <span className={styles['empty-config']}>暂无数据</span>;
          }

          return (
            <Tooltip
              content={
                <div>
                  <div>
                    累计 Token：{usage.totalTokens.toLocaleString('zh-CN')}
                  </div>
                  <div>
                    输入 Token：{usage.promptTokens.toLocaleString('zh-CN')}
                  </div>
                  <div>
                    输出 Token：{usage.completionTokens.toLocaleString('zh-CN')}
                  </div>
                  <div>
                    调用次数：{usage.requestCount.toLocaleString('zh-CN')}
                  </div>
                </div>
              }
              position="top"
            >
              <div className={styles['token-usage-cell']}>
                <span className={styles['token-usage-total']}>
                  {formatTokenCount(usage.totalTokens)}
                </span>
                <span className={styles['token-usage-meta']}>
                  {usage.requestCount} 次
                </span>
              </div>
            </Tooltip>
          );
        }
      },
      {
        title: '更新时间',
        dataIndex: 'updatedAt',
        width: 170,
        render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss')
      },
      {
        title: '操作',
        dataIndex: 'operations',
        width: 120,
        fixed: 'right' as const,
        render: (_, record) => (
          <Space size={12}>
            <PermissionWrapper permission={MODEL_MANAGEMENT_PERMISSIONS.UPDATE}>
              <Button
                type="text"
                size="small"
                className="p-0"
                onClick={() => onEdit(record)}
              >
                编辑
              </Button>
            </PermissionWrapper>
            <PermissionWrapper permission={MODEL_MANAGEMENT_PERMISSIONS.UPDATE}>
              <Button
                type="text"
                size="small"
                status="danger"
                className="p-0"
                disabled={record.isBuiltin}
                loading={deletingId === record.id}
                onClick={() => onDelete(record)}
              >
                删除
              </Button>
            </PermissionWrapper>
          </Space>
        )
      }
    ],
    [onDelete, onEdit, deletingId, tokenUsageMap]
  );

  return columns;
};
