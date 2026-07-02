import React from 'react';
import { Form, InputNumber, Popover, Radio } from '@arco-design/web-react';
import { IconQuestionCircle } from '@arco-design/web-react/icon';
import { SyncSourceDataStrategyFormState } from '../../ObjectTypeFormUtils/types';
import { KAFKA_OFFSET_SCOPE_OPTIONS } from './instanceSyncStrategyConfig';

const FormItem = Form.Item;

const KAFKA_OFFSET_LABEL: Record<string, string> = {
  INCREMENTAL: '从最新提交位点',
  FULL: '从最早位点'
};

export interface KafkaSyncStrategyCommonFieldsProps {
  syncSourceDataStrategy: SyncSourceDataStrategyFormState;
  onStrategyUpdate: (updates: Partial<SyncSourceDataStrategyFormState>) => void;
  readOnly?: boolean;
}

export default function KafkaSyncStrategyCommonFields({
  syncSourceDataStrategy,
  onStrategyUpdate,
  readOnly = false
}: KafkaSyncStrategyCommonFieldsProps) {
  return (
    <>
      <FormItem
        label={
          <span className="inline-flex items-center gap-[4px]">
            单次消费批大小
            <Popover content="单次 poll 从 Topic 拉取的最大消息条数，对应 Kafka max.poll.records">
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
        label={
          <span className="inline-flex items-center gap-[4px]">
            冲突策略
            <Popover content="同一主键在 Kafka 消息与目标实例冲突时的保留策略">
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
            起始位点
            <Popover content="从最新提交位点：使用消费组已提交 offset；从最早位点：从 Topic earliest 开始消费">
              <IconQuestionCircle className="cursor-pointer text-[#86909C]" />
            </Popover>
          </span>
        }
        required
      >
        <Radio.Group
          value={syncSourceDataStrategy.syncScope}
          onChange={(syncScope) => onStrategyUpdate({ syncScope })}
          disabled={readOnly}
        >
          {KAFKA_OFFSET_SCOPE_OPTIONS.map((scope) => (
            <Radio key={scope} value={scope}>
              {KAFKA_OFFSET_LABEL[scope] || scope}
            </Radio>
          ))}
        </Radio.Group>
      </FormItem>

      <FormItem
        label={
          <span className="inline-flex items-center gap-[4px]">
            消费并行数
            <Popover content="Kafka 消费并发度，建议与 Topic 分区数一致">
              <IconQuestionCircle className="cursor-pointer text-[#86909C]" />
            </Popover>
          </span>
        }
      >
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
            <Popover content="Kafka 建议使用「继续消费」：单条脏数据记录日志并跳过，避免阻塞整个消费组">
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

export function resolveKafkaSyncScopeDisplayLabel(
  _mode: string | undefined,
  syncScope: string | undefined
): string {
  if (!syncScope) {
    return '-';
  }
  return KAFKA_OFFSET_LABEL[syncScope] || syncScope;
}
