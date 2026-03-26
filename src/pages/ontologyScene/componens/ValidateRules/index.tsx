import React from 'react';
import styles from './index.module.scss';
import {
  Button,
  Form,
  Input,
  Select,
  Switch,
  Tag
} from '@arco-design/web-react';
import { IconPlayArrowFill } from '@arco-design/web-react/icon';
import { EllipsisPopover, NoDataCard } from '@ceai-front/arco-material';
import {
  FormItem,
  NumberRange,
  NumberRangeValue
} from '@/pages/ontologyScene/componens';
import { isNil } from 'lodash-es';
import {
  RuleName,
  TYPE2RULE_TYPES
} from '@/pages/ontologyScene/types/behaviorActions';
import { SelectWithNoData } from '@/components/new-no-data-comps';
import { ParamType } from '@/pages/ontologyScene/types/ontologyFunction';
import classNames from 'classnames';

export const ValidateRules = (props: { readonly?: boolean }) => {
  const { form, disabled: fieldsDisabled } = Form.useFormContext();
  const { readonly } = props;
  const disabled = fieldsDisabled || readonly;
  const required = readonly;

  return (
    <Form.List field={'validationRules'}>
      {(fields) => {
        if (fields.length === 0)
          return <NoDataCard type={'global'} title={'暂无校验规则'} />;
        return fields.map(({ key, field }) => {
          const paramName = form.getFieldValue(`${field}.name`);
          const paramType = form.getFieldValue(`${field}.type`);
          const enabledValidation = form.getFieldValue(
            `${field}.enabledValidation`
          );
          const typeClassName = `${paramType}-type`;
          return (
            <div className={styles['validate-rules']} key={key}>
              <div className={styles['comp-header']}>
                <div
                  className={'flex flex-1 items-center gap-2 overflow-hidden'}
                >
                  <div className={'w-max overflow-hidden'}>
                    <EllipsisPopover
                      className={classNames([
                        styles['param-name-text'],
                        'font-PingFangSc text-[14px] font-medium leading-[22px] text-black'
                      ])}
                      value={paramName}
                    />
                  </div>
                  <Tag
                    className={`ml-3 ${styles['type-tag']} flex-shrink-0 ${styles[typeClassName]}`}
                    bordered
                    color={'transparent'}
                  >
                    {paramType}
                  </Tag>
                </div>
                <div className={'flex w-max flex-shrink-0 items-center gap-1'}>
                  <div
                    className={
                      'w-max font-PingFangSc text-[14px] font-normal leading-[22px] text-black'
                    }
                  >
                    启用校验
                  </div>
                  <FormItem
                    field={`${field}.enabledValidation`}
                    className={'mb-0 w-[30px]'}
                    triggerPropName={'checked'}
                  >
                    <Switch
                      disabled={disabled}
                      onChange={(e) => {
                        form.setFieldsValue({
                          [`${field}.enabledValidation`]: e
                        });
                        form.setFields({
                          [`${field}.ruleConfig`]: {
                            error: undefined,
                            value: undefined
                          },
                          [`${field}.failMessage`]: {
                            error: undefined,
                            value: undefined
                          }
                        });
                      }}
                    />
                  </FormItem>
                </div>
              </div>
              <div className={styles['comp-content']}>
                <Form.Item field={`${field}.name`} className={'hidden'}>
                  <Input />
                </Form.Item>
                <FormItem
                  label={'校验类型'}
                  field={`${field}.rule_name`}
                  required={enabledValidation}
                >
                  <SelectWithNoData
                    options={TYPE2RULE_TYPES?.[paramType] || []}
                    disabled={disabled || !enabledValidation}
                    getPopupContainer={(node) =>
                      node.parentElement || document.body
                    }
                    onChange={(rule) => {
                      form.setFieldsValue({
                        [`${field}.ruleConfig`]: undefined,
                        [`${field}.failMessage`]: undefined,
                        [`${field}.rule_name`]: rule
                      });
                    }}
                  />
                </FormItem>
                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) => {
                    return (
                      prevValues[`${field}.rule_name`] !==
                      currentValues[`${field}.rule_name`]
                    );
                  }}
                >
                  {(values, form) => {
                    const ruleName = form.getFieldValue(`${field}.rule_name`);
                    const enabledValidation = form.getFieldValue(
                      `${field}.enabledValidation`
                    );
                    return (
                      <>
                        {ruleName === RuleName.RangeRule && (
                          <FormItem
                            label={'数值范围'}
                            field={`${field}.ruleConfig`}
                            required={enabledValidation}
                            rules={[
                              {
                                validator(v, onError) {
                                  if (!enabledValidation) return;
                                  if (isNil(v))
                                    return onError('请填写数值范围');
                                  const value = v as NumberRangeValue;
                                  if (isNil(value.minValue)) {
                                    return onError('请填写最小值');
                                  }
                                  if (isNil(value.maxValue)) {
                                    return onError('请填写最大值');
                                  }
                                }
                              }
                            ]}
                          >
                            <NumberRange
                              disabled={disabled || !enabledValidation}
                              minField={'minValue'}
                              maxField={'maxValue'}
                            />
                          </FormItem>
                        )}
                        {ruleName === RuleName.LengthRule && (
                          <FormItem
                            label={'长度限制'}
                            field={`${field}.ruleConfig`}
                            required={enabledValidation}
                            rules={[
                              {
                                validator(v, onError) {
                                  if (!enabledValidation) return;
                                  if (isNil(v))
                                    return onError('请填写数值范围');
                                  const value = v as NumberRangeValue;
                                  if (isNil(value.minValue)) {
                                    return onError('请填写最小值');
                                  }
                                  if (isNil(value.maxValue)) {
                                    return onError('请填写最大值');
                                  }
                                }
                              }
                            ]}
                          >
                            <NumberRange
                              disabled={disabled || !enabledValidation}
                              minField={'minValue'}
                              maxField={'maxValue'}
                            />
                          </FormItem>
                        )}
                        {ruleName === RuleName.EnumRule && (
                          <FormItem
                            label={'枚举限制'}
                            field={`${field}.ruleConfig`}
                            required={enabledValidation}
                            rules={[
                              {
                                validator(v, onError) {
                                  if (!enabledValidation) return;
                                  if (enabledValidation) {
                                    if (isNil(v)) {
                                      return onError(
                                        '请输入限制的枚举值，用“,”分隔'
                                      );
                                    }
                                    if (paramType === ParamType.Integer) {
                                      const hasNaN = (v as string)
                                        .trim()
                                        .split(',')
                                        .some((num) => isNaN(+num));
                                      if (hasNaN) {
                                        return onError(
                                          '请输入数字枚举值，用“,”分隔'
                                        );
                                      }
                                    }
                                  }
                                }
                              }
                            ]}
                          >
                            <Input
                              placeholder={'请输入限制的枚举值，用逗号分隔'}
                              disabled={disabled || !enabledValidation}
                            />
                          </FormItem>
                        )}
                        <FormItem
                          label={'报错文案'}
                          field={`${field}.failMessage`}
                          required={enabledValidation}
                          rules={[
                            {
                              required: enabledValidation,
                              message: '请输入当参数错误时，界面展示的报错文案'
                            }
                          ]}
                        >
                          <Input
                            placeholder={
                              '请输入当参数错误时，界面展示的报错文案'
                            }
                            disabled={disabled || !enabledValidation}
                          />
                        </FormItem>
                      </>
                    );
                  }}
                </Form.Item>
              </div>
            </div>
          );
        });
      }}
    </Form.List>
  );
};
