import React from 'react';
import { Form, Input, InputNumber, Popover } from '@arco-design/web-react';
import { IconQuestionCircle } from '@arco-design/web-react/icon';
import { SyncSourceDataStrategyFormState } from '../../ObjectTypeFormUtils/types';

const FormItem = Form.Item;

export interface ApiPollingPaginationFieldsProps {
  syncSourceDataStrategy: SyncSourceDataStrategyFormState;
  onStrategyUpdate: (updates: Partial<SyncSourceDataStrategyFormState>) => void;
  readOnly?: boolean;
}

export default function ApiPollingPaginationFields({
  syncSourceDataStrategy,
  onStrategyUpdate,
  readOnly = false
}: ApiPollingPaginationFieldsProps) {
  return (
    <>
      <FormItem
        label={
          <span className="inline-flex items-center gap-[4px]">
            每页大小参数名
            <Popover content="请求 query/body 中携带每页条数的参数名，如 pageSize、limit">
              <IconQuestionCircle className="cursor-pointer text-[#86909C]" />
            </Popover>
          </span>
        }
      >
        <Input
          placeholder="如 pageSize"
          value={syncSourceDataStrategy.apiPageSizeParam}
          disabled={readOnly}
          onChange={(apiPageSizeParam) =>
            onStrategyUpdate({ apiPageSizeParam })
          }
        />
      </FormItem>

      <FormItem
        label={
          <span className="inline-flex items-center gap-[4px]">
            页号参数名
            <Popover content="请求 query/body 中携带页号的参数名，如 pageNum、page">
              <IconQuestionCircle className="cursor-pointer text-[#86909C]" />
            </Popover>
          </span>
        }
      >
        <Input
          placeholder="如 pageNum"
          value={syncSourceDataStrategy.apiPageNumParam}
          disabled={readOnly}
          onChange={(apiPageNumParam) => onStrategyUpdate({ apiPageNumParam })}
        />
      </FormItem>

      <FormItem
        label={
          <span className="inline-flex items-center gap-[4px]">
            总数参数名
            <Popover content="API 响应体中总记录数的字段名，如 totalCount、total">
              <IconQuestionCircle className="cursor-pointer text-[#86909C]" />
            </Popover>
          </span>
        }
      >
        <Input
          placeholder="如 totalCount"
          value={syncSourceDataStrategy.apiTotalCountParam}
          disabled={readOnly}
          onChange={(apiTotalCountParam) =>
            onStrategyUpdate({ apiTotalCountParam })
          }
        />
      </FormItem>

      <FormItem
        label={
          <span className="inline-flex items-center gap-[4px]">
            起始页号
            <Popover content="首次拉取时使用的页号，常见为 0 或 1，取决于 API 约定">
              <IconQuestionCircle className="cursor-pointer text-[#86909C]" />
            </Popover>
          </span>
        }
      >
        <InputNumber
          min={0}
          step={1}
          value={syncSourceDataStrategy.apiStartPageNum}
          disabled={readOnly}
          onChange={(apiStartPageNum) =>
            onStrategyUpdate({
              apiStartPageNum:
                apiStartPageNum === undefined
                  ? undefined
                  : Number(apiStartPageNum)
            })
          }
        />
      </FormItem>
    </>
  );
}
