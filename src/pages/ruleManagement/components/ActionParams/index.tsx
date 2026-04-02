import React, { useEffect, useMemo } from 'react';
import { Form, Input, InputProps, Select } from '@arco-design/web-react';
import styles from './index.module.scss';
import { BehaviorActionItem } from '@/pages/ontologyScene/types/behaviorActions';
import { GlobalTooltip, NoDataCard } from '@ceai-front/arco-material';
import classNames from 'classnames';
import { renderComponentByUiType } from '@/pages/ontologyScene/utils';

const PARAM_SOURCE_OPTIONS = [
  {
    label: '变更的实例',
    value: 'runtime'
  },
  {
    label: '静态值',
    value: 'static'
  }
] as const;

export interface ActionParamsItem {
  code?: string;
  name?: string;
  source?: 'runtime' | 'static';
  type?: string;
  value?: string;
}

export interface ActionParamsProps {
  actionData?: Partial<BehaviorActionItem>;
  field?: string;
}

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
  const { actionData, field = 'actionParams' } = props;
  const { form } = Form.useFormContext();

  const params = actionData?.params || [];
  const paramSignature = useMemo(() => {
    return params
      .map((item) => `${item.code || ''}-${item.name || ''}-${item.type || ''}`)
      .join('|');
  }, [params]);

  useEffect(() => {
    const currentParams = (form.getFieldValue(field) ||
      []) as ActionParamsItem[];
    const currentParamMap = new Map(
      currentParams.map((item) => [item.code, item] as const)
    );

    const nextParams = params.flatMap((item) => {
      if (item.inputType !== 'input') return [];
      const currentItem = currentParamMap.get(item.code);
      return {
        code: item.code,
        name: item.name,
        type: item.type,
        source: currentItem?.source || 'static',
        value: currentItem?.value
      };
    });

    form.setFieldValue(field, nextParams);
  }, [field, form, paramSignature, params]);

  if (!params.length) {
    return (
      <div className={styles['action-params-empty']}>
        <NoDataCard type={'block'} title={'暂无参数配置'} />
      </div>
    );
  }

  const renderUI = (name: string) => {
    const currentField = actionData?.params?.find(
      (item) => item.code === name && item.inputType === 'input'
    );

    return renderComponentByUiType(currentField?.uiType as any);
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
              {fields.map(({ field: itemField, key }) => {
                const currentItem = form.getFieldValue(itemField) as
                  | ActionParamsItem
                  | undefined;

                return (
                  <div className={styles['action-params-row']} key={key}>
                    <div className={styles['action-params-cell']}>
                      <div className={styles['action-params-text']}>
                        <Form.Item field={`${itemField}.name`} noStyle>
                          <InputWithTooltip readOnly />
                        </Form.Item>
                        <Form.Item field={`${itemField}.id`} noStyle>
                          <Input style={{ display: 'none' }} />
                        </Form.Item>
                        <Form.Item field={`${itemField}.code`} noStyle>
                          <Input style={{ display: 'none' }} />
                        </Form.Item>
                      </div>
                    </div>
                    <div className={styles['action-params-cell']}>
                      <div className={styles['action-params-text']}>
                        {currentItem?.type || '-'}
                      </div>
                      <Form.Item field={`${itemField}.type`} noStyle>
                        <Input style={{ display: 'none' }} />
                      </Form.Item>
                    </div>
                    <div className={styles['action-params-cell']}>
                      <Form.Item
                        field={`${itemField}.source`}
                        className={styles['action-params-form-item']}
                        rules={[{ required: true, message: '请选择入参来源' }]}
                      >
                        <Select
                          placeholder={'请选择入参来源'}
                          options={PARAM_SOURCE_OPTIONS as any}
                          triggerProps={{
                            updateOnScroll: true
                          }}
                          getPopupContainer={(node) =>
                            node.parentElement || document.body
                          }
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
                    </div>
                    <div className={styles['action-params-cell']}>
                      <Form.Item
                        shouldUpdate={(prev, next) =>
                          prev[`${itemField}.source`] !==
                          next[`${itemField}.source`]
                        }
                        noStyle
                      >
                        {(_, { getFieldValue }) => {
                          const source = getFieldValue(`${itemField}.source`);
                          const fieldName = getFieldValue(`${itemField}.name`);
                          return source === 'runtime' ? (
                            <div
                              className={styles['action-params-runtime-text']}
                            >
                              运行时自动输入
                            </div>
                          ) : (
                            <Form.Item
                              field={`${itemField}.value`}
                              className={styles['action-params-form-item']}
                              rules={[
                                { required: true, message: '请输入参数值' }
                              ]}
                            >
                              {renderUI(fieldName)}
                            </Form.Item>
                          );
                        }}
                      </Form.Item>
                    </div>
                  </div>
                );
              })}
            </>
          );
        }}
      </Form.List>
    </div>
  );
};
