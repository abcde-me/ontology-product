import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Cascader,
  Form,
  Message,
  Radio,
  Select,
  Space,
  Table,
  Tooltip
} from '@arco-design/web-react';
import { IconDown } from '@arco-design/web-react/icon';
import {
  connectorAnalyseFinkSQLColumns,
  connectorTestFinkSQL
} from '@/api/ontologySceneLibrary/objectType';
import {
  fetchOntologySqlConnectors,
  fetchSqlConnectorDatabaseTables,
  formatSqlConnectorSelectLabel
} from '@/pages/ontologyScene/modules/objectType/services/ontologySqlConnectorService';
import { useUserInfoStore } from '@/store/userInfoStore';
import {
  ConnectorAnalyseFinkSqlColumnItem,
  SqlConnectorDatabaseItem,
  SqlConnectorItem
} from '@/types/objectType';
import { normalizeConnectorAnalyseFinkSqlColumns } from '../../ObjectTypeFormUtils/attributeFields';
import { normalizeSqlConnectorId } from '../../ObjectTypeFormUtils/normalizeSqlConnectorId';
import {
  SqlSourceDataInfo,
  SyncSourceDataStrategyFormState
} from '../../ObjectTypeFormUtils/types';
import {
  sqlSourceDataInfoToSourceDataInfoForTest,
  syncFormStateToOntologyTestSyncStrategy
} from '../../ObjectTypeFormUtils/ontologyTestFinkSQLPayload';

const FormItem = Form.Item;

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
    > & {
      projectID: string;
    }
  ) => void;
  onSqlColumnsParsed?: (columns: ConnectorAnalyseFinkSqlColumnItem[]) => void;
  fieldPrefix: string;
  styles: Record<string, string>;
  /** OntologyTestFinkSQL.taskType，如 TABLE_REALTIME_SYNC / RELATION_REALTIME_SYNC */
  ontologySqlTestTaskType: string;
  /** 第三步 / 链接中间表同步时传入；建模第二步不传 */
  syncSourceDataStrategyForSqlTest?: SyncSourceDataStrategyFormState;
  readOnly?: boolean;
}

function isSuccessResponse(response: any): boolean {
  return (
    response &&
    (response.status === 200 || response.stat === 0 || response.status === 0) &&
    (response.code === '' || response.code === undefined || response.code === 0)
  );
}

/** 从 OntologyTestFinkSQL 返回体中尽量提取列信息（字段名与解析接口对齐） */
function extractTestFinkSqlResultColumns(
  data: unknown
): ConnectorAnalyseFinkSqlColumnItem[] | undefined {
  if (!data || typeof data !== 'object') return undefined;
  const d = data as Record<string, unknown>;
  const raw = d.columns ?? d.columnList ?? d.fields;
  if (!Array.isArray(raw) || raw.length === 0) return undefined;
  return normalizeConnectorAnalyseFinkSqlColumns(raw);
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
  styles,
  ontologySqlTestTaskType,
  syncSourceDataStrategyForSqlTest,
  readOnly = false
}: SqlSourceSelectorProps) {
  const getEffectiveProjectId = useUserInfoStore(
    (state) => state.getEffectiveProjectId
  );
  const projectID = getEffectiveProjectId();
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
    columns?: ConnectorAnalyseFinkSqlColumnItem[];
  } | null>(null);
  const [sqlOverlayExpanded, setSqlOverlayExpanded] = useState(true);

  useEffect(() => {
    if (sqlActionResult) {
      setSqlOverlayExpanded(true);
    }
  }, [sqlActionResult]);

  const parsedColumnTableColumns = useMemo(
    () => [
      { title: '字段名', dataIndex: 'columnName', width: 160 },
      { title: '类型', dataIndex: 'columnType', width: 140 },
      {
        title: '来源表',
        dataIndex: 'columnTable',
        render: (v: string | undefined) => v || '-'
      }
    ],
    []
  );

  useEffect(() => {
    const loadConnectors = async () => {
      setConnectorsLoading(true);
      try {
        const items = await fetchOntologySqlConnectors();
        setConnectors(items);
      } catch (error) {
        console.error('加载数据源连接失败:', error);
        Message.error('加载数据源连接失败');
        setConnectors([]);
      } finally {
        setConnectorsLoading(false);
      }
    };

    loadConnectors();
  }, []);

  const fetchDatabaseTables = useCallback(async () => {
    const id = normalizeSqlConnectorId(value.connectorId);
    if (id === undefined) {
      setDatabases([]);
      return;
    }
    if (!projectID) {
      setDatabases([]);
      return;
    }

    setTablesLoading(true);
    try {
      const databases = await fetchSqlConnectorDatabaseTables({
        connectorId: id,
        projectID
      });
      setDatabases(databases);
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

  useEffect(() => {
    const connectorId = normalizeSqlConnectorId(value.connectorId);
    if (
      connectorId === undefined ||
      value.connectorSubtype ||
      !connectors.length
    ) {
      return;
    }
    const connector = connectors.find(
      (item) => Number(item.id) === connectorId
    );
    if (!connector?.subtype) {
      return;
    }
    onChange({
      ...value,
      connectorName: connector.name,
      connectorSubtype: connector.subtype
    });
  }, [
    connectors,
    onChange,
    value.connectorId,
    value.connectorSubtype,
    value.databaseName,
    value.tableName,
    value.projectID,
    value.queryMode,
    value.sql
  ]);

  useEffect(() => {
    const normalized = normalizeSqlConnectorId(value.connectorId);
    if (normalized === value.connectorId) {
      return;
    }
    onChange({ ...value, connectorId: normalized });
    form.setFieldValue(`${fieldPrefix}Connector`, normalized);
  }, [value.connectorId]);

  useEffect(() => {
    const connectorId = normalizeSqlConnectorId(value.connectorId);
    if (connectorId !== undefined) {
      return;
    }
    if (!value.databaseName && !value.tableName) {
      return;
    }

    onChange({
      ...value,
      databaseName: undefined,
      tableName: undefined
    });
    form.setFieldValue(`${fieldPrefix}DatabaseTable`, undefined);
  }, [
    fieldPrefix,
    form,
    onChange,
    value.connectorId,
    value.databaseName,
    value.tableName
  ]);

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

  const connectorId = normalizeSqlConnectorId(value.connectorId);
  const cascaderValue =
    connectorId !== undefined && value.databaseName && value.tableName
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
    if (readOnly) return;
    if (!trimmedSql) return;
    const validation = validateCustomSql(trimmedSql);
    if (!validation.valid) {
      Message.warning(validation.message || 'SQL校验失败');
      return;
    }
    const sourceForTest = syncSourceDataStrategyForSqlTest
      ? syncSourceDataStrategyForSqlTest.sourceDataInfo
      : value;
    const baseSourceDataInfo =
      sqlSourceDataInfoToSourceDataInfoForTest(sourceForTest);
    if (!baseSourceDataInfo) {
      Message.warning('请先选择数据源连接');
      return;
    }
    if (!projectID) {
      Message.warning('项目信息缺失，请重新登录后重试');
      return;
    }
    const testSourceDataInfo = {
      ...baseSourceDataInfo,
      queryMode: 'sql' as const,
      sql: trimmedSql
    };
    setTestLoading(true);
    try {
      const response = await connectorTestFinkSQL({
        projectID,
        sourceDataInfo: testSourceDataInfo,
        taskType: ontologySqlTestTaskType,
        ...(syncSourceDataStrategyForSqlTest
          ? {
              syncSourceDataStrategy: syncFormStateToOntologyTestSyncStrategy(
                syncSourceDataStrategyForSqlTest,
                testSourceDataInfo
              )
            }
          : {})
      });
      const passed =
        isSuccessResponse(response) && response.data?.status === 'succeed';
      const message =
        response.data?.message ||
        response.message ||
        (passed ? '测试通过' : '测试失败');
      const testColumns = extractTestFinkSqlResultColumns(response.data);
      setSqlActionResult({
        type: 'test',
        status: passed ? 'succeed' : 'failed',
        message,
        ...(testColumns && testColumns.length > 0
          ? { columns: testColumns }
          : {})
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
    if (readOnly) return;
    if (!trimmedSql) return;
    const validation = validateCustomSql(trimmedSql);
    if (!validation.valid) {
      Message.warning(validation.message || 'SQL校验失败');
      return;
    }
    if (!value.connectorId) {
      Message.warning('请先选择数据源连接');
      return;
    }
    setParseLoading(true);
    try {
      const response = await connectorAnalyseFinkSQLColumns({
        id: value.connectorId,
        sql: trimmedSql
      });
      const rawList = response.data?.columns;
      const rawArray = Array.isArray(rawList) ? rawList : [];
      const columns = normalizeConnectorAnalyseFinkSqlColumns(rawArray);
      const succeeded = isSuccessResponse(response);
      const message = response.message || (succeeded ? '解析成功' : '解析失败');
      setSqlActionResult({
        type: 'parse',
        status: succeeded ? 'succeed' : 'failed',
        message,
        columns
      });
      if (succeeded) {
        Message.success('解析字段成功');
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
    const normalizedConnectorId = normalizeSqlConnectorId(connectorId);
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
    const connectorId = normalizeSqlConnectorId(value.connectorId);
    if (connectorId === undefined) {
      return;
    }
    const databaseName = selected?.[0];
    const tableName = selected?.[1];
    const nextValue = {
      ...value,
      connectorId,
      databaseName,
      tableName,
      projectID
    };
    onChange(nextValue);
    form.setFieldValue(
      `${fieldPrefix}DatabaseTable`,
      databaseName && tableName ? [databaseName, tableName] : undefined
    );
    if (databaseName && tableName && projectID) {
      onTableSelected?.({
        connectorId,
        databaseName,
        tableName,
        projectID
      });
    }
  };

  return (
    <>
      <FormItem
        label="数据源连接"
        field={`${fieldPrefix}Connector`}
        rules={[{ required: true, message: '请选择数据源连接' }]}
      >
        <Select
          className={styles['modeling-borderless-control']}
          placeholder="请选择数据源连接"
          loading={connectorsLoading}
          value={normalizeSqlConnectorId(value.connectorId)}
          onChange={handleConnectorChange}
          options={connectors.map((connector) => ({
            label: formatSqlConnectorSelectLabel(
              connector.name,
              connector.subtype
            ),
            value: connector.id
          }))}
          allowClear
          showSearch
          disabled={readOnly}
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
          disabled={readOnly}
        >
          <Radio value="selected">选择数据表</Radio>
          <Radio value="sql">自定义SQL</Radio>
        </Radio.Group>
      </FormItem>

      {currentQueryMode === 'sql' ? (
        <FormItem label=" " field={`${fieldPrefix}Sql`}>
          <div className={styles['sql-custom-sql-card']}>
            <div className={styles['sql-custom-sql-toolbar']}>
              <span className={styles['sql-custom-sql-toolbar-title']}>
                自定义SQL
              </span>
              <Space size={8}>
                <Tooltip
                  content={!canTriggerSqlAction ? '请先输入自定义SQL' : ''}
                >
                  {/* <span>
                    <Button
                      type="text"
                      size="small"
                      loading={testLoading}
                      disabled={readOnly || !canTriggerSqlAction}
                      onClick={executeTestSql}
                    >
                      测试
                    </Button>
                  </span> */}
                </Tooltip>
                <Tooltip
                  content={
                    !canTriggerSqlAction
                      ? '请先输入自定义SQL'
                      : readOnly
                        ? ''
                        : '识别SQL中的字段，并填入实例同步映射表格中'
                  }
                >
                  <span>
                    <Button
                      type="text"
                      size="small"
                      loading={parseLoading}
                      disabled={readOnly || !canTriggerSqlAction}
                      onClick={executeParseSqlColumns}
                    >
                      解析字段
                    </Button>
                  </span>
                </Tooltip>
              </Space>
            </div>
            <div className={styles['sql-custom-sql-body']}>
              <textarea
                className={styles['sql-custom-sql-input']}
                placeholder="请输入自定义SQL，例如 SELECT line_id,voltage_level,maint_org FROM ods_line_assets"
                value={value.sql ?? ''}
                spellCheck={false}
                readOnly={readOnly}
                onChange={(e) => {
                  if (readOnly) return;
                  onChange({ ...value, sql: e.target.value });
                  setSqlActionResult(null);
                  setSqlOverlayExpanded(true);
                }}
              />
              {sqlActionResult && (
                <div
                  className={`${styles['sql-custom-sql-overlay']}${
                    !sqlOverlayExpanded
                      ? ` ${styles['sql-custom-sql-overlay--collapsed']}`
                      : ''
                  }`}
                >
                  <button
                    type="button"
                    className={styles['sql-custom-sql-overlay-header']}
                    onClick={() =>
                      setSqlOverlayExpanded((expanded) => !expanded)
                    }
                  >
                    <span
                      className={styles['sql-custom-sql-overlay-header-left']}
                    >
                      <IconDown
                        className={`${styles['sql-custom-sql-overlay-chevron']}${
                          !sqlOverlayExpanded
                            ? ` ${styles['sql-custom-sql-overlay-chevron-collapsed']}`
                            : ''
                        }`}
                      />
                      <span className={styles['sql-custom-sql-overlay-title']}>
                        {sqlActionResult.type === 'test'
                          ? '测试结果'
                          : '解析结果'}
                      </span>
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
                  </button>
                  {sqlOverlayExpanded && (
                    <div className={styles['sql-custom-sql-overlay-body']}>
                      {!!sqlActionResult.message && (
                        <div
                          className={`${styles['sql-action-result-message']} ${styles['sql-custom-sql-overlay-message']}`}
                        >
                          {sqlActionResult.message}
                        </div>
                      )}
                      {sqlActionResult.status === 'succeed' &&
                        (sqlActionResult.columns?.length ?? 0) > 0 && (
                          <Table
                            className={styles['sql-parse-result-table']}
                            size="small"
                            stripe
                            pagination={false}
                            rowKey="columnName"
                            columns={parsedColumnTableColumns}
                            data={sqlActionResult.columns}
                          />
                        )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </FormItem>
      ) : (
        <FormItem
          label=" "
          field={`${fieldPrefix}DatabaseTable`}
          rules={[
            {
              required: currentQueryMode === 'selected',
              message: '请选择数据表'
            }
          ]}
        >
          <Cascader
            className={styles['modeling-borderless-control']}
            placeholder={
              connectorId !== undefined ? '请选择数据表' : '请先选择数据源连接'
            }
            loading={tablesLoading}
            value={cascaderValue}
            options={tableOptions}
            onChange={(selected) =>
              handleDatabaseTableChange(selected as string[] | undefined)
            }
            filterOption={filterCascaderOption}
            allowClear
            showSearch
            disabled={readOnly || connectorId === undefined}
            dropdownMenuClassName={styles['object-type-cascader-dropdown']}
            renderFormat={(valueShow) => valueShow.join('/')}
          />
        </FormItem>
      )}
    </>
  );
}
