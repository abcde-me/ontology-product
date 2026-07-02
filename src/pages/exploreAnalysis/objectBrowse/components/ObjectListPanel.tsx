import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import { Button, Space, Spin, Table, Tooltip } from '@arco-design/web-react';

import type { ColumnProps } from '@arco-design/web-react/es/Table';

import { NoDataCard } from '@ceai-front/arco-material';

import { useHistory } from 'react-router-dom';

import type {
  InstanceQueryRow,
  ObjectBrowseQueryTabKey,
  ObjectBrowseSelectionContext
} from '../types';

import {
  buildRelationInsightPath,
  resolveInstanceId
} from '../utils/instanceRow';
import {
  formatFieldDisplayLabel,
  resolveFieldHeaderLabel,
  type FieldCommentMap
} from '../utils/fieldDisplayLabel';

import { InstanceDetailDrawer } from './InstanceDetailDrawer';

import {
  OntologyGraphModal,
  type OntologyGraphModalParams
} from './OntologyGraphModal';

import type { ColumnWidthMap } from '../utils/resizableColumns';
import { withResizableColumn } from '../utils/resizableColumns';

import styles from '../index.module.scss';

interface ObjectListPanelProps {
  queryMode: ObjectBrowseQueryTabKey;

  loading: boolean;

  searched: boolean;

  data: InstanceQueryRow[];

  selectionContext?: ObjectBrowseSelectionContext | null;

  total?: number;

  page?: number;

  pageSize?: number;

  onPageChange?: (page: number, pageSize: number) => void;

  fieldCommentMap?: FieldCommentMap;

  vectorFieldNames?: Set<string>;
}

const SCORE_KEY = 'score';

const MATCHED_VECTOR_FIELD_KEY = 'matchedVectorField';

const INTERNAL_KEYS = new Set([
  SCORE_KEY,
  '_score',
  'similarity',
  MATCHED_VECTOR_FIELD_KEY
]);

const resolveSimilarityScoreClass = (score: number): string => {
  if (score >= 0.7) {
    return styles['similarity-score-high'];
  }
  if (score >= 0.4) {
    return styles['similarity-score-medium'];
  }
  return styles['similarity-score-low'];
};

const OPERATION_COLUMN_KEY = '__operation';
const OPERATION_COLUMN_WIDTH = 180;
const DEFAULT_DATA_COLUMN_WIDTH = 200;
const SCORE_COLUMN_WIDTH = 100;
const MATCHED_VECTOR_COLUMN_WIDTH = 200;
const MAX_DISPLAY_TEXT_LENGTH = 60;

const isHiddenResultField = (
  key: string,
  vectorFieldNames?: Set<string>
): boolean =>
  INTERNAL_KEYS.has(key) ||
  key.startsWith('_') ||
  Boolean(vectorFieldNames?.has(key));

const formatCellText = (value: unknown): string =>
  value == null || value === '' ? '-' : String(value);

const truncateDisplayText = (
  text: string,
  maxLength = MAX_DISPLAY_TEXT_LENGTH
): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength)}...`;
};

const OverflowTooltip: React.FC<{
  content: string;
  className?: string;
  children: React.ReactNode;
}> = ({ content, className, children }) => {
  const contentRef = useRef<HTMLSpanElement>(null);
  const [isOverflow, setIsOverflow] = useState(false);

  const checkOverflow = useCallback(() => {
    const element = contentRef.current;

    if (!element) {
      return;
    }

    setIsOverflow(element.scrollWidth > element.clientWidth + 1);
  }, []);

  useLayoutEffect(() => {
    checkOverflow();

    const element = contentRef.current;

    if (!element || typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const observer = new ResizeObserver(checkOverflow);
    observer.observe(element);

    return () => observer.disconnect();
  }, [checkOverflow, content, children]);

  const node = (
    <span ref={contentRef} className={className}>
      {children}
    </span>
  );

  if (content.length > MAX_DISPLAY_TEXT_LENGTH || isOverflow) {
    return <Tooltip content={content}>{node}</Tooltip>;
  }

  return node;
};

const TruncatedText: React.FC<{
  text: string;
  className?: string;
  tooltip?: string;
}> = ({ text, className, tooltip }) => {
  const displayText = truncateDisplayText(text);
  const fullText = tooltip ?? text;

  return (
    <OverflowTooltip content={fullText} className={className}>
      {displayText}
    </OverflowTooltip>
  );
};

const ColumnHeaderTitle: React.FC<{
  fieldName: string;
  fieldCommentMap?: FieldCommentMap;
}> = ({ fieldName, fieldCommentMap }) => {
  const headerLabel = resolveFieldHeaderLabel(fieldName, fieldCommentMap);
  const tooltipContent = formatFieldDisplayLabel(fieldName, fieldCommentMap);
  const showTooltip = tooltipContent !== headerLabel;

  const content = (
    <span className={styles['column-header']}>{headerLabel}</span>
  );

  if (!showTooltip) {
    return content;
  }

  return <Tooltip content={tooltipContent}>{content}</Tooltip>;
};

const renderTruncatedCell = (value: unknown) => (
  <TruncatedText text={formatCellText(value)} className={styles['cell-text']} />
);

const EMPTY_TIPS: Partial<Record<ObjectBrowseQueryTabKey, string>> = {
  condition: '依次选择对象类型、场景库，填写属性条件后点击「查询实例」',

  semantic: '依次选择对象类型、场景库，输入问题描述后点击「语义检索」',

  semantic2:
    '依次选择对象类型、场景库与向量字段，输入检索文本后点击「相似性检索」'
};

export const ObjectListPanel: React.FC<ObjectListPanelProps> = ({
  queryMode,

  loading,

  searched,

  data,

  selectionContext,

  total = 0,

  page = 1,

  pageSize = 10,

  onPageChange,

  fieldCommentMap,

  vectorFieldNames
}) => {
  const history = useHistory();

  const [detailVisible, setDetailVisible] = useState(false);

  const [selectedRecord, setSelectedRecord] = useState<InstanceQueryRow | null>(
    null
  );

  const [graphModalVisible, setGraphModalVisible] = useState(false);

  const [graphModalParams, setGraphModalParams] =
    useState<OntologyGraphModalParams | null>(null);

  const [columnWidths, setColumnWidths] = useState<ColumnWidthMap>({});

  const handleColumnResize = useCallback((columnKey: string, width: number) => {
    setColumnWidths((prev) => {
      if (prev[columnKey] === width) {
        return prev;
      }

      return {
        ...prev,
        [columnKey]: width
      };
    });
  }, []);

  const showScoreColumn = queryMode === 'semantic2';

  const showPagination =
    (queryMode === 'condition' || queryMode === 'semantic') && searched;

  const canOperate = Boolean(selectionContext);

  const handleViewOntology = useCallback(
    (record: InstanceQueryRow) => {
      if (!selectionContext) {
        return;
      }

      setGraphModalParams({
        sceneId: selectionContext.sceneId,

        objectTypeId: selectionContext.objectTypeId,

        objectTypeCode: selectionContext.objectTypeCode,

        instanceId: resolveInstanceId(record)
      });

      setGraphModalVisible(true);
    },

    [selectionContext]
  );

  const handleViewDetail = useCallback((record: InstanceQueryRow) => {
    setSelectedRecord(record);

    setDetailVisible(true);
  }, []);

  const handleViewInsight = useCallback(
    (record: InstanceQueryRow) => {
      if (!selectionContext) {
        return;
      }

      history.push(
        buildRelationInsightPath({
          sceneId: selectionContext.sceneId,

          objectTypeId: selectionContext.objectTypeId,

          instanceId: resolveInstanceId(record)
        })
      );
    },

    [history, selectionContext]
  );

  const columns: ColumnProps<InstanceQueryRow>[] = useMemo(() => {
    const applyResizable = (
      column: ColumnProps<InstanceQueryRow>,
      columnKey: string,
      defaultWidth: number
    ) =>
      withResizableColumn(
        column,
        columnKey,
        defaultWidth,
        columnWidths,
        handleColumnResize
      );

    const operationColumn = applyResizable(
      {
        title: '操作',

        dataIndex: OPERATION_COLUMN_KEY,

        fixed: 'right',

        render: (_, record) => (
          <Space size={12}>
            <Button
              type="text"
              size="small"
              className={styles['operation-btn']}
              disabled={!canOperate}
              onClick={() => handleViewOntology(record)}
            >
              本体
            </Button>

            <Button
              type="text"
              size="small"
              className={styles['operation-btn']}
              onClick={() => handleViewDetail(record)}
            >
              明细
            </Button>

            <Button
              type="text"
              size="small"
              className={styles['operation-btn']}
              disabled={!canOperate}
              onClick={() => handleViewInsight(record)}
            >
              洞察
            </Button>
          </Space>
        )
      },
      OPERATION_COLUMN_KEY,
      OPERATION_COLUMN_WIDTH
    );

    if (!data.length) {
      return [operationColumn];
    }

    const keys = Object.keys(data[0]).filter(
      (key) => !isHiddenResultField(key, vectorFieldNames)
    );

    const dynamicColumns: ColumnProps<InstanceQueryRow>[] = keys.map((key) =>
      applyResizable(
        {
          title: (
            <ColumnHeaderTitle
              fieldName={key}
              fieldCommentMap={fieldCommentMap}
            />
          ),
          dataIndex: key,
          render: (value) => renderTruncatedCell(value)
        },
        key,
        DEFAULT_DATA_COLUMN_WIDTH
      )
    );

    const showMatchedVectorField = data.some(
      (record) => record[MATCHED_VECTOR_FIELD_KEY]
    );

    const dataColumns = showScoreColumn
      ? [
          applyResizable(
            {
              title: '相似度',

              dataIndex: SCORE_KEY,

              fixed: 'left' as const,

              render: (_: unknown, record: InstanceQueryRow) => {
                const score =
                  record.score ??
                  record._score ??
                  record.similarity ??
                  record[SCORE_KEY];

                if (score == null || score === '') {
                  return '-';
                }

                const num = Number(score);

                if (Number.isNaN(num)) {
                  return String(score);
                }

                return (
                  <span className={resolveSimilarityScoreClass(num)}>
                    {num.toFixed(4)}
                  </span>
                );
              }
            },
            SCORE_KEY,
            SCORE_COLUMN_WIDTH
          ),

          ...(showMatchedVectorField
            ? [
                applyResizable(
                  {
                    title: '匹配向量字段',

                    dataIndex: MATCHED_VECTOR_FIELD_KEY,

                    fixed: 'left' as const,

                    render: (value: unknown) => renderTruncatedCell(value)
                  },
                  MATCHED_VECTOR_FIELD_KEY,
                  MATCHED_VECTOR_COLUMN_WIDTH
                )
              ]
            : []),

          ...dynamicColumns
        ]
      : dynamicColumns;

    return [...dataColumns, operationColumn];
  }, [
    canOperate,

    data,

    handleViewDetail,

    handleViewInsight,

    handleViewOntology,

    showScoreColumn,

    fieldCommentMap,

    vectorFieldNames,

    columnWidths,

    handleColumnResize
  ]);

  const tableScrollX = useMemo(() => {
    const totalWidth = columns.reduce((total, column) => {
      const width = Number(column.width);

      return total + (Number.isNaN(width) ? DEFAULT_DATA_COLUMN_WIDTH : width);
    }, 0);

    return Math.max(totalWidth, 1);
  }, [columns]);

  const emptyTip = EMPTY_TIPS[queryMode];

  return (
    <div className={styles['result-panel']}>
      <div className={styles['result-panel-title']}>对象列表</div>

      <div className={styles['result-panel-body']}>
        {loading ? (
          <div className={styles['result-loading']}>
            <Spin />
          </div>
        ) : !searched ? (
          <div className={styles['result-empty']}>
            <NoDataCard type="block" title="尚未查询实例" />

            {emptyTip && (
              <div className={styles['result-empty-tip']}>{emptyTip}</div>
            )}
          </div>
        ) : data.length === 0 ? (
          <div className={styles['result-empty']}>
            <NoDataCard type="block" title="暂无匹配结果" />
          </div>
        ) : (
          <Table
            columns={columns}
            data={data}
            rowKey={(record) =>
              String(record.id ?? record._id ?? JSON.stringify(record))
            }
            border={{ headerCell: true }}
            tableLayoutFixed
            pagination={
              showPagination
                ? {
                    current: page,

                    pageSize,

                    total,

                    showTotal: true,

                    sizeCanChange: true,

                    pageSizeChangeResetCurrent: true,

                    onChange: (nextPage, nextPageSize) => {
                      onPageChange?.(nextPage, nextPageSize);
                    }
                  }
                : false
            }
            scroll={{ x: tableScrollX }}
            className={styles['result-table']}
          />
        )}
      </div>

      <InstanceDetailDrawer
        visible={detailVisible}
        record={selectedRecord}
        fieldCommentMap={fieldCommentMap}
        vectorFieldNames={vectorFieldNames}
        onClose={() => {
          setDetailVisible(false);

          setSelectedRecord(null);
        }}
      />

      <OntologyGraphModal
        visible={graphModalVisible}
        params={graphModalParams}
        onClose={() => {
          setGraphModalVisible(false);

          setGraphModalParams(null);
        }}
      />
    </div>
  );
};
