import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Cascader,
  Form,
  Input,
  Message,
  Radio,
  Select,
  Space,
  Tooltip
} from '@arco-design/web-react';
import {
  connectorAnalyseFinkSQLColumns,
  connectorTestFinkSQL,
  listOntologyConnectors,
  listSqlConnectorDBAndTables
} from '@/api/ontologySceneLibrary/objectType';
import { useUserInfoStore } from '@/store/userInfoStore';
import { SqlConnectorDatabaseItem, SqlConnectorItem } from '@/types/objectType';
import { SqlSourceDataInfo } from '../../ObjectTypeFormUtils/types';

const FormItem = Form.Item;
const { TextArea } = Input;

interface CascaderOption {
  label: string;
  value: string;
  children?: Array<{ label: string; value: string; isLeaf?: boolean }>;
  isLeaf?: boolean;
}

interface SqlSourceSelectorProps {
  form: any;
  value: SqlSourceDataInfo;
  onChange: (value: SqlSourceDataInfo) => void;
  onTableSelected?: (
    value: Required<
      Pick<SqlSourceDataInfo, 'connectorId' | 'databaseName' | 'tableName'>
    >
  ) => void;
  onSqlColumnsParsed?: (columns: string[]) => void;
  fieldPrefix: string;
  styles: Record<string, string>;
}

function isSuccessResponse(response: any): boolean {
  return (
    response &&
    (response.status === 200 || response.stat === 0 || response.status === 0) &&
    (response.code === '' || response.code === undefined || response.code === 0)
  );
}

function filterCascaderOption(
  input: string,
  option: { label?: unknown; value?: unknown }
) {
  const q = String(input ?? '')
    .trim()
    .toLowerCase();
  if (!q) return true;
  return [option.label, option.value]
    .filter((item) => item != null)
    .some((item) => String(item).toLowerCase().includes(q));
}

function normalizeConnectorList(data: any): SqlConnectorItem[] {
  if (Array.isArray(data)) {
    return data;
  }
  if (Array.isArray(data?.items)) {
    return data.items;
  }
  return [];
}

function findKeywordAtTopLevel(sql: string, keyword: string, start = 0) {
  const target = keyword.toLowerCase();
  let depth = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inBacktick = false;
  for (let i = start; i < sql.length; i += 1) {
    const ch = sql[i];
    const prev = sql[i - 1];
    if (!inDoubleQuote && !inBacktick && ch === "'" && prev !== '\\') {
      inSingleQuote = !inSingleQuote;
      continue;
    }
    if (!inSingleQuote && !inBacktick && ch === '"' && prev !== '\\') {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }
    if (!inSingleQuote && !inDoubleQuote && ch === '`') {
      inBacktick = !inBacktick;
      continue;
    }
    if (inSingleQuote || inDoubleQuote || inBacktick) continue;
    if (ch === '(') {
      depth += 1;
      continue;
    }
    if (ch === ')') {
      depth = Math.max(0, depth - 1);
      continue;
    }
    if (depth !== 0) continue;
    const segment = sql.slice(i, i + target.length).toLowerCase();
    if (segment !== target) continue;
    const before = i === 0 ? ' ' : sql[i - 1];
    const after = sql[i + target.length] ?? ' ';
    if (/[a-zA-Z0-9_]/.test(before) || /[a-zA-Z0-9_]/.test(after)) {
      continue;
    }
    return i;
  }
  return -1;
}

function splitTopLevelByComma(input: string) {
  const parts: string[] = [];
  let depth = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inBacktick = false;
  let current = '';
  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    const prev = input[i - 1];
    if (!inDoubleQuote && !inBacktick && ch === "'" && prev !== '\\') {
      inSingleQuote = !inSingleQuote;
      current += ch;
      continue;
    }
    if (!inSingleQuote && !inBacktick && ch === '"' && prev !== '\\') {
      inDoubleQuote = !inDoubleQuote;
      current += ch;
      continue;
    }
    if (!inSingleQuote && !inDoubleQuote && ch === '`') {
      inBacktick = !inBacktick;
      current += ch;
      continue;
    }
    if (inSingleQuote || inDoubleQuote || inBacktick) {
      current += ch;
      continue;
    }
    if (ch === '(') {
      depth += 1;
      current += ch;
      continue;
    }
    if (ch === ')') {
      depth = Math.max(0, depth - 1);
      current += ch;
      continue;
    }
    if (ch === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim()) {
    parts.push(current.trim());
  }
  return parts;
}

function validateCustomSql(sqlText: string): {
  valid: boolean;
  message?: string;
} {
  const sql = sqlText.trim().replace(/;+\s*$/g, '');
  if (!sql) {
    return { valid: false, message: '请先输入自定义SQL' };
  }
  if (!/^(select|with)\b/i.test(sql)) {
    return {
      valid: false,
      message: '自定义SQL只支持查询操作，最外层仅支持SELECT语句'
    };
  }
  const selectIndex = findKeywordAtTopLevel(sql, 'select');
  if (selectIndex < 0) {
    return {
      valid: false,
      message: '自定义SQL只支持查询操作，最外层仅支持SELECT语句'
    };
  }
  const fromIndex = findKeywordAtTopLevel(sql, 'from', selectIndex + 6);
  if (fromIndex < 0 || fromIndex <= selectIndex + 6) {
    return { valid: false, message: 'SQL格式不正确，请检查SELECT语句' };
  }
  const projectionClause = sql.slice(selectIndex + 6, fromIndex).trim();
  if (!projectionClause) {
    return { valid: false, message: '请在SELECT中明确指定输出字段' };
  }
  const projectionItems = splitTopLevelByComma(projectionClause).map((item) =>
    item.trim()
  );
  const hasWildcardProjection = projectionItems.some((item) => {
    if (!item) return false;
    const normalized = item.replace(/\s+/g, '');
    if (normalized === '*') return true;
    return /^((`[^`]+`|"[^"]+"|[a-zA-Z_][\w$]*)\.)\*$/.test(normalized);
  });
  if (hasWildcardProjection) {
    return {
      valid: false,
      message: '最外层SELECT必须明确输出字段，不支持SELECT *'
    };
  }
  return { valid: true };
}

export default function SqlSourceSelector({
  form,
  value,
  onChange,
  onTableSelected,
  onSqlColumnsParsed,
  fieldPrefix,
  styles
}: SqlSourceSelectorProps) {
  const projectID = useUserInfoStore((state) => state.projectId?.[1]);
  const [connectors, setConnectors] = useState<SqlConnectorItem[]>([]);
  const [connectorsLoading, setConnectorsLoading] = useState(false);
  const [tablesLoading, setTablesLoading] = useState(false);
  const [databases, setDatabases] = useState<SqlConnectorDatabaseItem[]>([]);
  const [testLoading, setTestLoading] = useState(false);
  const [parseLoading, setParseLoading] = useState(false);
  const [sqlActionResult, setSqlActionResult] = useState<{
    type: 'test' | 'parse';
    status: 'succeed' | 'failed';
    message: string;
    columns?: string[];
  } | null>(null);

  useEffect(() => {
    const loadConnectors = async () => {
      setConnectorsLoading(true);
      try {
        const response = await listOntologyConnectors({
          page: 1,
          page_size: 1000,
          type: 'sql',
          subtype: ['mysql', 'dameng', 'postgres'],
          status: ['succeed'],
          sort: 'desc',
          sort_by: 'create_time'
        });
        if (isSuccessResponse(response)) {
          setConnectors(normalizeConnectorList(response.data));
        } else {
          Message.error(response.message || '加载连接器列表失败');
        }
      } catch (error) {
        console.error('加载连接器列表失败:', error);
        Message.error('加载连接器列表失败');
      } finally {
        setConnectorsLoading(false);
      }
    };

    loadConnectors();
  }, []);

  const fetchDatabaseTables = useCallback(async () => {
    const rawId = value.connectorId;
    const id = rawId === undefined || rawId === null ? NaN : Number(rawId);
    if (!Number.isFinite(id)) {
      setDatabases([]);
      return;
    }
    if (!projectID) {
      setDatabases([]);
      return;
    }

    setTablesLoading(true);
    try {
      const response = await listSqlConnectorDBAndTables({
        id,
        projectID
      });
      if (isSuccessResponse(response)) {
        setDatabases(response.data || []);
      } else {
        Message.error(response.message || '加载数据库表失败');
        setDatabases([]);
      }
    } catch (error) {
      console.error('加载数据库表失败:', error);
      Message.error('加载数据库表失败');
      setDatabases([]);
    } finally {
      setTablesLoading(false);
    }
  }, [projectID, value.connectorId]);

  useEffect(() => {
    void fetchDatabaseTables();
  }, [fetchDatabaseTables]);

  const tableOptions = useMemo<CascaderOption[]>(
    () =>
      databases.map((database) => ({
        label: database.database_name,
        value: database.database_name,
        isLeaf: false,
        children: (database.tables || []).map((table) => ({
          label: table.name,
          value: table.name,
          isLeaf: true
        }))
      })),
    [databases]
  );

  const cascaderValue =
    value.databaseName && value.tableName
      ? [value.databaseName, value.tableName]
      : undefined;
  const currentQueryMode = value.queryMode || 'selected';
  const trimmedSql = value.sql?.trim() || '';
  const canTriggerSqlAction = !!trimmedSql;

  useEffect(() => {
    if (!value.queryMode) {
      onChange({
        ...value,
        queryMode: 'selected'
      });
      form.setFieldValue(`${fieldPrefix}QueryMode`, 'selected');
    }
  }, [fieldPrefix, form, onChange, value]);

  const executeTestSql = async () => {
    if (!trimmedSql) return;
    const validation = validateCustomSql(trimmedSql);
    if (!validation.valid) {
      Message.warning(validation.message || 'SQL校验失败');
      return;
    }
    if (!value.connectorId) {
      Message.warning('请先选择数据源链接');
      return;
    }
    setTestLoading(true);
    try {
      const response = await connectorTestFinkSQL({
        id: value.connectorId,
        sql: trimmedSql
      });
      const passed =
        isSuccessResponse(response) && response.data?.status === 'succeed';
      const message =
        response.data?.message ||
        response.message ||
        (passed ? '测试通过' : '测试失败');
      setSqlActionResult({
        type: 'test',
        status: passed ? 'succeed' : 'failed',
        message
      });
    } catch (error) {
      console.error('测试 SQL 失败:', error);
      setSqlActionResult({
        type: 'test',
        status: 'failed',
        message: '测试失败，请稍后重试'
      });
    } finally {
      setTestLoading(false);
    }
  };

  const executeParseSqlColumns = async () => {
    if (!trimmedSql) return;
    const validation = validateCustomSql(trimmedSql);
    if (!validation.valid) {
      Message.warning(validation.message || 'SQL校验失败');
      return;
    }
    if (!value.connectorId) {
      Message.warning('请先选择数据源链接');
      return;
    }
    setParseLoading(true);
    try {
      const response = await connectorAnalyseFinkSQLColumns({
        id: value.connectorId,
        sql: trimmedSql
      });
      const columns = response.data?.columns || [];
      const succeeded = isSuccessResponse(response);
      const message = response.message || (succeeded ? '解析成功' : '解析失败');
      setSqlActionResult({
        type: 'parse',
        status: succeeded ? 'succeed' : 'failed',
        message,
        columns
      });
      if (succeeded) {
        onSqlColumnsParsed?.(columns);
      }
    } catch (error) {
      console.error('解析 SQL 字段失败:', error);
      setSqlActionResult({
        type: 'parse',
        status: 'failed',
        message: '解析失败，请稍后重试',
        columns: []
      });
    } finally {
      setParseLoading(false);
    }
  };

  const handleConnectorChange = (connectorId?: number | string) => {
    const numeric =
      connectorId === undefined || connectorId === null || connectorId === ''
        ? NaN
        : Number(connectorId);
    const normalizedConnectorId = Number.isFinite(numeric)
      ? numeric
      : undefined;
    const connector = connectors.find(
      (item) =>
        normalizedConnectorId !== undefined &&
        Number(item.id) === normalizedConnectorId
    );
    const nextValue: SqlSourceDataInfo = {
      ...value,
      connectorId: normalizedConnectorId,
      connectorName: connector?.name,
      connectorSubtype: connector?.subtype,
      databaseName: undefined,
      tableName: undefined
    };
    onChange(nextValue);
    form.setFieldsValue({
      [`${fieldPrefix}Connector`]: normalizedConnectorId,
      [`${fieldPrefix}DatabaseTable`]: undefined
    });
  };

  const handleDatabaseTableChange = (selected?: string[]) => {
    const databaseName = selected?.[0];
    const tableName = selected?.[1];
    const nextValue = {
      ...value,
      databaseName,
      tableName
    };
    onChange(nextValue);
    form.setFieldValue(
      `${fieldPrefix}DatabaseTable`,
      databaseName && tableName ? `${databaseName}/${tableName}` : undefined
    );
    if (value.connectorId && databaseName && tableName) {
      onTableSelected?.({
        connectorId: value.connectorId,
        databaseName,
        tableName
      });
    }
  };

  return (
    <>
      <FormItem
        label="数据源链接"
        field={`${fieldPrefix}Connector`}
        rules={[{ required: true, message: '请选择数据源链接' }]}
      >
        <Select
          placeholder="请选择数据源链接"
          loading={connectorsLoading}
          value={value.connectorId}
          onChange={handleConnectorChange}
          options={connectors.map((connector) => ({
            label: connector.subtype
              ? `${connector.name} (${connector.subtype})`
              : connector.name,
            value: connector.id
          }))}
          allowClear
        />
      </FormItem>

      <FormItem
        label="数据表"
        field={`${fieldPrefix}QueryMode`}
        initialValue="selected"
        rules={[{ required: true }]}
      >
        <Radio.Group
          value={currentQueryMode}
          onChange={(queryMode) =>
            onChange({
              ...value,
              queryMode,
              databaseName:
                queryMode === 'sql' ? undefined : value.databaseName,
              tableName: queryMode === 'sql' ? undefined : value.tableName
            })
          }
        >
          <Radio value="selected">选择数据表</Radio>
          <Radio value="sql">自定义SQL</Radio>
        </Radio.Group>
      </FormItem>

      {currentQueryMode === 'sql' ? (
        <FormItem label=" " field={`${fieldPrefix}Sql`}>
          <div className={styles['sql-editor-wrapper']}>
            <div className={styles['sql-editor-toolbar']}>
              <span className={styles['sql-editor-toolbar-title']}>
                自定义SQL
              </span>
              <Space size={8}>
                <Tooltip
                  content={!canTriggerSqlAction ? '请先输入自定义SQL' : ''}
                >
                  <span>
                    <Button
                      type="text"
                      size="small"
                      loading={testLoading}
                      disabled={!canTriggerSqlAction}
                      onClick={executeTestSql}
                    >
                      测试
                    </Button>
                  </span>
                </Tooltip>
                <Tooltip
                  content={!canTriggerSqlAction ? '请先输入自定义SQL' : ''}
                >
                  <span>
                    <Button
                      type="text"
                      size="small"
                      loading={parseLoading}
                      disabled={!canTriggerSqlAction}
                      onClick={executeParseSqlColumns}
                    >
                      解析字段
                    </Button>
                  </span>
                </Tooltip>
              </Space>
            </div>
            <TextArea
              placeholder="请输入自定义SQL，例如 SELECT line_id,voltage_level,maint_org FROM ods_line_assets"
              value={value.sql}
              autoSize={{ minRows: 6 }}
              onChange={(sql) => {
                onChange({ ...value, sql });
                setSqlActionResult(null);
              }}
            />
            {sqlActionResult && (
              <div className={styles['sql-action-result']}>
                <div className={styles['sql-action-result-header']}>
                  <span>
                    {sqlActionResult.type === 'test' ? '测试结果' : '解析结果'}
                  </span>
                  <span
                    className={
                      sqlActionResult.status === 'succeed'
                        ? styles['sql-action-result-success']
                        : styles['sql-action-result-failed']
                    }
                  >
                    {sqlActionResult.status === 'succeed' ? '通过' : '失败'}
                  </span>
                </div>
                <div className={styles['sql-action-result-message']}>
                  {sqlActionResult.message}
                </div>
                {sqlActionResult.type === 'parse' && (
                  <div className={styles['sql-action-result-columns']}>
                    {(sqlActionResult.columns || []).length > 0
                      ? (sqlActionResult.columns || []).join(', ')
                      : '-'}
                  </div>
                )}
              </div>
            )}
          </div>
        </FormItem>
      ) : (
        <FormItem
          label=" "
          field={`${fieldPrefix}DatabaseTable`}
          rules={[{ message: '请选择数据表' }]}
        >
          <Cascader
            placeholder="请选择数据表"
            loading={tablesLoading}
            value={cascaderValue}
            options={tableOptions}
            onChange={(selected) =>
              handleDatabaseTableChange(selected as string[] | undefined)
            }
            filterOption={filterCascaderOption}
            allowClear
            showSearch
            dropdownMenuClassName={styles['object-type-cascader-dropdown']}
            renderFormat={(valueShow) => valueShow.join('/')}
          />
        </FormItem>
      )}
    </>
  );
}
