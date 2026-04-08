import React, { useEffect, useMemo } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Table,
  TableColumnProps,
  Tooltip
} from '@arco-design/web-react';
import classNames from 'classnames';
import {
  ConditionType,
  NUM_CONDITION_OPERATOR_OPTIONS,
  Operator,
  PropertyConditionType,
  STR_CONDITION_OPERATOR_OPTIONS
} from '@/pages/ruleManagement/types';
import styles from './index.module.scss';
import { PhysicalProperties } from '@/types/graphApi';
import BatchChangePropIcon from '@/assets/batch-change-prop.svg';
import { IconSwap } from '@arco-design/web-react/icon';
import { isNil } from 'lodash-es';

export interface PropConditionItem extends PropertyConditionType {
  name?: string;
  fieldType?: string;
}

export interface PropConditionsProps {
  value?: PropConditionItem[];
  onChange?: (value: PropConditionItem[]) => void;
  propIds?: React.Key[];
  allProps?: PhysicalProperties[];
  disabled?: boolean;
  className?: string;
  field?: string;
}

const isIntegerField = (fieldType?: string) => {
  return fieldType?.toLowerCase().includes('int');
};

export const PropConditions = (props: PropConditionsProps) => {
  const { value: rows = [], onChange, disabled, className } = props;

  const updateRow = (index: number, patch: Partial<PropConditionItem>) => {
    const nextRows = rows.map((row, rowIndex) => {
      if (rowIndex !== index) return row;

      const nextRow = {
        ...row,
        ...patch
      };

      if (nextRow.type === ConditionType.AnyChange) {
        nextRow.operator = undefined;
        nextRow.value = undefined;
      }

      return nextRow;
    });

    onChange?.(nextRows);
  };

  const batchChangeProp = (type: ConditionType) => {
    const nextRows: PropertyConditionType[] = rows.map((row) => ({
      ...row,
      type,
      operator: row.fieldType === 'int' ? Operator.Eq : Operator.Contains,
      value: undefined
    }));
    onChange?.(nextRows);
  };

  const columns: TableColumnProps<PropConditionItem>[] = [
    {
      title: '属性',
      dataIndex: 'name',
      render: (_, record) => record.name || '-'
    },
    {
      title: '字段类型',
      dataIndex: 'fieldType',
      render: (_, record) => record.fieldType || '-'
    },
    {
      title: '变更条件',
      filterIcon: (
        <BatchChangePropIcon
          className={
            'h-[16px] w-[16px] hover:cursor-pointer hover:text-[rgb(var(--primary-6))]'
          }
        />
      ),
      filterDropdown: ({ confirm }) => {
        return (
          <div className={styles['batch-change-prop-dropdown']}>
            <div
              className={styles['batch-change-prop-item']}
              onClick={() => {
                batchChangeProp(ConditionType.MeetCondition);
                confirm?.();
              }}
            >
              全部设置为
              <span>满足条件</span>
            </div>
            <div
              className={styles['batch-change-prop-item']}
              onClick={() => {
                batchChangeProp(ConditionType.AnyChange);
                confirm?.();
              }}
            >
              全部设置为
              <span>任意变化</span>
            </div>
          </div>
        );
      },
      filterDropdownProps: {
        triggerProps: { position: 'bl', updateOnScroll: true }
      },
      onFilter() {
        return true;
      },
      dataIndex: 'type',
      width: 120,
      render: (_, record, index) => {
        return (
          <div className={styles['condition-type-change']}>
            {record.type === ConditionType.AnyChange ? '任意变化' : '满足条件'}
            <Tooltip content={'切换变更条件'}>
              <IconSwap
                className={
                  'hover:cursor-pointer hover:text-[rgb(var(--primary-6))]'
                }
                onClick={() => {
                  updateRow(index, {
                    type:
                      record.type === ConditionType.AnyChange
                        ? ConditionType.MeetCondition
                        : ConditionType.AnyChange,
                    operator:
                      record.fieldType === 'int'
                        ? Operator.Eq
                        : Operator.Contains,
                    value: undefined
                  });
                }}
              />
            </Tooltip>
          </div>
        );
      }
    },
    {
      title: '条件',
      dataIndex: 'operator',
      width: 130,
      render: (_, record, index) => {
        const anyChange = record.type === ConditionType.AnyChange;

        if (anyChange) {
          return <span className={styles['placeholder-text']}>-</span>;
        }

        return (
          <Select
            value={record.operator}
            disabled={disabled}
            options={
              record.fieldType === 'int'
                ? NUM_CONDITION_OPERATOR_OPTIONS
                : STR_CONDITION_OPERATOR_OPTIONS
            }
            placeholder={'请选择'}
            triggerProps={{
              updateOnScroll: true
            }}
            getPopupContainer={(node) => document.body}
            onChange={(operator: Operator) => {
              updateRow(index, {
                operator
              });
            }}
          />
        );
      }
    },
    {
      title: '属性值',
      dataIndex: 'value',
      width: 200,
      render: (_, record, index) => {
        const anyChange = record.type === ConditionType.AnyChange;

        if (anyChange) {
          return <span className={styles['placeholder-text']}>-</span>;
        }
        return isIntegerField(record.fieldType) ? (
          <InputNumber
            value={record.value as number | undefined}
            disabled={disabled}
            placeholder={'请输入'}
            style={{ width: '100%' }}
            onChange={(nextValue) => {
              updateRow(index, {
                value: isNil(nextValue) ? nextValue : JSON.stringify(nextValue)
              });
            }}
          />
        ) : (
          <Input
            value={record.value as string}
            disabled={disabled}
            placeholder={'请输入'}
            onChange={(nextValue) => {
              updateRow(index, {
                value: nextValue
              });
            }}
          />
        );
      }
    }
  ];

  return (
    <div className={classNames(styles['prop-conditions'], className)}>
      <Table
        rowKey={(record) => String(record.id ?? record.name ?? '')}
        columns={columns}
        data={rows}
        pagination={false}
        border={false}
      />
    </div>
  );
};
