import React, { useEffect, useState } from 'react';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Message,
  Popover,
  Radio,
  Space,
  Tooltip
} from '@arco-design/web-react';
import { IconDown, IconQuestionCircle } from '@arco-design/web-react/icon';
import { connectorTestFinkSQL } from '@/api/ontologySceneLibrary/objectType';
import { useUserInfoStore } from '@/store/userInfoStore';
import { SyncSourceDataStrategyFormState } from '../../ObjectTypeFormUtils/types';
import {
  sqlSourceDataInfoToSourceDataInfoForTest,
  syncFormStateToOntologyTestSyncStrategy
} from '../../ObjectTypeFormUtils/ontologyTestFinkSQLPayload';
import { syncScopeRequiresIncrementalPollingFields } from '../../ObjectTypeFormUtils/syncScopeRequiresIncrementalPollingFields';
import {
  isIcebergConnectorSubtype,
  normalizeDatabaseSyncStrategyFields
} from './instanceSyncStrategyConfig';

const FormItem = Form.Item;

type SyncSqlType = 'full' | 'increment';

export const STRATEGY_FORM_FIELD_MAP: Partial<
  Record<keyof SyncSourceDataStrategyFormState, string>
> = {
  mode: 'syncMode',
  conflictStrategy: 'conflictStrategy',
  syncScope: 'syncScope',
  pollFetchSize: 'pollFetchSize',
  parallelism: 'parallelism',
  exceptionStrategy: 'exceptionStrategy',
  jdbcCheckpointField: 'jdbcCheckpointField',
  jdbcIncrementalTimeField: 'jdbcIncrementalTimeField',
  jdbcPollingIntervalSeconds: 'jdbcPollingIntervalSeconds',
  jdbcSyncSqlFull: 'jdbcSyncSqlFull',
  jdbcSyncSqlIncrement: 'jdbcSyncSqlIncrement'
};

/** 将策略 state 写入 Form 字段，与 InstanceSyncStep.updateStrategy 一致 */
export function syncStrategyStateToFormValues(
  state: SyncSourceDataStrategyFormState
): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  (
    Object.entries(STRATEGY_FORM_FIELD_MAP) as [
      keyof SyncSourceDataStrategyFormState,
      string
    ][]
  ).forEach(([stateKey, formKey]) => {
    const value = state[stateKey];
    if (value !== undefined) {
      values[formKey] = value;
    }
  });
  return values;
}

function isSuccessResponse(response: any): boolean {
  return (
    response &&
    (response.status === 200 || response.status === 0) &&
    (response.code === '' || response.code === 0 || response.code === undefined)
  );
}

function validateSyncSql(sqlText: string): string | undefined {
  const sql = sqlText.trim().replace(/;+\s*$/g, '');
  if (!sql) {
    return '请先输入SQL';
  }
  if (!/^(select|with)\b/i.test(sql)) {
    return 'SQL只支持查询操作，最外层仅支持SELECT语句';
  }
  return undefined;
}

export interface SyncSourceDataStrategyFormSectionProps {
  styles: Record<string, string>;
  syncSourceDataStrategy: SyncSourceDataStrategyFormState;
  onStrategyUpdate: (updates: Partial<SyncSourceDataStrategyFormState>) => void;
  /** 同步模式说明 Popover 内容 */
  syncModePopover?: React.ReactNode;
  /** 单次拉取数量说明 Popover 内容 */
  pollFetchSizePopover?: React.ReactNode;
  /** 全量 SQL 占位符 */
  fullSqlPlaceholder?: string;
  /** 增量 SQL 占位符 */
  incrementSqlPlaceholder?: string;
  /** connectorTestFinkSQL.taskType */
  sqlTestTaskType?: string;
  readOnly?: boolean;
}

const DEFAULT_SYNC_MODE_POPOVER = '选择实例数据同步的触发方式';
const DEFAULT_POLL_FETCH_POPOVER = '单次从数据源拉取的最大实例数量';

export default function SyncSourceDataStrategyFormSection({
  styles,
  syncSourceDataStrategy,
  onStrategyUpdate,
  syncModePopover = DEFAULT_SYNC_MODE_POPOVER,
  pollFetchSizePopover = DEFAULT_POLL_FETCH_POPOVER,
  fullSqlPlaceholder = '请输入全量SQL，例如 SELECT line_id,voltage_level,maint_org FROM ods_line_assets',
  incrementSqlPlaceholder = '增量 SQL 需要至少包含一个断点占位符：${last_update_time} 或 ${last_checkpoint_value}。使用 ${last_update_time} 时，请填写“增量时间列”；使用 ${last_checkpoint_value}时，请填写“断点辅助列”。${batch_size} 可选，通常写在 LIMIT ${batch_size} 中，用于控制单次拉取条数；如果使用 LIMIT ${batch_size}，建议同时写 ORDER BY，保证每轮拉取顺序稳定。推荐同时使用时间列和断点辅助列，例如：WHERE update_time > ${last_update_time} OR (update_time = ${last_update_time} AND id > ${last_checkpoint_value}) ORDER BY update_time, id LIMIT ${batch_size}。',
  sqlTestTaskType = 'TABLE_REALTIME_SYNC',
  readOnly = false
}: SyncSourceDataStrategyFormSectionProps) {
  const currentProjectID = useUserInfoStore((state) => state.projectId?.[1]);
  const [sqlTestLoading, setSqlTestLoading] = useState<
    Record<SyncSqlType, boolean>
  >({
    full: false,
    increment: false
  });
  const [sqlTestResult, setSqlTestResult] = useState<
    Partial<
      Record<
        SyncSqlType,
        {
          status: 'succeed' | 'failed';
          message: string;
        }
      >
    >
  >({});
  const [sqlTestOverlayExpanded, setSqlTestOverlayExpanded] = useState<
    Record<SyncSqlType, boolean>
  >({
    full: true,
    increment: true
  });

  useEffect(() => {
    if (sqlTestResult.full) {
      setSqlTestOverlayExpanded((prev) => ({ ...prev, full: true }));
    }
  }, [sqlTestResult.full]);

  useEffect(() => {
    if (sqlTestResult.increment) {
      setSqlTestOverlayExpanded((prev) => ({ ...prev, increment: true }));
    }
  }, [sqlTestResult.increment]);

  const connectorSubtype =
    syncSourceDataStrategy.sourceDataInfo?.connectorSubtype;
  const isIcebergConnector = isIcebergConnectorSubtype(connectorSubtype);

  useEffect(() => {
    const patches = normalizeDatabaseSyncStrategyFields(
      { mode: syncSourceDataStrategy.mode },
      connectorSubtype
    );
    if (!Object.keys(patches).length) {
      return;
    }
    onStrategyUpdate(patches);
  }, [connectorSubtype, syncSourceDataStrategy.mode, onStrategyUpdate]);

  const currentQueryMode =
    syncSourceDataStrategy.sourceDataInfo.queryMode || 'selected';
  const isPollingMode = syncSourceDataStrategy.mode === 'JDBC_POLLING';
  const isSqlPolling = currentQueryMode === 'sql' && isPollingMode;
  const incrementalPollingFieldsRequired =
    syncScopeRequiresIncrementalPollingFields(syncSourceDataStrategy);

  const executeTestSyncSql = async (type: SyncSqlType) => {
    if (readOnly) return;
    const sql =
      type === 'full'
        ? syncSourceDataStrategy.jdbcSyncSqlFull || ''
        : syncSourceDataStrategy.jdbcSyncSqlIncrement || '';
    const validationMessage = validateSyncSql(sql);
    if (validationMessage) {
      Message.warning(validationMessage);
      return;
    }
    const connectorId = syncSourceDataStrategy.sourceDataInfo.connectorId;
    if (!connectorId) {
      Message.warning('请先选择数据源链接');
      return;
    }
    if (!currentProjectID) {
      Message.warning('项目信息缺失，请重新登录后重试');
      return;
    }

    const rawSourceDataInfo = sqlSourceDataInfoToSourceDataInfoForTest(
      syncSourceDataStrategy.sourceDataInfo
    );
    if (!rawSourceDataInfo) {
      Message.warning('请先选择数据源链接');
      return;
    }
    const sourceDataInfo = {
      ...rawSourceDataInfo,
      sql: undefined
    };

    setSqlTestLoading((prev) => ({ ...prev, [type]: true }));
    try {
      const response = await connectorTestFinkSQL({
        projectID: currentProjectID,
        sourceDataInfo,
        taskType: sqlTestTaskType,
        syncSourceDataStrategy: syncFormStateToOntologyTestSyncStrategy(
          syncSourceDataStrategy,
          sourceDataInfo
        )
      });
      const passed =
        isSuccessResponse(response) && response.data?.status === 'succeed';
      const message =
        response.data?.message ||
        response.message ||
        (passed ? '测试通过' : '测试失败');
      setSqlTestResult((prev) => ({
        ...prev,
        [type]: {
          status: passed ? 'succeed' : 'failed',
          message
        }
      }));
    } catch (error) {
      console.error('测试同步 SQL 失败:', error);
      setSqlTestResult((prev) => ({
        ...prev,
        [type]: {
          status: 'failed',
          message: '测试失败，请稍后重试'
        }
      }));
    } finally {
      setSqlTestLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const renderSyncSqlEditor = (
    type: SyncSqlType,
    title: string,
    field: 'jdbcSyncSqlFull' | 'jdbcSyncSqlIncrement',
    placeholder: string,
    required = false
  ) => {
    const value = syncSourceDataStrategy[field] || '';
    const result = sqlTestResult[type];
    const canTest = !!value.trim();

    const overlayExpanded = sqlTestOverlayExpanded[type];

    return (
      <FormItem key={field} label=" " required={required}>
        <div className={styles['sql-custom-sql-card']}>
          <div className={styles['sql-custom-sql-toolbar']}>
            <span className={styles['sql-custom-sql-toolbar-title']}>
              {title}
            </span>
            <Space size={8}>
              <Tooltip content={!canTest ? `请先输入${title}` : ''}>
                {/* <span>
                  <Button
                    type="text"
                    size="small"
                    loading={sqlTestLoading[type]}
                    disabled={readOnly || !canTest}
                    onClick={() => executeTestSyncSql(type)}
                  >
                    测试
                  </Button>
                </span> */}
              </Tooltip>
            </Space>
          </div>
          <div className={styles['sql-custom-sql-body']}>
            <textarea
              className={styles['sql-custom-sql-input']}
              placeholder={placeholder}
              value={value}
              spellCheck={false}
              readOnly={readOnly}
              onChange={(e) => {
                if (readOnly) return;
                const sql = e.target.value;
                onStrategyUpdate(
                  field === 'jdbcSyncSqlFull'
                    ? { jdbcSyncSqlFull: sql }
                    : { jdbcSyncSqlIncrement: sql }
                );
                setSqlTestResult((prev) => ({ ...prev, [type]: undefined }));
                setSqlTestOverlayExpanded((prev) => ({
                  ...prev,
                  [type]: true
                }));
              }}
            />
            {result && (
              <div
                className={`${styles['sql-custom-sql-overlay']}${
                  !overlayExpanded
                    ? ` ${styles['sql-custom-sql-overlay--collapsed']}`
                    : ''
                }`}
              >
                <button
                  type="button"
                  className={styles['sql-custom-sql-overlay-header']}
                  onClick={() =>
                    setSqlTestOverlayExpanded((prev) => ({
                      ...prev,
                      [type]: !prev[type]
                    }))
                  }
                >
                  <span
                    className={styles['sql-custom-sql-overlay-header-left']}
                  >
                    <IconDown
                      className={`${styles['sql-custom-sql-overlay-chevron']}${
                        !overlayExpanded
                          ? ` ${styles['sql-custom-sql-overlay-chevron-collapsed']}`
                          : ''
                      }`}
                    />
                    <span className={styles['sql-custom-sql-overlay-title']}>
                      测试结果
                    </span>
                  </span>
                  <span
                    className={
                      result.status === 'succeed'
                        ? styles['sql-action-result-success']
                        : styles['sql-action-result-failed']
                    }
                  >
                    {result.status === 'succeed' ? '通过' : '失败'}
                  </span>
                </button>
                {overlayExpanded && (
                  <div className={styles['sql-custom-sql-overlay-body']}>
                    {!!result.message && (
                      <div
                        className={`${styles['sql-action-result-message']} ${styles['sql-custom-sql-overlay-message']}`}
                      >
                        {result.message}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </FormItem>
    );
  };

  return (
    <>
      <FormItem
        label={
          <span className="inline-flex items-center gap-[4px]">
            同步模式
            <Popover content={syncModePopover}>
              <IconQuestionCircle className="cursor-pointer text-[#86909C]" />
            </Popover>
          </span>
        }
        required
      >
        <Radio.Group
          value={syncSourceDataStrategy.mode}
          onChange={(mode) => onStrategyUpdate({ mode })}
          disabled={readOnly}
        >
          <Radio value="BINLOG_CDC" disabled={readOnly || isIcebergConnector}>
            CDC
          </Radio>
          <Radio value="JDBC_POLLING">轮询</Radio>
        </Radio.Group>
      </FormItem>

      {isSqlPolling && (
        <>
          {renderSyncSqlEditor(
            'full',
            '全量SQL',
            'jdbcSyncSqlFull',
            fullSqlPlaceholder
          )}
          {renderSyncSqlEditor(
            'increment',
            '增量SQL',
            'jdbcSyncSqlIncrement',
            incrementSqlPlaceholder,
            incrementalPollingFieldsRequired
          )}
        </>
      )}

      {isPollingMode && (
        <>
          <FormItem label="轮询间隔" required>
            <Space size={8}>
              <InputNumber
                min={1}
                step={1}
                value={syncSourceDataStrategy.jdbcPollingIntervalSeconds}
                disabled={readOnly}
                onChange={(jdbcPollingIntervalSeconds) =>
                  onStrategyUpdate({
                    jdbcPollingIntervalSeconds:
                      Number(jdbcPollingIntervalSeconds) || 1
                  })
                }
              />
              <span>秒</span>
            </Space>
          </FormItem>

          <FormItem
            label={
              <span className="inline-flex items-center gap-[4px]">
                单次拉取数量
                <Popover content={pollFetchSizePopover}>
                  <IconQuestionCircle className="cursor-pointer text-[#86909C]" />
                </Popover>
              </span>
            }
            required
          >
            <InputNumber
              min={1}
              step={1}
              value={syncSourceDataStrategy.pollFetchSize}
              disabled={readOnly}
              onChange={(pollFetchSize) =>
                onStrategyUpdate({ pollFetchSize: Number(pollFetchSize) || 1 })
              }
            />
          </FormItem>

          <FormItem
            label="增量时间列"
            required={incrementalPollingFieldsRequired}
          >
            <Input
              placeholder="如update_time, last_modified"
              value={syncSourceDataStrategy.jdbcIncrementalTimeField}
              disabled={readOnly}
              onChange={(jdbcIncrementalTimeField) =>
                onStrategyUpdate({ jdbcIncrementalTimeField })
              }
            />
          </FormItem>

          <FormItem
            label="断点辅助列"
            required={incrementalPollingFieldsRequired}
          >
            <Input
              placeholder="如id、主键或组合列名"
              value={syncSourceDataStrategy.jdbcCheckpointField}
              disabled={readOnly}
              onChange={(jdbcCheckpointField) =>
                onStrategyUpdate({ jdbcCheckpointField })
              }
            />
          </FormItem>
        </>
      )}

      <FormItem label="冲突策略" required>
        <Radio.Group
          value={syncSourceDataStrategy.conflictStrategy}
          onChange={(conflictStrategy) =>
            onStrategyUpdate({ conflictStrategy })
          }
          disabled={readOnly}
        >
          <Radio value="KEEP_SOURCE">保留数据源</Radio>
          <Radio value="KEEP_TARGET">保留目标表</Radio>
        </Radio.Group>
      </FormItem>

      <FormItem label="同步范围" required>
        <Radio.Group
          value={syncSourceDataStrategy.syncScope}
          onChange={(syncScope) => onStrategyUpdate({ syncScope })}
          disabled={readOnly}
        >
          <Radio value="INCREMENTAL">增量</Radio>
          <Radio value="FULL">全量</Radio>
          <Radio value="FULL_THEN_INCREMENTAL">增量+全量</Radio>
        </Radio.Group>
      </FormItem>

      <FormItem label="并行数">
        <InputNumber
          min={1}
          step={1}
          value={syncSourceDataStrategy.parallelism}
          disabled={readOnly}
          onChange={(parallelism) =>
            onStrategyUpdate({ parallelism: Number(parallelism) || 1 })
          }
        />
      </FormItem>

      <FormItem
        label={
          <span className="inline-flex items-center gap-[4px]">
            异常策略
            <Popover content="同步出现异常时的处理方式">
              <IconQuestionCircle className="cursor-pointer text-[#86909C]" />
            </Popover>
          </span>
        }
        required
      >
        <Radio.Group
          value={syncSourceDataStrategy.exceptionStrategy}
          onChange={(exceptionStrategy) =>
            onStrategyUpdate({ exceptionStrategy })
          }
          disabled={readOnly}
        >
          <Radio value="STOP_ON_ERROR">立即停止</Radio>
          <Radio value="LOG_ERROR_AND_CONTINUE">继续消费</Radio>
        </Radio.Group>
      </FormItem>
    </>
  );
}
