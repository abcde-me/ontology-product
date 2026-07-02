import React, { useMemo } from 'react';
import { Button, Space, Switch, Tooltip } from '@arco-design/web-react';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import { PermissionWrapper } from '@/components/PermissionGuard/PermissionWrapper';
import { MODEL_MANAGEMENT_PERMISSIONS } from '@/config/permissions';
import dayjs from 'dayjs';
import type { LlmScenarioConfig } from '@/types/llmScenario';
import styles from '../index.module.scss';

interface UseColumnsProps {
  onEdit: (record: LlmScenarioConfig) => void;
  onToggleEnabled: (record: LlmScenarioConfig, enabled: boolean) => void;
  togglingCode?: string;
}

export const useColumns = ({
  onEdit,
  onToggleEnabled,
  togglingCode
}: UseColumnsProps) => {
  const columns: ColumnProps<LlmScenarioConfig>[] = useMemo(
    () => [
      {
        title: '环节名称',
        dataIndex: 'name',
        width: 180
      },
      {
        title: '所属模块',
        dataIndex: 'module',
        width: 130
      },
      {
        title: '环节说明',
        dataIndex: 'description',
        width: 300,
        render: (description: string) => (
          <Tooltip content={description} position="top">
            <div className={styles['description-cell']}>{description}</div>
          </Tooltip>
        )
      },
      {
        title: '启用状态',
        dataIndex: 'enabled',
        width: 130,
        render: (enabled: boolean, record) => (
          <div className={styles['enabled-cell']}>
            <PermissionWrapper permission={MODEL_MANAGEMENT_PERMISSIONS.UPDATE}>
              <Switch
                checked={enabled}
                size="small"
                loading={togglingCode === record.code}
                onChange={(checked) => onToggleEnabled(record, checked)}
              />
            </PermissionWrapper>
            <span
              className={`${styles['enabled-label']} ${
                enabled
                  ? styles['enabled-label-on']
                  : styles['enabled-label-off']
              }`}
            >
              {enabled ? '已启用' : '未启用'}
            </span>
          </div>
        )
      },
      {
        title: '模型配置',
        dataIndex: 'model',
        width: 240,
        render: (_, record) =>
          record.enabled ? (
            <Tooltip
              content={`${record.provider} / ${record.model}`}
              position="top"
            >
              <div className={styles['model-config-cell']}>
                <span className={styles['provider-tag']}>
                  {record.provider}
                </span>
                <span className={styles['model-id']}>{record.model}</span>
              </div>
            </Tooltip>
          ) : (
            <span className={styles['empty-config']}>—</span>
          )
      },
      {
        title: 'API Key',
        dataIndex: 'apiName',
        width: 140,
        render: (apiName: string, record) =>
          record.enabled && apiName ? (
            <span className={styles['api-key-tag']}>{apiName}</span>
          ) : (
            <span className={styles['empty-config']}>—</span>
          )
      },
      {
        title: '更新时间',
        dataIndex: 'updatedAt',
        width: 170,
        render: (time?: string) =>
          time ? (
            dayjs(time).format('YYYY-MM-DD HH:mm:ss')
          ) : (
            <span className={styles['empty-config']}>—</span>
          )
      },
      {
        title: '操作',
        dataIndex: 'operations',
        width: 90,
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
                配置
              </Button>
            </PermissionWrapper>
          </Space>
        )
      }
    ],
    [onEdit, onToggleEnabled, togglingCode]
  );

  return columns;
};
