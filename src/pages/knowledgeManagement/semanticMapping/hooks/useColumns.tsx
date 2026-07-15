import React, { useMemo } from 'react';
import {
  Button,
  Popconfirm,
  Space,
  Tag,
  Tooltip
} from '@arco-design/web-react';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import { GlobalTooltip } from '@ceai-front/arco-material';
import dayjs from 'dayjs';
import { SYNONYM_TAG_COLORS } from '../constants';
import type { SemanticMappingListItem } from '../types';
import styles from '../index.module.scss';

interface UseColumnsProps {
  onViewDetail: (record: SemanticMappingListItem) => void;
  onDelete: (record: SemanticMappingListItem) => void;
  deletingId?: string;
}

const renderEllipsisText = (value?: string) => (
  <GlobalTooltip.Ellipsis text={value || '-'} />
);

export const useColumns = ({
  onViewDetail,
  onDelete,
  deletingId
}: UseColumnsProps) => {
  const columns: ColumnProps<SemanticMappingListItem>[] = useMemo(
    () => [
      {
        title: '标准术语',
        dataIndex: 'standardTerm',
        width: 160,
        ellipsis: true,
        render: (value?: string) => renderEllipsisText(value)
      },
      {
        title: '同义词 / 别名',
        dataIndex: 'synonyms',
        width: 320,
        ellipsis: true,
        render: (synonyms?: string[]) => {
          if (!synonyms?.length) {
            return '-';
          }

          const fullText = synonyms.join('、');

          return (
            <Tooltip content={fullText}>
              <div className={styles.synonymCell}>
                {synonyms.map((item, index) => (
                  <Tag
                    key={`${item}-${index}`}
                    size="small"
                    color={
                      SYNONYM_TAG_COLORS[index % SYNONYM_TAG_COLORS.length]
                    }
                    className={styles.synonymTag}
                  >
                    {item}
                  </Tag>
                ))}
              </div>
            </Tooltip>
          );
        }
      },
      {
        title: '映射描述',
        dataIndex: 'description',
        width: 180,
        ellipsis: true,
        render: (value?: string) => renderEllipsisText(value)
      },
      {
        title: '关联对象类型',
        dataIndex: 'objectTypes',
        width: 240,
        ellipsis: true,
        render: (_: unknown, record: SemanticMappingListItem) => {
          if (!record.objectTypes?.length) {
            return '-';
          }
          return renderEllipsisText(
            record.objectTypes
              .map((item) => {
                const attrs = item.attributes?.length
                  ? `（${item.attributes
                      .map((attr) => attr.displayName || attr.fieldName)
                      .join('、')}）`
                  : '';
                return `${item.name}${attrs}`;
              })
              .join('、')
          );
        }
      },
      {
        title: '更新时间',
        dataIndex: 'updatedAt',
        width: 170,
        ellipsis: true,
        render: (time: string) =>
          renderEllipsisText(
            time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
          )
      },
      {
        title: '操作',
        dataIndex: 'operations',
        width: 120,
        fixed: 'right' as const,
        render: (_: unknown, record: SemanticMappingListItem) => (
          <Space size={8}>
            <Button
              type="text"
              size="small"
              className="p-0"
              onClick={() => onViewDetail(record)}
            >
              详情
            </Button>
            <Popconfirm
              title="确认删除该语义映射？删除后不可恢复。"
              onOk={() => onDelete(record)}
            >
              <Button
                type="text"
                size="small"
                className="p-0"
                status="danger"
                loading={deletingId === record.id}
              >
                删除
              </Button>
            </Popconfirm>
          </Space>
        )
      }
    ],
    [deletingId, onDelete, onViewDetail]
  );

  return columns;
};
