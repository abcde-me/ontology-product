import React, { ComponentProps, useEffect, useMemo } from 'react';
import { Form, Input, InputProps, Select } from '@arco-design/web-react';
import styles from './index.module.scss';
import {
  BehaviorActionItem,
  EnumRule,
  OntologyActionParam,
  RangeRule,
  RuleName
} from '@/pages/ontologyScene/types/behaviorActions';
import { GlobalTooltip, NoDataCard } from '@ceai-front/arco-material';
import classNames from 'classnames';
import { renderComponentByUiType } from '@/pages/ontologyScene/utils';
import { get, isNil } from 'lodash-es';
import {
  ParamType,
  UiType
} from '@/pages/ontologyScene/types/ontologyFunction';
import { UploadItem } from '@arco-design/web-react/es/Upload';
import {
  MapPicker,
  ObjectTypeTag,
  ObjInsValue
} from '@/pages/ontologyScene/components';
import FileIcon from '@/pages/ontologyScene/assets/file-icon.svg';

const PARAM_SOURCE_OPTIONS = [
  {
    label: '变更的实例',
    value: 'change_instance'
  },
  {
    label: '静态值',
    value: 'fixed_value'
  }
] as const;

export interface ActionParamsItem {
  code?: string;
  name?: string;
  source?: 'change_instance' | 'fixed_value';
  type?: string;
  value?: string;
}

export interface ActionParamsProps {
  actionData?: Partial<BehaviorActionItem>;
  field?: string;
  modelId?: number;
  readOnly?: boolean;
}

const renderParamReadonlyValue = (param: { type: ParamType; value: any }) => {
  const { type, value } = param;
  if (
    [
      ParamType.Float,
      ParamType.Integer,
      ParamType.String,
      ParamType.Date,
      ParamType.Timestamp,
      ParamType.Boolean
    ].includes(type)
  ) {
    return (
      <div className={'flex h-full items-center overflow-hidden'}>
        <GlobalTooltip.Ellipsis text={value?.toString()} />
      </div>
    );
  }
  if (type === ParamType.Geopoint) {
    const { lng, lat } = value;
    return (
      <div className={'flex h-full items-center overflow-hidden'}>
        {`[${lat}, ${lng}]`}
      </div>
    );
  }
  if (type === ParamType.ObjectOne) {
    const { name, icon } = value.objectTypeData || {};
    return (
      <div className={'flex h-full items-center overflow-hidden'}>
        <ObjectTypeTag
          ontologyObjectTypeIcon={icon}
          ontologyObjectTypeName={`${name}/${value.objInsID}`}
        />
      </div>
    );
  }
  if (type === ParamType.ObjectSet) {
    const { name, icon } = value.objectTypeData || {};
    return (
      <div
        className={'flex h-full flex-wrap items-center gap-2 overflow-hidden'}
      >
        {(value.objInsID || [])?.map((objInsID) => {
          return (
            <ObjectTypeTag
              key={objInsID}
              ontologyObjectTypeIcon={icon}
              ontologyObjectTypeName={`${name}/${objInsID}`}
            />
          );
        })}
      </div>
    );
  }
  if (type === ParamType.Attachment) {
    const { url } = value[0] || {};
    if (!url) return '-';
    const fileName = url.split('/')?.pop();
    const [name, fileType] = fileName.split('.');
    return (
      <div className={'flex h-full items-center overflow-hidden'}>
        <div
          className={
            'inline-flex h-[26px] min-w-0 max-w-[110px] items-center gap-[4px] overflow-hidden rounded border border-[#EBEEF5] bg-[#F5F7FC] px-[4px]'
          }
        >
          <FileIcon className={'flex-shrink-0'} />
          <GlobalTooltip.Ellipsis text={name} />.{fileType}
        </div>
      </div>
    );
  }
  return JSON.stringify(value);
};

const InputWithTooltip = (props: InputProps) => {
  const { value, readOnly, ...otherProps } = props;
  return readOnly ? (
    <GlobalTooltip.Ellipsis
      className={classNames(otherProps.className)}
      text={value || '-'}
    />
  ) : (
    <Input value={value} readOnly {...otherProps} />
  );
};

export const ActionParams = (props: ActionParamsProps) => {
  const {
    actionData,
    field = 'actionParams',
    modelId,
    readOnly = false
  } = props;
  const { form } = Form.useFormContext();
  const triggerType = Form.useWatch('triggerType', form);

  const field2Rule = actionData?.params?.reduce((p, c) => {
    const { validationRule, enabledValidation, name } = c;
    const {
      ruleConfig,
      ruleName: rule_name,
      failMessage
    } = validationRule || {};
    if (enabledValidation) {
      p[name] = [
        {
          validator(value, onError) {
            if (isNil(value)) {
              return onError(`请输入参数值`);
            }
            switch (rule_name) {
              case RuleName.RangeRule:
                if (
                  value < (ruleConfig as RangeRule).minValue ||
                  value > (ruleConfig as RangeRule).maxValue
                ) {
                  onError(failMessage);
                }
                break;
              case RuleName.LengthRule:
                const length = value?.toString().trim().length;
                if (
                  length < (ruleConfig as RangeRule).minValue ||
                  length > (ruleConfig as RangeRule).maxValue
                ) {
                  onError(failMessage);
                }
                break;
              default:
                if (
                  !(ruleConfig as EnumRule).options
                    .map(String)
                    .includes(value?.toString())
                ) {
                  onError(failMessage);
                }
                break;
            }
          }
        }
      ];
    }
    return p;
  }, {});

  const getOtherFieldRules = (uiType: UiType) => {
    return [
      {
        validator(v, onError) {
          if (
            [
              UiType.Input,
              UiType.InputNumber,
              UiType.TextArea,
              UiType.InputNumberFloat
            ].includes(uiType) &&
            !v?.toString()?.trim()
          ) {
            return onError(`请输入参数值`);
          }
          if (isNil(v)) {
            return onError(`请输入参数值`);
          }
          if (uiType === UiType.Uploader) {
            const files = v as UploadItem[];
            if (!files.length) {
              return onError('请选择文件');
            }
            if (files.some(({ status }) => status === 'error')) {
              onError('文件上传失败，请重新上传');
              return;
            }
            if (files.some(({ status }) => status !== 'done')) {
              onError('文件正在上传，请稍候');
              return;
            }
          }
          if ([UiType.ObjectSet, UiType.ObjectOne].includes(uiType)) {
            const { objInsID } = v as ObjInsValue;
            if (
              isNil(objInsID) ||
              (Array.isArray(objInsID) && !objInsID.length)
            ) {
              return onError('请选择对象实例');
            }
          }
        }
      }
    ];
  };

  return (
    <div className={styles['action-params']}>
      <Form.List field={field}>
        {(fields) => {
          return (
            <>
              <div
                className={styles['action-params-row']}
                data-row-type={'header'}
              >
                <div className={styles['action-params-cell']}>参数名称</div>
                <div className={styles['action-params-cell']}>参数类型</div>
                <div className={styles['action-params-cell']}>入参来源</div>
                <div className={styles['action-params-cell']}>参数值</div>
              </div>
              {!fields?.length ? (
                <div className={styles['action-params-empty']}>
                  <NoDataCard type={'block'} title={'暂无参数配置'} />
                </div>
              ) : (
                fields.map(({ field: itemField, key }, index) => {
                  const currentItem = form.getFieldValue(itemField) as
                    | ActionParamsItem
                    | undefined;

                  return (
                    <div className={styles['action-params-row']} key={key}>
                      <div className={styles['action-params-cell']}>
                        <div className={styles['action-params-text']}>
                          <Form.Item field={`${itemField}.name`} noStyle>
                            <InputWithTooltip
                              readOnly
                              className={'leading-8'}
                            />
                          </Form.Item>
                          <Form.Item field={`${itemField}.id`} noStyle>
                            <Input style={{ display: 'none' }} />
                          </Form.Item>
                          <Form.Item field={`${itemField}.code`} noStyle>
                            <Input style={{ display: 'none' }} />
                          </Form.Item>
                          <Form.Item field={`${itemField}.uiType`} noStyle>
                            <Input style={{ display: 'none' }} />
                          </Form.Item>
                        </div>
                      </div>
                      <div className={styles['action-params-cell']}>
                        <Form.Item field={`${itemField}.type`} noStyle>
                          <InputWithTooltip readOnly className={'leading-8'} />
                        </Form.Item>
                      </div>
                      <div className={styles['action-params-cell']}>
                        {readOnly ? (
                          <div
                            className={styles['action-params-readonly-text']}
                          >
                            {currentItem?.source === 'change_instance'
                              ? '变更的实例'
                              : currentItem?.source === 'fixed_value'
                                ? '静态值'
                                : '-'}
                          </div>
                        ) : (
                          <Form.Item
                            field={`${itemField}.source`}
                            className={styles['action-params-form-item']}
                            rules={[
                              { required: true, message: '请选择入参来源' }
                            ]}
                          >
                            <Select
                              placeholder={'请选择入参来源'}
                              options={
                                triggerType === 1
                                  ? [PARAM_SOURCE_OPTIONS[1]]
                                  : (PARAM_SOURCE_OPTIONS as any)
                              }
                              triggerProps={{
                                updateOnScroll: true
                              }}
                              onChange={(value) => {
                                if (value === 'runtime') {
                                  form.setFieldValue(
                                    `${itemField}.value`,
                                    undefined
                                  );
                                }
                              }}
                            />
                          </Form.Item>
                        )}
                      </div>
                      <div className={styles['action-params-cell']}>
                        <Form.Item
                          shouldUpdate={(prev, next) => {
                            return (
                              get(prev, `${itemField}.source`) !==
                              get(next, `${itemField}.source`)
                            );
                          }}
                          noStyle
                        >
                          {(_, { getFieldValue }) => {
                            const {
                              source,
                              uiType,
                              name,
                              type,
                              value: paramValue
                            } = getFieldValue?.(`${itemField}`) || {};
                            return source === 'change_instance' ? (
                              <div
                                className={styles['action-params-runtime-text']}
                              >
                                运行时自动输入
                              </div>
                            ) : readOnly ? (
                              renderParamReadonlyValue({
                                type,
                                value: paramValue
                              })
                            ) : (
                              <Form.Item
                                field={`${itemField}.value`}
                                className={classNames(
                                  styles['action-params-form-item'],
                                  {
                                    [styles['action-params-readonly-value']]:
                                      readOnly
                                  }
                                )}
                                rules={
                                  field2Rule?.[name] ||
                                  getOtherFieldRules(uiType)
                                }
                              >
                                {renderComponentByUiType(uiType, modelId, {
                                  objProps: {
                                    className: styles['obj-ins-params'],
                                    getPopupContainer: () => document.body
                                  }
                                })}
                              </Form.Item>
                            );
                          }}
                        </Form.Item>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          );
        }}
      </Form.List>
    </div>
  );
};
