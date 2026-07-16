import React, { useCallback, useMemo } from 'react';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Select
} from '@arco-design/web-react';
import { IconDelete, IconPlus } from '@arco-design/web-react/icon';
import {
  ErrorHandleMode,
  LOOP_NODE_MAX_COUNT,
  useNodeDataUpdate,
  VarReferencePicker,
  VarKindType
} from '@ceai-front/workflow';
import type { ValueSelector } from '@ceai-front/workflow';
import NodeIoFields from '../_shared/NodeIoFields';
import panelStyles from '../_shared/NodePanel.module.scss';

type BreakCondition = {
  id: string;
  varType?: string;
  variable_selector?: ValueSelector;
  comparison_operator?: string;
  value?: string | string[];
};

const ERROR_HANDLE_OPTIONS = [
  { label: '错误时终止', value: ErrorHandleMode.Terminated },
  { label: '忽略错误并继续', value: ErrorHandleMode.ContinueOnError },
  { label: '移除错误输出', value: ErrorHandleMode.RemoveAbnormalOutput }
];

const COMPARISON_OPTIONS = [
  { label: '等于', value: '=' },
  { label: '不等于', value: '≠' },
  { label: '大于', value: '>' },
  { label: '小于', value: '<' },
  { label: '大于等于', value: '≥' },
  { label: '小于等于', value: '≤' },
  { label: '为空', value: 'empty' },
  { label: '不为空', value: 'not empty' }
];

const createConditionId = () =>
  `loop_cond_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const normalizeBreakConditions = (value: unknown): BreakCondition[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => item && typeof item === 'object')
    .map((item) => ({
      id: String((item as BreakCondition).id || createConditionId()),
      varType: (item as BreakCondition).varType,
      variable_selector: (item as BreakCondition).variable_selector,
      comparison_operator: (item as BreakCondition).comparison_operator || '=',
      value: (item as BreakCondition).value ?? ''
    }));
};

interface LoopPanelProps {
  id: string;
  data: Record<string, unknown>;
}

export default function LoopPanel({ id, data }: LoopPanelProps) {
  const { handleNodeDataUpdate } = useNodeDataUpdate();
  const [form] = Form.useForm();

  const breakConditions = useMemo(
    () => normalizeBreakConditions(data.break_conditions),
    [data.break_conditions]
  );

  const patchNodeData = useCallback(
    (patch: Record<string, unknown>) => {
      handleNodeDataUpdate({
        id,
        data: {
          ...data,
          ...patch
        }
      });
    },
    [data, handleNodeDataUpdate, id]
  );

  const handleValuesChange = useCallback(
    (_: unknown, values: Record<string, unknown>) => {
      patchNodeData(values);
    },
    [patchNodeData]
  );

  const handleAddCondition = useCallback(() => {
    patchNodeData({
      break_conditions: [
        ...breakConditions,
        {
          id: createConditionId(),
          varType: 'string',
          variable_selector: [],
          comparison_operator: '=',
          value: ''
        }
      ]
    });
  }, [breakConditions, patchNodeData]);

  const handleRemoveCondition = useCallback(
    (conditionId: string) => {
      patchNodeData({
        break_conditions: breakConditions.filter(
          (item) => item.id !== conditionId
        )
      });
    },
    [breakConditions, patchNodeData]
  );

  const handleUpdateCondition = useCallback(
    (conditionId: string, patch: Partial<BreakCondition>) => {
      patchNodeData({
        break_conditions: breakConditions.map((item) =>
          item.id === conditionId ? { ...item, ...patch } : item
        )
      });
    },
    [breakConditions, patchNodeData]
  );

  return (
    <div className="px-[16px] pb-[12px] pt-[8px]">
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          loop_count: data.loop_count ?? 10,
          error_handle_mode:
            data.error_handle_mode ?? ErrorHandleMode.Terminated
        }}
        onValuesChange={handleValuesChange}
      >
        <Form.Item
          label="最大循环次数"
          field="loop_count"
          rules={[
            {
              validator(value, callback) {
                const count = Number(value);
                if (
                  !Number.isInteger(count) ||
                  count < 1 ||
                  count > LOOP_NODE_MAX_COUNT
                ) {
                  callback(`请输入 1 到 ${LOOP_NODE_MAX_COUNT} 之间的整数`);
                  return;
                }
                callback();
              }
            }
          ]}
        >
          <InputNumber min={1} max={LOOP_NODE_MAX_COUNT} />
        </Form.Item>

        <Form.Item label="错误响应方法" field="error_handle_mode">
          <Select options={ERROR_HANDLE_OPTIONS} />
        </Form.Item>
      </Form>

      <div className={panelStyles['section-block']}>
        <div className={panelStyles['section-header']}>
          <div className={panelStyles['section-title']}>循环终止条件</div>
          <Button
            type="text"
            size="mini"
            icon={<IconPlus />}
            onClick={handleAddCondition}
          >
            添加条件
          </Button>
        </div>

        {!breakConditions.length ? (
          <div className="rounded-[6px] border border-dashed border-[var(--color-border-2)] bg-[var(--color-fill-1)] p-[10px] text-[12px] leading-[18px] text-[var(--color-text-3)]">
            请至少添加一个终止条件，循环将在条件满足时结束。
          </div>
        ) : (
          <div className="flex flex-col gap-[8px]">
            {breakConditions.map((condition, index) => (
              <div
                key={condition.id}
                className="rounded-[8px] border border-[var(--color-border-2)] p-[10px]"
              >
                <div className="mb-[6px] flex items-center justify-between">
                  <span className={panelStyles['section-title-sm']}>
                    条件 {index + 1}
                  </span>
                  <Button
                    type="text"
                    size="mini"
                    status="danger"
                    icon={<IconDelete />}
                    onClick={() => handleRemoveCondition(condition.id)}
                  />
                </div>

                <div className="mb-[6px]">
                  <div className="mb-[2px] text-[12px] text-[var(--color-text-3)]">
                    变量
                  </div>
                  <VarReferencePicker
                    nodeId={id}
                    readonly={false}
                    value={condition.variable_selector || []}
                    onChange={(selector) =>
                      handleUpdateCondition(condition.id, {
                        variable_selector: Array.isArray(selector)
                          ? selector
                          : []
                      })
                    }
                    defaultVarKindType={VarKindType.variable}
                  />
                </div>

                <div className="mb-[6px]">
                  <div className="mb-[2px] text-[12px] text-[var(--color-text-3)]">
                    操作符
                  </div>
                  <Select
                    value={condition.comparison_operator}
                    options={COMPARISON_OPTIONS}
                    onChange={(value) =>
                      handleUpdateCondition(condition.id, {
                        comparison_operator: value
                      })
                    }
                  />
                </div>

                {!['empty', 'not empty'].includes(
                  condition.comparison_operator || ''
                ) ? (
                  <div>
                    <div className="mb-[2px] text-[12px] text-[var(--color-text-3)]">
                      比较值
                    </div>
                    <Input
                      value={String(condition.value ?? '')}
                      placeholder="请输入比较值"
                      onChange={(value) =>
                        handleUpdateCondition(condition.id, { value })
                      }
                    />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      <NodeIoFields id={id} data={data} showInputs showOutputs />
    </div>
  );
}
