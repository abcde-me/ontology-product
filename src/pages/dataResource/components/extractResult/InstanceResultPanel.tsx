import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Message,
  Modal,
  Space,
  Table,
  Tabs,
  Typography
} from '@arco-design/web-react';
import { IconSave } from '@arco-design/web-react/icon';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import MarkdownContent from '@/components/MarkdownContent';
import { resolveDataResourcePrimaryKeyFields } from '@/pages/ontologyScene/modules/objectType/services/dataResourceMapping';
import { fetchDataResourceDetail } from '../../services/api';
import { insertInstanceExtractResultToDataResource } from '../../services/insertExtractedInstances';
import type { DataResourceTable } from '../../types';
import type { InstanceExtractResult } from '../../types/fileExtract';
import { ExtractResultSection } from './ExtractResultSection';
import styles from '../../index.module.scss';

interface InstanceResultPanelProps {
  targetTableId?: string;
  targetTableName?: string;
  result: InstanceExtractResult;
  onSaved?: () => void;
}

export const InstanceResultPanel: React.FC<InstanceResultPanelProps> = ({
  targetTableId,
  targetTableName,
  result,
  onSaved
}) => {
  const [targetTable, setTargetTable] = useState<DataResourceTable | null>(
    null
  );
  const [inserting, setInserting] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const resolvedTableId = targetTableId || result.targetTableId;
  const resolvedTableName = targetTableName || result.targetTableName;
  const tableRows = result.rows || [];
  const useTableSchema = tableRows.length > 0 && !!resolvedTableId;

  useEffect(() => {
    if (!resolvedTableId) {
      setTargetTable(null);
      return;
    }

    let active = true;
    void fetchDataResourceDetail(resolvedTableId).then((table) => {
      if (active) {
        setTargetTable(table);
      }
    });

    return () => {
      active = false;
    };
  }, [resolvedTableId]);

  const attributeKeys = useMemo(() => {
    if (useTableSchema && targetTable) {
      return targetTable.fields.map((field) => field.fieldName);
    }

    const keys = new Set<string>();
    (result.instances || []).forEach((instance) => {
      Object.keys(instance.attributes || {}).forEach((key) => keys.add(key));
    });
    return [...keys];
  }, [result.instances, targetTable, useTableSchema]);

  const displayRows = useMemo(() => {
    if (useTableSchema) {
      return tableRows.map((row, index) => ({
        id: `row-${index}`,
        ...row
      }));
    }

    return (result.instances || []).map((instance) => ({
      id: instance.id,
      name: instance.name,
      objectType: instance.objectType,
      ...instance.attributes
    }));
  }, [result.instances, tableRows, useTableSchema]);

  const primaryKeyFields = useMemo(
    () => (targetTable ? resolveDataResourcePrimaryKeyFields(targetTable) : []),
    [targetTable]
  );

  const columns: ColumnProps<(typeof displayRows)[number]>[] = useMemo(() => {
    if (useTableSchema) {
      return attributeKeys.map((key) => ({
        title: targetTable?.fields.find((field) => field.fieldName === key)
          ?.fieldComment
          ? `${targetTable?.fields.find((field) => field.fieldName === key)?.fieldComment} (${key})`
          : key,
        width: 160,
        ellipsis: true,
        render: (_: unknown, record: (typeof displayRows)[number]) =>
          String(record[key] ?? '') || '-'
      }));
    }

    return [
      { title: '实例名称', dataIndex: 'name', width: 180, fixed: 'left' },
      { title: '对象类型', dataIndex: 'objectType', width: 140 },
      ...attributeKeys.map((key) => ({
        title: key,
        width: 160,
        ellipsis: true,
        render: (_: unknown, record: (typeof displayRows)[number]) =>
          String(record[key] ?? '') || '-'
      }))
    ];
  }, [attributeKeys, targetTable, useTableSchema]);

  const handleInsert = async () => {
    if (!resolvedTableId) {
      Message.warning('未配置目标数据资源表');
      return;
    }

    setInserting(true);
    try {
      const insertResult = await insertInstanceExtractResultToDataResource({
        targetTableId: resolvedTableId,
        result
      });

      Message.success(
        `插入完成：新增 ${insertResult.inserted} 条，跳过重复 ${insertResult.skipped} 条`
      );
      setConfirmVisible(false);
      onSaved?.();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : '插入数据资源表失败';
      Message.error(message);
    } finally {
      setInserting(false);
    }
  };

  return (
    <div className={styles['extract-result-panel']}>
      <ExtractResultSection
        title="实例提取结果"
        stats={`${displayRows.length} 条记录`}
        hint={
          resolvedTableId
            ? `目标表：${resolvedTableName || targetTable?.tableName || resolvedTableId}，插入时按主键 ${primaryKeyFields.join('、') || '-'} 去重`
            : undefined
        }
        extra={
          resolvedTableId && displayRows.length ? (
            <Button
              type="primary"
              icon={<IconSave />}
              onClick={() => setConfirmVisible(true)}
            >
              插入到数据资源表
            </Button>
          ) : undefined
        }
      >
        <Tabs defaultActiveTab="instances">
          <Tabs.TabPane key="instances" title="实例列表">
            <Table
              rowKey="id"
              columns={columns}
              data={displayRows}
              pagination={false}
              border={false}
              scroll={{ x: true }}
            />
          </Tabs.TabPane>

          {result.markdown ? (
            <Tabs.TabPane key="raw" title="原始输出">
              <div className={styles['file-extract-result-content']}>
                <MarkdownContent content={result.markdown} />
              </div>
            </Tabs.TabPane>
          ) : null}
        </Tabs>
      </ExtractResultSection>

      <Modal
        title="插入到数据资源表"
        visible={confirmVisible}
        confirmLoading={inserting}
        onOk={() => void handleInsert()}
        onCancel={() => setConfirmVisible(false)}
        unmountOnExit
      >
        <Space direction="vertical" size={12}>
          <Typography.Text>
            将把 {displayRows.length} 条提取结果插入到数据资源表「
            {resolvedTableName || targetTable?.tableName || resolvedTableId}
            」。
          </Typography.Text>
          <Typography.Text type="secondary">
            插入过程将根据主键字段（
            {primaryKeyFields.join('、') || '未配置'}
            ）去重：已存在相同主键的记录将被跳过，仅插入新记录。
          </Typography.Text>
        </Space>
      </Modal>
    </div>
  );
};
