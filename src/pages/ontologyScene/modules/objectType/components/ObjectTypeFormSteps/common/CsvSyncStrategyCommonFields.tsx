import React from 'react';
import { Form, Popover, Radio } from '@arco-design/web-react';
import { IconQuestionCircle } from '@arco-design/web-react/icon';
import { SyncSourceDataStrategyFormState } from '../../ObjectTypeFormUtils/types';
import {
  CSV_IMPORT_SCOPE_OPTIONS,
  CSV_IMPORT_SCOPE_LABEL,
  isCsvIncrementalImportScope
} from './instanceSyncStrategyConfig';

const FormItem = Form.Item;

export interface CsvSyncStrategyCommonFieldsProps {
  syncSourceDataStrategy: SyncSourceDataStrategyFormState;
  onStrategyUpdate: (updates: Partial<SyncSourceDataStrategyFormState>) => void;
  readOnly?: boolean;
}

export default function CsvSyncStrategyCommonFields({
  syncSourceDataStrategy,
  onStrategyUpdate,
  readOnly = false
}: CsvSyncStrategyCommonFieldsProps) {
  const isIncrementalImport = isCsvIncrementalImportScope(
    syncSourceDataStrategy.syncScope
  );

  const handleImportScopeChange = (syncScope: string) => {
    if (isCsvIncrementalImportScope(syncScope)) {
      onStrategyUpdate({
        syncScope,
        conflictStrategy:
          syncSourceDataStrategy.conflictStrategy || 'KEEP_SOURCE'
      });
      return;
    }
    onStrategyUpdate({
      syncScope,
      conflictStrategy: undefined
    });
  };

  return (
    <>
      <FormItem
        label={
          <span className="inline-flex items-center gap-[4px]">
            导入范围
            <Popover content="清空覆盖：导入前清空目标实例后全量写入；增量更新：按主键匹配追加或更新">
              <IconQuestionCircle className="cursor-pointer text-[#86909C]" />
            </Popover>
          </span>
        }
        required
      >
        <Radio.Group
          value={syncSourceDataStrategy.syncScope}
          onChange={handleImportScopeChange}
          disabled={readOnly}
        >
          {CSV_IMPORT_SCOPE_OPTIONS.map((scope) => (
            <Radio key={scope} value={scope}>
              {CSV_IMPORT_SCOPE_LABEL[scope]}
            </Radio>
          ))}
        </Radio.Group>
      </FormItem>

      {isIncrementalImport && (
        <FormItem
          label={
            <span className="inline-flex items-center gap-[4px]">
              冲突策略
              <Popover content="增量更新时，CSV 数据与目标实例主键冲突的保留策略">
                <IconQuestionCircle className="cursor-pointer text-[#86909C]" />
              </Popover>
            </span>
          }
          required
        >
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
      )}

      <FormItem
        label={
          <span className="inline-flex items-center gap-[4px]">
            异常策略
            <Popover content="CSV 导入建议使用「继续导入」：单行失败记录日志并跳过，避免阻塞整批导入">
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
          <Radio value="LOG_ERROR_AND_CONTINUE">继续导入</Radio>
        </Radio.Group>
      </FormItem>
    </>
  );
}
