import React, { useEffect } from 'react';
import {
  Form,
  InputNumber,
  Popover,
  Radio,
  Space
} from '@arco-design/web-react';
import { IconQuestionCircle } from '@arco-design/web-react/icon';
import { SyncSourceDataStrategyFormState } from '../../ObjectTypeFormUtils/types';
import ApiSyncStrategyCommonFields from './ApiSyncStrategyCommonFields';
import {
  API_SYNC_MODE,
  API_SYNC_MODE_LABEL,
  ApiSyncMode,
  getDefaultApiSyncStrategyForMode,
  isApiPollingMode,
  normalizeApiSyncStrategyFields
} from './instanceSyncStrategyConfig';

const FormItem = Form.Item;

export interface ApiSyncStrategyFormSectionProps {
  syncSourceDataStrategy: SyncSourceDataStrategyFormState;
  onStrategyUpdate: (updates: Partial<SyncSourceDataStrategyFormState>) => void;
  readOnly?: boolean;
}

export default function ApiSyncStrategyFormSection({
  syncSourceDataStrategy,
  onStrategyUpdate,
  readOnly = false
}: ApiSyncStrategyFormSectionProps) {
  const isPollingMode = isApiPollingMode(syncSourceDataStrategy.mode);

  useEffect(() => {
    const patches = normalizeApiSyncStrategyFields({
      mode: syncSourceDataStrategy.mode,
      syncScope: syncSourceDataStrategy.syncScope,
      exceptionStrategy: syncSourceDataStrategy.exceptionStrategy
    });
    if (!Object.keys(patches).length) {
      return;
    }
    onStrategyUpdate(patches);
  }, [
    syncSourceDataStrategy.mode,
    syncSourceDataStrategy.syncScope,
    syncSourceDataStrategy.exceptionStrategy,
    onStrategyUpdate
  ]);

  const handleModeChange = (mode: ApiSyncMode) => {
    const defaults = getDefaultApiSyncStrategyForMode(mode);
    onStrategyUpdate({
      mode,
      syncScope: defaults.syncScope,
      exceptionStrategy: defaults.exceptionStrategy,
      pollFetchSize: defaults.pollFetchSize,
      jdbcPollingIntervalSeconds: defaults.jdbcPollingIntervalSeconds,
      ...(mode === API_SYNC_MODE.API_PUSH
        ? {
            apiIncrementalTimeParam: undefined,
            apiCheckpointParam: undefined,
            apiIncrementalMarkerField: undefined
          }
        : {})
    });
  };

  return (
    <>
      <FormItem
        label={
          <span className="inline-flex items-center gap-[4px]">
            同步模式
            <Popover content="实时接收：Webhook 实时接收 API 数据；定时拉取：按间隔主动调用 API 拉取">
              <IconQuestionCircle className="cursor-pointer text-[#86909C]" />
            </Popover>
          </span>
        }
        required
      >
        <Radio.Group
          value={syncSourceDataStrategy.mode}
          onChange={handleModeChange}
          disabled={readOnly}
        >
          <Radio value={API_SYNC_MODE.API_PUSH}>
            {API_SYNC_MODE_LABEL[API_SYNC_MODE.API_PUSH]}
          </Radio>
          <Radio value={API_SYNC_MODE.API_POLLING}>
            {API_SYNC_MODE_LABEL[API_SYNC_MODE.API_POLLING]}
          </Radio>
        </Radio.Group>
      </FormItem>

      {isPollingMode && (
        <>
          <FormItem label="拉取间隔" required>
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
                <Popover content="单次 API 请求拉取的最大实例条数">
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
        </>
      )}

      <ApiSyncStrategyCommonFields
        syncSourceDataStrategy={syncSourceDataStrategy}
        onStrategyUpdate={onStrategyUpdate}
        readOnly={readOnly}
      />
    </>
  );
}
