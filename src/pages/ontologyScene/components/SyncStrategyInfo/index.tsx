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
import QuestionIcon from '../../assets/question.svg';

interface SyncStrategyInfoProps {
  enableSyncSourceData?: boolean;
  syncSourceDataStrategy?: SyncSourceDataStrategy;
}

export const SyncStrategyInfo: React.FC<SyncStrategyInfoProps> = ({
  enableSyncSourceData,
  syncSourceDataStrategy
}) => {
  const [sqlModalVisible, setSqlModalVisible] = useState(false);

  // 渲染字段行
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

  // 无同步策略
  if (!enableSyncSourceData) {
    return (
      <div className="text-[14px] leading-[22px] text-[var(--color-text-1)]">
        -
      </div>
    );
  }

  // 有同步策略
  if (!syncSourceDataStrategy) {
    return (
      <div className="text-[14px] leading-[22px] text-[var(--color-text-1)]">
        -
      </div>
    );
  }

  // 获取枚举显示文本
  const getSyncModeText = (mode?: string) => {
    if (mode === SyncMode.BINLOG_CDC || mode === 'BINLOG_CDC') return 'CDC';
    if (mode === SyncMode.JDBC_POLLING || mode === 'JDBC_POLLING')
      return '轮询';
    return mode || '-';
  };

  const getConflictStrategyText = (strategy?: string) => {
    if (strategy === ConflictStrategy.KEEP_SOURCE || strategy === 'KEEP_SOURCE')
      return '保留数据源';
    if (strategy === ConflictStrategy.KEEP_TARGET || strategy === 'KEEP_TARGET')
      return '保留目标表';
    return strategy || '-';
  };

  const getSyncScopeText = (scope?: string) => {
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
      return '继续消费';
    return strategy || '-';
  };

  const syncMode = syncSourceDataStrategy.mode;
  const isPollingMode =
    syncMode === SyncMode.JDBC_POLLING || syncMode === 'JDBC_POLLING';
  const queryMode = syncSourceDataStrategy.sourceDataInfo?.queryMode;
  const isSqlMode = queryMode === 'sql';

  // 同步模式显示（轮询模式且查询模式为sql时需要添加SQL详情链接）
  const syncModeDisplay =
    isPollingMode && isSqlMode ? (
      <div className="flex items-center gap-[8px]">
        <span className="text-[14px] leading-[22px] text-[var(--color-text-1)]">
          {getSyncModeText(syncMode)}
        </span>
        <span
          className="cursor-pointer text-[14px] leading-[22px] text-[rgba(var(--primary-6))] hover:underline"
          onClick={() => setSqlModalVisible(true)}
        >
          SQL详情
        </span>
      </div>
    ) : (
      getSyncModeText(syncMode)
    );

  return (
    <>
      {/* CDC 模式 */}
      {!isPollingMode && (
        <>
          {/* 第一行：同步模式、冲突策略 */}
          <div className="mb-[12px] flex gap-[16px]">
            {renderField(
              '同步模式',
              syncModeDisplay,
              'w-[418px]',
              'CDC模式通过监听数据库变更日志实时同步数据'
            )}
            {renderField(
              '冲突策略',
              getConflictStrategyText(syncSourceDataStrategy.conflictStrategy)
            )}
          </div>

          {/* 第二行：同步范围、并行数 */}
          <div className="mb-[12px] flex gap-[16px]">
            {renderField(
              '同步范围',
              getSyncScopeText(syncSourceDataStrategy.syncScope)
            )}
            {renderField(
              '并行数',
              syncSourceDataStrategy.parallelism?.toString()
            )}
          </div>

          {/* 第三行：异常策略 */}
          <div className="flex gap-[16px]">
            {renderField(
              '异常策略',
              getExceptionStrategyText(
                syncSourceDataStrategy.exceptionStrategy
              ),
              'w-[418px]',
              '定义同步过程中遇到错误时的处理方式'
            )}
          </div>
        </>
      )}

      {/* 轮询模式 */}
      {isPollingMode && (
        <>
          {/* 第一行：同步模式、轮询间隔 */}
          <div className="mb-[12px] flex gap-[16px]">
            {renderField(
              '同步模式',
              syncModeDisplay,
              'w-[418px]',
              '轮询模式通过定时查询数据源获取数据变化'
            )}
            {renderField(
              '轮询间隔',
              syncSourceDataStrategy.jdbcPollingIntervalSeconds
                ? `${syncSourceDataStrategy.jdbcPollingIntervalSeconds}秒`
                : undefined
            )}
          </div>

          {/* 第二行：单次拉取数量、增量时间列 */}
          <div className="mb-[12px] flex gap-[16px]">
            {renderField(
              '单次拉取数量',
              syncSourceDataStrategy.pollFetchSize?.toString()
            )}
            {renderField(
              '增量时间列',
              syncSourceDataStrategy.jdbcIncrementalTimeField
            )}
          </div>

          {/* 第三行：断点辅助列、冲突策略 */}
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

          {/* 第四行：同步范围、并行数 */}
          <div className="mb-[12px] flex gap-[16px]">
            {renderField(
              '同步范围',
              getSyncScopeText(syncSourceDataStrategy.syncScope)
            )}
            {renderField(
              '并行数',
              syncSourceDataStrategy.parallelism?.toString()
            )}
          </div>

          {/* 第五行：异常策略 */}
          <div className="flex gap-[16px]">
            {renderField(
              '异常策略',
              getExceptionStrategyText(
                syncSourceDataStrategy.exceptionStrategy
              ),
              'w-[418px]',
              '定义同步过程中遇到错误时的处理方式'
            )}
          </div>
        </>
      )}

      {/* SQL详情弹窗（仅轮询模式且查询模式为sql） */}
      {isPollingMode && isSqlMode && (
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
