import React, { useState } from 'react';
import { GlobalTooltip } from '@ceai-front/arco-material';
import { Tooltip } from '@arco-design/web-react';
import { SqlDetailModal } from '../SqlDetailModal';
import {
  SyncMode,
  ConflictStrategy,
  SyncScope,
  ExceptionStrategy
} from '../CollapsibleSection/types';
import { SyncSourceDataStrategy } from '@/types/objectType';
import { resolveKafkaSyncScopeDisplayLabel } from '@/pages/ontologyScene/modules/objectType/components/ObjectTypeFormSteps/common/KafkaSyncStrategyCommonFields';
import { resolveApiSyncScopeDisplayLabel } from '@/pages/ontologyScene/modules/objectType/components/ObjectTypeFormSteps/common/ApiSyncStrategyCommonFields';
import {
  API_SYNC_MODE,
  isApiPollingMode,
  isApiSyncMode,
  isCsvIncrementalImportScope,
  isCsvSyncMode,
  isKafkaSyncMode,
  resolveCsvImportScopeDisplayLabel,
  resolveSyncModeLabel
} from '@/pages/ontologyScene/modules/objectType/components/ObjectTypeFormSteps/common/instanceSyncStrategyConfig';
import QuestionIcon from '../../assets/question.svg';

interface SyncStrategyInfoProps {
  enableSyncSourceData?: boolean;
  syncSourceDataStrategy?: SyncSourceDataStrategy;
  /** 是否跳过 enableSyncSourceData 检查（用于链接详情等场景） */
  skipEnableCheck?: boolean;
}

export const SyncStrategyInfo: React.FC<SyncStrategyInfoProps> = ({
  enableSyncSourceData,
  syncSourceDataStrategy,
  skipEnableCheck = false
}) => {
  const [sqlModalVisible, setSqlModalVisible] = useState(false);

  const renderField = (
    label: string,
    value: React.ReactNode,
    width = 'w-[418px]',
    tooltip?: string
  ) => {
    return (
      <div className={`flex gap-[8px] ${width}`}>
        <div className="flex w-[110px] flex-shrink-0 items-center gap-[4px] text-[14px] leading-[22px] text-[var(--color-text-4)]">
          <span>{label}</span>
          {tooltip && (
            <Tooltip content={tooltip}>
              <QuestionIcon className="cursor-pointer" />
            </Tooltip>
          )}
          <span>：</span>
        </div>
        <div className="min-w-0 flex-1">
          {typeof value === 'string' ? (
            <GlobalTooltip.Ellipsis
              text={value || '-'}
              className="text-[14px] leading-[22px] text-[var(--color-text-1)]"
            />
          ) : (
            value || (
              <span className="text-[14px] leading-[22px] text-[var(--color-text-1)]">
                -
              </span>
            )
          )}
        </div>
      </div>
    );
  };

  if (!skipEnableCheck && !enableSyncSourceData) {
    return (
      <div className="text-[14px] leading-[22px] text-[var(--color-text-1)]">
        -
      </div>
    );
  }

  if (!syncSourceDataStrategy) {
    return (
      <div className="text-[14px] leading-[22px] text-[var(--color-text-1)]">
        -
      </div>
    );
  }

  const getConflictStrategyText = (strategy?: string) => {
    if (strategy === ConflictStrategy.KEEP_SOURCE || strategy === 'KEEP_SOURCE')
      return '保留数据源';
    if (strategy === ConflictStrategy.KEEP_TARGET || strategy === 'KEEP_TARGET')
      return '保留目标表';
    return strategy || '-';
  };

  const syncMode = syncSourceDataStrategy.mode;
  const isKafkaMode = isKafkaSyncMode(syncMode);
  const isApiMode = isApiSyncMode(syncMode);
  const isCsvMode = isCsvSyncMode(syncMode);
  const isDatabasePollingMode =
    syncMode === SyncMode.JDBC_POLLING || syncMode === 'JDBC_POLLING';
  const isApiPolling = isApiPollingMode(syncMode);
  const isGenericPollingMode = isDatabasePollingMode || isApiPolling;

  const getSyncScopeText = (scope?: string) => {
    if (isKafkaSyncMode(syncMode)) {
      return resolveKafkaSyncScopeDisplayLabel(syncMode, scope);
    }
    if (isApiSyncMode(syncMode)) {
      return resolveApiSyncScopeDisplayLabel(syncMode, scope);
    }
    if (isCsvSyncMode(syncMode)) {
      return resolveCsvImportScopeDisplayLabel(scope);
    }
    if (scope === SyncScope.INCREMENTAL || scope === 'INCREMENTAL')
      return '增量';
    if (scope === SyncScope.FULL || scope === 'FULL') return '全量';
    if (
      scope === SyncScope.FULL_THEN_INCREMENTAL ||
      scope === 'FULL_THEN_INCREMENTAL'
    )
      return '全量+增量';
    return scope || '-';
  };

  const getExceptionStrategyText = (strategy?: string) => {
    if (
      strategy === ExceptionStrategy.STOP_ON_ERROR ||
      strategy === 'STOP_ON_ERROR'
    )
      return '立即停止';
    if (
      strategy === ExceptionStrategy.LOG_ERROR_AND_CONTINUE ||
      strategy === 'LOG_ERROR_AND_CONTINUE'
    )
      return isApiSyncMode(syncMode)
        ? '继续同步'
        : isCsvSyncMode(syncMode)
          ? '继续导入'
          : '继续消费';
    return strategy || '-';
  };

  const queryMode = syncSourceDataStrategy.sourceDataInfo?.queryMode;
  const isSqlMode = queryMode === 'sql';

  const syncModeDisplay =
    isDatabasePollingMode && isSqlMode ? (
      <div className="flex items-center gap-[8px]">
        <span className="text-[14px] leading-[22px] text-[var(--color-text-1)]">
          {resolveSyncModeLabel(syncMode)}
        </span>
        <span
          className="cursor-pointer text-[14px] leading-[22px] text-[rgba(var(--primary-6))] hover:underline"
          onClick={() => setSqlModalVisible(true)}
        >
          SQL详情
        </span>
      </div>
    ) : (
      resolveSyncModeLabel(syncMode)
    );

  const syncModeTooltip = (() => {
    if (syncMode === API_SYNC_MODE.API_PUSH) {
      return '通过 Webhook 实时接收 API 数据';
    }
    if (syncMode === API_SYNC_MODE.API_POLLING) {
      return '按间隔定时调用 API 拉取数据';
    }
    if (syncMode === SyncMode.BINLOG_CDC || syncMode === 'BINLOG_CDC') {
      return '监听数据库变更日志，实时捕获增删改';
    }
    if (isDatabasePollingMode) {
      return '定时执行查询，按配置条件分批拉取数据';
    }
    return undefined;
  })();

  const scopeFieldLabel = isKafkaMode ? '起始位点' : '同步范围';
  const parallelismFieldLabel = isKafkaMode
    ? '消费并行数'
    : isApiMode
      ? '请求并行数'
      : '并行数';

  const commonTail = (
    <>
      <div className="mb-[12px] flex gap-[16px]">
        {renderField(
          scopeFieldLabel,
          getSyncScopeText(syncSourceDataStrategy.syncScope)
        )}
        {renderField(
          parallelismFieldLabel,
          syncSourceDataStrategy.parallelism?.toString()
        )}
      </div>
      <div className="flex gap-[16px]">
        {renderField(
          '异常策略',
          getExceptionStrategyText(syncSourceDataStrategy.exceptionStrategy),
          'w-[418px]',
          '立即停止：出现异常后任务停止，等待人工处理。继续同步：异常数据记录日志，任务继续处理后续数据。'
        )}
      </div>
    </>
  );

  if (isKafkaMode) {
    return (
      <>
        <div className="mb-[12px] flex gap-[16px]">
          {renderField(
            '单次消费批大小',
            syncSourceDataStrategy.pollFetchSize?.toString()
          )}
          {renderField(
            '冲突策略',
            getConflictStrategyText(syncSourceDataStrategy.conflictStrategy)
          )}
        </div>
        <div className="mb-[12px] flex gap-[16px]">
          {renderField(
            '起始位点',
            getSyncScopeText(syncSourceDataStrategy.syncScope)
          )}
          {renderField(
            '消费并行数',
            syncSourceDataStrategy.parallelism?.toString()
          )}
        </div>
        <div className="flex gap-[16px]">
          {renderField(
            '异常策略',
            getExceptionStrategyText(syncSourceDataStrategy.exceptionStrategy),
            'w-[418px]',
            '立即停止：出现异常后任务停止，等待人工处理。继续同步：异常数据记录日志，任务继续处理后续数据。'
          )}
        </div>
      </>
    );
  }

  if (isCsvMode) {
    const isIncrementalImport = isCsvIncrementalImportScope(
      syncSourceDataStrategy.syncScope
    );
    return (
      <>
        <div className="mb-[12px] flex gap-[16px]">
          {renderField(
            '导入范围',
            getSyncScopeText(syncSourceDataStrategy.syncScope)
          )}
        </div>
        {isIncrementalImport && (
          <div className="mb-[12px] flex gap-[16px]">
            {renderField(
              '冲突策略',
              getConflictStrategyText(syncSourceDataStrategy.conflictStrategy)
            )}
          </div>
        )}
        <div className="flex gap-[16px]">
          {renderField(
            '异常策略',
            getExceptionStrategyText(syncSourceDataStrategy.exceptionStrategy),
            'w-[418px]',
            '立即停止：出现异常后任务停止，等待人工处理。继续导入：异常数据记录日志，任务继续处理后续数据。'
          )}
        </div>
      </>
    );
  }

  if (isApiMode && !isApiPolling) {
    return (
      <>
        <div className="mb-[12px] flex gap-[16px]">
          {renderField(
            '同步模式',
            syncModeDisplay,
            'w-[418px]',
            syncModeTooltip
          )}
          {renderField(
            '冲突策略',
            getConflictStrategyText(syncSourceDataStrategy.conflictStrategy)
          )}
        </div>
        <div className="mb-[12px] flex gap-[16px]">
          {renderField(
            '单次接收批大小',
            syncSourceDataStrategy.pollFetchSize?.toString()
          )}
        </div>
        <div className="flex gap-[16px]">
          {renderField(
            '异常策略',
            getExceptionStrategyText(syncSourceDataStrategy.exceptionStrategy),
            'w-[418px]',
            '立即停止：出现异常后任务停止，等待人工处理。继续同步：异常数据记录日志，任务继续处理后续请求。'
          )}
        </div>
      </>
    );
  }

  if (!isGenericPollingMode) {
    return (
      <>
        <div className="mb-[12px] flex gap-[16px]">
          {renderField(
            '同步模式',
            syncModeDisplay,
            'w-[418px]',
            syncModeTooltip
          )}
          {renderField(
            '冲突策略',
            getConflictStrategyText(syncSourceDataStrategy.conflictStrategy)
          )}
        </div>
        {commonTail}
      </>
    );
  }

  return (
    <>
      <div className="mb-[12px] flex gap-[16px]">
        {renderField('同步模式', syncModeDisplay, 'w-[418px]', syncModeTooltip)}
        {renderField(
          isApiPolling ? '拉取间隔' : '轮询间隔',
          syncSourceDataStrategy.jdbcPollingIntervalSeconds
            ? `${syncSourceDataStrategy.jdbcPollingIntervalSeconds}秒`
            : undefined
        )}
      </div>

      <div className="mb-[12px] flex gap-[16px]">
        {renderField(
          '单次拉取数量',
          syncSourceDataStrategy.pollFetchSize?.toString()
        )}
        {isDatabasePollingMode
          ? renderField(
              '增量时间列',
              syncSourceDataStrategy.jdbcIncrementalTimeField
            )
          : renderField(
              '冲突策略',
              getConflictStrategyText(syncSourceDataStrategy.conflictStrategy)
            )}
      </div>

      {isDatabasePollingMode ? (
        <>
          <div className="mb-[12px] flex gap-[16px]">
            {renderField(
              '断点辅助列',
              syncSourceDataStrategy.jdbcCheckpointField
            )}
            {renderField(
              '冲突策略',
              getConflictStrategyText(syncSourceDataStrategy.conflictStrategy)
            )}
          </div>
          {commonTail}
        </>
      ) : isApiPolling ? (
        <>
          <div className="mb-[12px] flex gap-[16px]">
            {renderField(
              '每页大小参数名',
              syncSourceDataStrategy.apiPageSizeParam
            )}
            {renderField('页号参数名', syncSourceDataStrategy.apiPageNumParam)}
          </div>
          <div className="mb-[12px] flex gap-[16px]">
            {renderField(
              '总数参数名',
              syncSourceDataStrategy.apiTotalCountParam
            )}
            {renderField(
              '起始页号',
              syncSourceDataStrategy.apiStartPageNum?.toString()
            )}
          </div>
          <div className="flex gap-[16px]">
            {renderField(
              '异常策略',
              getExceptionStrategyText(
                syncSourceDataStrategy.exceptionStrategy
              ),
              'w-[418px]',
              '立即停止：出现异常后任务停止，等待人工处理。继续同步：异常数据记录日志，任务继续处理后续请求。'
            )}
          </div>
        </>
      ) : (
        commonTail
      )}

      {isDatabasePollingMode && isSqlMode && (
        <SqlDetailModal
          visible={sqlModalVisible}
          onClose={() => setSqlModalVisible(false)}
          title="轮询"
          fullSql={syncSourceDataStrategy.jdbcSyncSqlFull}
          incrementSql={syncSourceDataStrategy.jdbcSyncSqlIncrement}
        />
      )}
    </>
  );
};

export default SyncStrategyInfo;
