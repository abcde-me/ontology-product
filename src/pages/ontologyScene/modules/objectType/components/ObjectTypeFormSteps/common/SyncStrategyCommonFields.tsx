import React from 'react';
import { Form, InputNumber, Popover, Radio } from '@arco-design/web-react';
import { IconQuestionCircle } from '@arco-design/web-react/icon';
import { SyncSourceDataStrategyFormState } from '../../ObjectTypeFormUtils/types';

const FormItem = Form.Item;

export interface SyncStrategyCommonFieldsProps {
  syncSourceDataStrategy: SyncSourceDataStrategyFormState;
  onStrategyUpdate: (updates: Partial<SyncSourceDataStrategyFormState>) => void;
  readOnly?: boolean;
  /** 限定可选同步范围，不传则展示全部三项 */
  syncScopeOptions?: string[];
  syncScopePopover?: React.ReactNode;
  exceptionStrategyPopover?: React.ReactNode;
}

const DEFAULT_SYNC_SCOPE_OPTIONS = [
  'INCREMENTAL',
  'FULL',
  'FULL_THEN_INCREMENTAL'
] as const;

const SYNC_SCOPE_LABEL: Record<string, string> = {
  INCREMENTAL: '增量',
  FULL: '全量',
  FULL_THEN_INCREMENTAL: '增量+全量'
};

export default function SyncStrategyCommonFields({
  syncSourceDataStrategy,
  onStrategyUpdate,
  readOnly = false,
  syncScopeOptions = [...DEFAULT_SYNC_SCOPE_OPTIONS],
  syncScopePopover,
  exceptionStrategyPopover = '同步出现异常时的处理方式'
}: SyncStrategyCommonFieldsProps) {
  return (
    <>
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

      <FormItem
        label={
          syncScopePopover ? (
            <span className="inline-flex items-center gap-[4px]">
              同步范围
              <Popover content={syncScopePopover}>
                <IconQuestionCircle className="cursor-pointer text-[#86909C]" />
              </Popover>
            </span>
          ) : (
            '同步范围'
          )
        }
        required
      >
        <Radio.Group
          value={syncSourceDataStrategy.syncScope}
          onChange={(syncScope) => onStrategyUpdate({ syncScope })}
          disabled={readOnly}
        >
          {syncScopeOptions.map((scope) => (
            <Radio key={scope} value={scope}>
              {SYNC_SCOPE_LABEL[scope] || scope}
            </Radio>
          ))}
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
            <Popover content={exceptionStrategyPopover}>
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
