import React from 'react';
import { Form, InputNumber, Popover, Radio } from '@arco-design/web-react';
import { IconQuestionCircle } from '@arco-design/web-react/icon';
import { SyncSourceDataStrategyFormState } from '../../ObjectTypeFormUtils/types';
import { isApiPollingMode } from './instanceSyncStrategyConfig';

const FormItem = Form.Item;

const API_PUSH_SCOPE_LABEL: Record<string, string> = {
  INCREMENTAL: '仅接收新数据'
};

const API_POLLING_SCOPE_LABEL: Record<string, string> = {
  INCREMENTAL: '增量拉取',
  FULL: '全量拉取',
  FULL_THEN_INCREMENTAL: '先全量后增量'
};

export interface ApiSyncStrategyCommonFieldsProps {
  syncSourceDataStrategy: SyncSourceDataStrategyFormState;
  onStrategyUpdate: (updates: Partial<SyncSourceDataStrategyFormState>) => void;
  readOnly?: boolean;
}

export default function ApiSyncStrategyCommonFields({
  syncSourceDataStrategy,
  onStrategyUpdate,
  readOnly = false
}: ApiSyncStrategyCommonFieldsProps) {
  const isPollingMode = isApiPollingMode(syncSourceDataStrategy.mode);

  return (
    <>
      {!isPollingMode && (
        <FormItem
          label={
            <span className="inline-flex items-center gap-[4px]">
              单次接收批大小
              <Popover content="Webhook 实时接收场景下，单次处理的最大实例条数">
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
      )}

      <FormItem
        label={
          <span className="inline-flex items-center gap-[4px]">
            冲突策略
            <Popover content="API 数据与目标实例冲突时的保留策略">
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

      <FormItem
        label={
          <span className="inline-flex items-center gap-[4px]">
            异常策略
            <Popover content="API 同步建议使用「继续同步」：单条失败记录日志并跳过，避免阻塞后续请求">
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
          <Radio value="LOG_ERROR_AND_CONTINUE">继续同步</Radio>
        </Radio.Group>
      </FormItem>
    </>
  );
}

export function resolveApiSyncScopeDisplayLabel(
  mode: string | undefined,
  syncScope: string | undefined
): string {
  if (!syncScope) {
    return '-';
  }
  if (isApiPollingMode(mode)) {
    return API_POLLING_SCOPE_LABEL[syncScope] || syncScope;
  }
  return API_PUSH_SCOPE_LABEL[syncScope] || syncScope;
}
