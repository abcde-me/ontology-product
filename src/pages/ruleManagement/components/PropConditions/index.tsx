import React, { useEffect, useMemo, useState } from 'react';
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
import { isNumericType } from '@/pages/ruleManagement/utils';

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
  readOnly?: boolean;
  className?: string;
  field?: string;
}

const isIntegerField = (fieldType?: string) => {
  return fieldType?.toLowerCase().includes('int');
};

export const PropConditions = (props: PropConditionsProps) => {
  const {
    value: rows = [],
    onChange,
    disabled,
    readOnly = false,
    className
  } = props;

  const [propValueStatus, setPropValueStatus] =
    useState<Record<string, boolean>>();

  useEffect(() => {
    const valueStatus = rows.reduce<Record<string, boolean>>((p, v) => {
      const { id, value } = v;
      p[id] = isNil(value) || !value.toString().trim();
      return p;
    }, {});
    setPropValueStatus(valueStatus);
  }, [rows]);

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

  // 批量变更属性条件
  const batchChangeProp = (type: ConditionType) => {
    const nextRows: PropertyConditionType[] = rows.map((row) => ({
      ...row,
      type,
      operator: isNumericType(row.fieldType) ? Operator.Eq : Operator.Contains,
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
      filterIcon: readOnly ? null : (
        <BatchChangePropIcon
          className={
            'h-[16px] w-[16px] hover:cursor-pointer hover:text-[rgb(var(--primary-6))]'
          }
        />
      ),
      filterDropdown: readOnly
        ? undefined
        : ({ confirm }) => {
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
      filterDropdownProps: readOnly
        ? undefined
        : {
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
            {!readOnly && (
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
                      operator: isNumericType(record.fieldType)
                        ? Operator.Eq
                        : Operator.Contains,
                      value: undefined
                    });
                  }}
                />
              </Tooltip>
            )}
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
        const numericType = isNumericType(record.fieldType);
        const options = numericType
          ? NUM_CONDITION_OPERATOR_OPTIONS
          : STR_CONDITION_OPERATOR_OPTIONS;
        if (readOnly) {
          const currentOption = options.find(
            (item) => item.value === record.operator
          );
          return (
            <span className={styles['readonly-text']}>
              {currentOption?.label || '-'}
            </span>
          );
        }

        return (
          <Form.Item validateStatus={undefined} className={'mb-0'}>
            <Select
              value={record.operator}
              disabled={disabled || readOnly}
              className={styles['operator']}
              options={options}
              placeholder={'请选择'}
              triggerProps={{
                updateOnScroll: true
              }}
              showSearch
              dropdownMenuClassName={styles['condition-dropdown']}
              getPopupContainer={(node) => document.body}
              onChange={(operator: Operator) => {
                updateRow(index, {
                  operator
                });
              }}
            />
          </Form.Item>
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
        if (readOnly) {
          return (
            <div className={styles['readonly-value']}>
              {isNil(record.value) || !String(record.value).trim()
                ? '-'
                : String(record.value)}
            </div>
          );
        }
        return (
          <Form.Item
            className={'mb-0'}
            validateStatus={propValueStatus?.[record.id] ? 'error' : undefined}
          >
            {isIntegerField(record.fieldType) ? (
              <InputNumber
                defaultValue={record.value as number | undefined}
                disabled={disabled || readOnly}
                className={
                  propValueStatus?.[record.id] ? '' : styles['value-common']
                }
                placeholder={'请输入'}
                style={{ width: '100%' }}
                onBlur={(e) => {
                  const nextValue = e.target.value as number;
                  updateRow(index, {
                    value: nextValue
                  });
                }}
              />
            ) : (
              <Input
                defaultValue={record.value as string}
                disabled={disabled || readOnly}
                className={
                  propValueStatus?.[record.id] ? '' : styles['value-common']
                }
                placeholder={'请输入'}
                allowClear
                onBlur={(e) => {
                  const nextValue = e.target.value;
                  updateRow(index, {
                    value: nextValue
                  });
                }}
              />
            )}
          </Form.Item>
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
