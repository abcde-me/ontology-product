import React, { useMemo } from 'react';
import { Empty, Modal, Table } from '@arco-design/web-react';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import { getSemanticMapping } from '@/pages/knowledgeManagement/semanticMapping/services/mappingStorage';
import type { SemanticMappingListItem } from '@/pages/knowledgeManagement/semanticMapping/types';
import styles from '../index.module.scss';

interface SemanticMappingsPreviewModalProps {
  visible: boolean;
  mappingIds?: string[];
  taskName?: string;
  onCancel: () => void;
}

interface MappingPreviewRow {
  id: string;
  term: string;
  synonyms: string;
  objectTypes: string;
  attributes: string;
}

const formatAttributes = (item: SemanticMappingListItem) => {
  const attrs = (item.objectTypes || []).flatMap((ot) =>
    (ot.attributes || []).map((attr) => {
      const name = attr.displayName || attr.fieldName;
      return ot.name ? `${ot.name}.${name}` : name;
    })
  );
  return attrs.length ? attrs.join('、') : '-';
};

export default function SemanticMappingsPreviewModal({
  visible,
  mappingIds,
  taskName,
  onCancel
}: SemanticMappingsPreviewModalProps) {
  const mappings = useMemo(() => {
    if (!visible || !mappingIds?.length) {
      return [] as SemanticMappingListItem[];
    }
    return mappingIds
      .map((id) => getSemanticMapping(id))
      .filter(Boolean) as SemanticMappingListItem[];
  }, [mappingIds, visible]);

  const data: MappingPreviewRow[] = useMemo(
    () =>
      mappings.map((item) => ({
        id: item.id,
        term: item.standardTerm || '-',
        synonyms: item.synonyms?.filter(Boolean).join('、') || '-',
        objectTypes:
          item.objectTypes
            ?.map((ot) => ot.name)
            .filter(Boolean)
            .join('、') || '-',
        attributes: formatAttributes(item)
      })),
    [mappings]
  );

  const missingCount = (mappingIds?.length || 0) - mappings.length;

  const columns: ColumnProps<MappingPreviewRow>[] = useMemo(
    () => [
      {
        title: '术语',
        dataIndex: 'term',
        width: 140,
        ellipsis: true
      },
      {
        title: '同义词',
        dataIndex: 'synonyms',
        width: 160,
        ellipsis: true,
        render: (value: string) => (
          <span className={styles.detailTableMultiline}>{value || '-'}</span>
        )
      },
      {
        title: '对象类型',
        dataIndex: 'objectTypes',
        width: 140,
        ellipsis: true
      },
      {
        title: '关联属性',
        dataIndex: 'attributes',
        ellipsis: true,
        render: (value: string) => (
          <span className={styles.detailTableMultiline}>{value || '-'}</span>
        )
      }
    ],
    []
  );

  return (
    <Modal
      title={taskName ? `语义映射 · ${taskName}` : '语义映射'}
      visible={visible}
      onCancel={onCancel}
      footer={null}
      unmountOnExit
      style={{ width: 780 }}
    >
      {!mappingIds?.length ? (
        <Empty description="该任务未关联语义映射" />
      ) : !data.length ? (
        <Empty description="关联的语义映射已不存在或已被删除" />
      ) : (
        <>
          <Table
            rowKey="id"
            columns={columns}
            data={data}
            pagination={false}
            border
            scroll={{ y: 360 }}
          />
          {missingCount > 0 ? (
            <div className={styles.previewMissingHint}>
              另有 {missingCount} 条关联映射已删除或不可用
            </div>
          ) : null}
        </>
      )}
    </Modal>
  );
}
