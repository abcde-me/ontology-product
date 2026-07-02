import React from 'react';
import { Form, Input, Popover } from '@arco-design/web-react';
import { IconQuestionCircle } from '@arco-design/web-react/icon';
import { SyncSourceDataStrategyFormState } from '../../ObjectTypeFormUtils/types';

const FormItem = Form.Item;

export interface ApiPollingIncrementalFieldsProps {
  syncSourceDataStrategy: SyncSourceDataStrategyFormState;
  onStrategyUpdate: (updates: Partial<SyncSourceDataStrategyFormState>) => void;
  readOnly?: boolean;
}

export default function ApiPollingIncrementalFields({
  syncSourceDataStrategy,
  onStrategyUpdate,
  readOnly = false
}: ApiPollingIncrementalFieldsProps) {
  return (
    <>
      <FormItem
        label={
          <span className="inline-flex items-center gap-[4px]">
            增量时间参数
            <Popover content="请求 query/body 中携带「上次同步时间」的参数名，如 updatedSince、startTime。与游标参数至少填一项">
              <IconQuestionCircle className="cursor-pointer text-[#86909C]" />
            </Popover>
          </span>
        }
      >
        <Input
          placeholder="如 updatedSince"
          value={syncSourceDataStrategy.apiIncrementalTimeParam}
          disabled={readOnly}
          onChange={(apiIncrementalTimeParam) =>
            onStrategyUpdate({ apiIncrementalTimeParam })
          }
        />
      </FormItem>

      <FormItem
        label={
          <span className="inline-flex items-center gap-[4px]">
            游标参数
            <Popover content="请求 query/body 中携带「上次断点」的参数名，如 cursor、lastId。与增量时间参数至少填一项">
              <IconQuestionCircle className="cursor-pointer text-[#86909C]" />
            </Popover>
          </span>
        }
      >
        <Input
          placeholder="如 cursor"
          value={syncSourceDataStrategy.apiCheckpointParam}
          disabled={readOnly}
          onChange={(apiCheckpointParam) =>
            onStrategyUpdate({ apiCheckpointParam })
          }
        />
      </FormItem>

      <FormItem
        label={
          <span className="inline-flex items-center gap-[4px]">
            增量判定字段
            <Popover content="API 响应单条记录中用于计算下次断点的字段名，如 updateTime、id">
              <IconQuestionCircle className="cursor-pointer text-[#86909C]" />
            </Popover>
          </span>
        }
        required
      >
        <Input
          placeholder="如 updateTime"
          value={syncSourceDataStrategy.apiIncrementalMarkerField}
          disabled={readOnly}
          onChange={(apiIncrementalMarkerField) =>
            onStrategyUpdate({ apiIncrementalMarkerField })
          }
        />
      </FormItem>
    </>
  );
}

export const API_POLLING_INCREMENTAL_SCOPE_HINT =
  '全量拉取：每次定时任务不带增量参数请求 API；增量/先全后增：按下方参数携带上次断点，判定字段从响应取值更新断点';
