import React, { useCallback, useMemo } from 'react';
import { Button, Input, Select } from '@arco-design/web-react';
import { IconMinusCircle, IconPlus } from '@arco-design/web-react/icon';
import { useNodeDataUpdate, VarList } from '@ceai-front/workflow';
import type {
  DataTaskNodeInputField,
  DataTaskNodeOutputField
} from '../../../types';
import {
  createEmptyInputField,
  createEmptyOutputField,
  DATA_TASK_OUTPUT_TYPE_OPTIONS,
  normalizeInputFields,
  normalizeOutputFields
} from './nodeIoUtils';
import styles from './NodeIoFields.module.scss';

interface NodeIoFieldsProps {
  id: string;
  data: Record<string, unknown>;
  /** 是否展示输入字段（开始节点等无上游时关闭） */
  showInputs?: boolean;
  /** 是否展示输出字段（默认开启） */
  showOutputs?: boolean;
}

export default function NodeIoFields({
  id,
  data,
  showInputs = true,
  showOutputs = true
}: NodeIoFieldsProps) {
  const { handleNodeDataUpdate } = useNodeDataUpdate();

  const outputs = useMemo(
    () => normalizeOutputFields(data.outputs),
    [data.outputs]
  );
  const variables = useMemo(
    () => normalizeInputFields(data.variables),
    [data.variables]
  );

  const patchIo = useCallback(
    (patch: {
      outputs?: DataTaskNodeOutputField[];
      variables?: DataTaskNodeInputField[];
    }) => {
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

  const handleOutputsChange = (next: DataTaskNodeOutputField[]) => {
    patchIo({ outputs: next });
  };

  const handleVariablesChange = (next: DataTaskNodeInputField[]) => {
    patchIo({ variables: next });
  };

  const updateOutputAt = (
    index: number,
    patch: Partial<DataTaskNodeOutputField>
  ) => {
    const next = outputs.map((item, i) =>
      i === index ? { ...item, ...patch } : item
    );
    handleOutputsChange(next);
  };

  return (
    <div className={styles['node-io-fields']}>
      {showInputs && (
        <div className={styles.section}>
          <div className={styles['section-header']}>
            <div className={styles['section-title']}>输入字段</div>
            <Button
              type="text"
              size="mini"
              icon={<IconPlus />}
              onClick={() =>
                handleVariablesChange([...variables, createEmptyInputField()])
              }
            >
              添加
            </Button>
          </div>
          <div className={styles['section-desc']}>
            引用上游节点已输出的字段，供本节点使用
          </div>
          {variables.length ? (
            <VarList
              nodeId={id}
              readonly={false}
              list={variables as any}
              onChange={(list) =>
                handleVariablesChange(normalizeInputFields(list))
              }
              isSupportConstantValue
            />
          ) : (
            <div className={styles['empty-tip']}>暂无输入字段，可点击添加</div>
          )}
        </div>
      )}

      {showOutputs && (
        <div className={styles.section}>
          <div className={styles['section-header']}>
            <div className={styles['section-title']}>输出字段</div>
            <Button
              type="text"
              size="mini"
              icon={<IconPlus />}
              onClick={() =>
                handleOutputsChange([
                  ...outputs,
                  createEmptyOutputField(outputs.length)
                ])
              }
            >
              添加
            </Button>
          </div>
          <div className={styles['section-desc']}>
            本节点产出的字段，可供下游节点重复引用
          </div>
          {outputs.length ? (
            outputs.map((field, index) => (
              <div
                className={styles['field-row']}
                key={`${field.variable}-${index}`}
              >
                <Input
                  className={styles['field-name']}
                  placeholder="字段名"
                  value={field.variable}
                  onChange={(variable) => updateOutputAt(index, { variable })}
                />
                <Select
                  className={styles['field-type']}
                  options={DATA_TASK_OUTPUT_TYPE_OPTIONS}
                  value={field.type}
                  onChange={(type) => updateOutputAt(index, { type })}
                />
                <Input
                  className={styles['field-des']}
                  placeholder="说明（可选）"
                  value={field.des || ''}
                  onChange={(des) => updateOutputAt(index, { des })}
                />
                <IconMinusCircle
                  className={styles['remove-btn']}
                  onClick={() =>
                    handleOutputsChange(outputs.filter((_, i) => i !== index))
                  }
                />
              </div>
            ))
          ) : (
            <div className={styles['empty-tip']}>暂无输出字段，可点击添加</div>
          )}
        </div>
      )}
    </div>
  );
}
