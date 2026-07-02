import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  Button,
  Input,
  Message,
  Modal,
  Space,
  Spin,
  Table,
  Tabs,
  Typography
} from '@arco-design/web-react';
import { IconDelete, IconPlus } from '@arco-design/web-react/icon';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import MarkdownContent from '@/components/MarkdownContent';
import type { InstanceExtractResult } from '@/pages/dataResource/types/fileExtract';
import type { ObjectTypeAttributeField } from '../../ObjectTypeFormUtils/types';
import {
  buildFileParseRunKey,
  DEFAULT_OBJECT_TYPE_FILE_PARSE_REQUIREMENT,
  extractObjectTypeFileParse
} from '../../../services/extractObjectTypeFileParse';
import styles from './FileParseResultModal.module.scss';

interface EditableParseRow {
  id: string;
  [field: string]: string;
}

interface FileParseResultModalProps {
  visible: boolean;
  fileResourceId?: string;
  fileName?: string;
  objectTypeName?: string;
  objectTypeAttributes: ObjectTypeAttributeField[];
  requirement?: string;
  savedRows?: Record<string, string>[];
  savedRunKey?: string;
  readOnly?: boolean;
  onClose: () => void;
  onSave?: (payload: {
    rows: Record<string, string>[];
    runKey: string;
  }) => void;
}

const createRowId = () =>
  `row-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const createEmptyRow = (
  objectTypeAttributes: ObjectTypeAttributeField[]
): EditableParseRow => ({
  id: createRowId(),
  ...Object.fromEntries(
    objectTypeAttributes.map((attribute) => [attribute.propertyID, ''])
  )
});

const rowsToEditable = (
  rows: Record<string, string>[],
  objectTypeAttributes: ObjectTypeAttributeField[]
): EditableParseRow[] =>
  rows.map((row, index) => ({
    id: `saved-row-${index}`,
    ...Object.fromEntries(
      objectTypeAttributes.map((attribute) => [
        attribute.propertyID,
        String(row[attribute.propertyID] ?? '').trim()
      ])
    )
  }));

const normalizeRowsForSave = (
  rows: EditableParseRow[],
  objectTypeAttributes: ObjectTypeAttributeField[]
): Record<string, string>[] =>
  rows
    .map((row) =>
      Object.fromEntries(
        objectTypeAttributes.map((attribute) => [
          attribute.propertyID,
          String(row[attribute.propertyID] ?? '').trim()
        ])
      )
    )
    .filter((row) => Object.values(row).some((value) => value !== ''));

export default function FileParseResultModal({
  visible,
  fileResourceId,
  fileName,
  objectTypeName,
  objectTypeAttributes,
  requirement,
  savedRows,
  savedRunKey,
  readOnly = false,
  onClose,
  onSave
}: FileParseResultModalProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InstanceExtractResult | null>(null);
  const [editableRows, setEditableRows] = useState<EditableParseRow[]>([]);
  const [dirty, setDirty] = useState(false);
  const [savedLocally, setSavedLocally] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const lastRunKeyRef = useRef('');

  const resolvedRequirement =
    requirement?.trim() || DEFAULT_OBJECT_TYPE_FILE_PARSE_REQUIREMENT;

  const runKey = buildFileParseRunKey({
    fileResourceId,
    requirement: resolvedRequirement,
    objectTypeAttributes
  });

  const resetState = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
    setResult(null);
    setEditableRows([]);
    setDirty(false);
    setSavedLocally(false);
    lastRunKeyRef.current = '';
  };

  const applyRows = useCallback(
    (
      rows: Record<string, string>[],
      extractResult?: InstanceExtractResult | null
    ) => {
      setEditableRows(rowsToEditable(rows, objectTypeAttributes));
      if (extractResult !== undefined) {
        setResult(extractResult);
        return;
      }
      setResult((prev) =>
        prev
          ? { ...prev, rows }
          : {
              instances: [],
              rows
            }
      );
    },
    [objectTypeAttributes]
  );

  useEffect(() => {
    if (!visible) {
      resetState();
    }
  }, [visible]);

  const runExtract = async (force = false) => {
    if (!fileResourceId) {
      Message.warning('请先选择解析文件');
      return;
    }
    if (!objectTypeAttributes.length) {
      Message.warning('请先在属性信息步骤配置对象类型属性');
      return;
    }
    if (!force && lastRunKeyRef.current === runKey && editableRows.length) {
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);

    try {
      const extractResult = await extractObjectTypeFileParse({
        fileResourceId,
        objectTypeAttributes,
        objectTypeName,
        requirement: resolvedRequirement,
        signal: controller.signal
      });
      const rows = extractResult.rows || [];
      setResult(extractResult);
      applyRows(rows, extractResult);
      setDirty(false);
      setSavedLocally(false);
      lastRunKeyRef.current = runKey;
      Message.success(`解析完成，共提取 ${rows.length} 条记录，可编辑后保存`);
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }
      const message =
        error instanceof Error ? error.message : '文件解析失败，请稍后重试';
      Message.error(message);
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!visible || !fileResourceId || !objectTypeAttributes.length) {
      return;
    }

    if (savedRunKey === runKey && savedRows !== undefined) {
      applyRows(savedRows);
      setDirty(false);
      setSavedLocally(true);
      lastRunKeyRef.current = runKey;
      return;
    }

    void runExtract();
  }, [visible, runKey, savedRunKey, savedRows, applyRows]);

  const handleCellChange = useCallback(
    (rowId: string, fieldName: string, value: string) => {
      setEditableRows((prev) =>
        prev.map((row) =>
          row.id === rowId ? { ...row, [fieldName]: value } : row
        )
      );
      setDirty(true);
      setSavedLocally(false);
    },
    []
  );

  const handleAddRow = useCallback(() => {
    setEditableRows((prev) => [...prev, createEmptyRow(objectTypeAttributes)]);
    setDirty(true);
    setSavedLocally(false);
  }, [objectTypeAttributes]);

  const handleDeleteRow = useCallback((rowId: string) => {
    setEditableRows((prev) => prev.filter((row) => row.id !== rowId));
    setDirty(true);
    setSavedLocally(false);
  }, []);

  const handleSave = () => {
    const normalizedRows = normalizeRowsForSave(
      editableRows,
      objectTypeAttributes
    );
    onSave?.({ rows: normalizedRows, runKey });
    applyRows(normalizedRows);
    setDirty(false);
    setSavedLocally(true);
    Message.success(`已保存 ${normalizedRows.length} 条解析结果`);
  };

  const columns: ColumnProps<EditableParseRow>[] = useMemo(() => {
    const attributeColumns = objectTypeAttributes.map((attribute) => ({
      title: attribute.propertyComment
        ? `${attribute.propertyComment} (${attribute.propertyID})`
        : attribute.propertyID,
      width: 180,
      render: (_: unknown, record: EditableParseRow) =>
        readOnly ? (
          String(record[attribute.propertyID] ?? '') || '-'
        ) : (
          <Input
            size="small"
            value={record[attribute.propertyID] ?? ''}
            onChange={(value) =>
              handleCellChange(record.id, attribute.propertyID, value)
            }
          />
        )
    }));

    if (readOnly) {
      return attributeColumns;
    }

    return [
      ...attributeColumns,
      {
        title: '操作',
        width: 72,
        fixed: 'right' as const,
        render: (_: unknown, record: EditableParseRow) => (
          <Button
            type="text"
            size="mini"
            status="danger"
            icon={<IconDelete />}
            onClick={() => handleDeleteRow(record.id)}
          />
        )
      }
    ];
  }, [objectTypeAttributes, readOnly, handleCellChange, handleDeleteRow]);

  const handleClose = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    onClose();
  };

  const recordCount = normalizeRowsForSave(
    editableRows,
    objectTypeAttributes
  ).length;

  return (
    <Modal
      title={`文件解析结果${fileName ? ` - ${fileName}` : ''}`}
      visible={visible}
      onCancel={handleClose}
      style={{ width: 920 }}
      unmountOnExit
      footer={
        <div className={styles.footer}>
          <Button onClick={handleClose}>关闭</Button>
          {!readOnly ? (
            <>
              <Button
                loading={loading}
                disabled={!fileResourceId || !objectTypeAttributes.length}
                onClick={() => void runExtract(true)}
              >
                重新解析
              </Button>
              <Button
                type="primary"
                disabled={loading || (!dirty && savedLocally)}
                onClick={handleSave}
              >
                保存
              </Button>
            </>
          ) : null}
        </div>
      }
    >
      <Spin loading={loading} className={styles.spin}>
        <div className={styles.body}>
          <Space direction="vertical" size={4} className={styles.meta}>
            <Typography.Text type="secondary">
              提取要求：{resolvedRequirement}
            </Typography.Text>
            {result?.summary ? (
              <Typography.Text type="secondary">
                提取摘要：{result.summary}
              </Typography.Text>
            ) : null}
            <Typography.Text type="secondary">
              当前 {recordCount} 条有效记录
              {savedLocally && !dirty
                ? '（已保存）'
                : dirty
                  ? '（未保存）'
                  : ''}
            </Typography.Text>
          </Space>

          <Tabs defaultActiveTab="instances">
            <Tabs.TabPane key="instances" title="实例列表">
              {!readOnly ? (
                <div className={styles.toolbar}>
                  <Button
                    type="outline"
                    size="small"
                    icon={<IconPlus />}
                    onClick={handleAddRow}
                  >
                    新增一行
                  </Button>
                </div>
              ) : null}
              <Table
                rowKey="id"
                columns={columns}
                data={editableRows}
                pagination={false}
                border={false}
                scroll={{ x: true, y: 360 }}
                noDataElement={
                  loading ? '正在解析…' : '暂无解析结果，可手动新增或重新解析'
                }
              />
            </Tabs.TabPane>

            {result?.markdown ? (
              <Tabs.TabPane key="raw" title="原始输出">
                <div className={styles.rawContent}>
                  <MarkdownContent content={result.markdown} />
                </div>
              </Tabs.TabPane>
            ) : null}
          </Tabs>
        </div>
      </Spin>
    </Modal>
  );
}
