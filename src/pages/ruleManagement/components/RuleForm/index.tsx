import React, { forwardRef, useImperativeHandle } from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import { FormInstance } from '@arco-design/web-react/es/Form';
import { Form, Input, Radio, Select, Switch } from '@arco-design/web-react';
import FormItem from '@/components/FormItem';
import {
  ActionParams,
  ActionSelect,
  FunctionSelect,
  OntoSceneSelect,
  RuleSettingConfig,
  TriggerType
} from '@/pages/ruleManagement/components';
import SchedulerRun from '../SchedulerRun';
import { CycleText } from '../SchedulerRun/types';
import { FunctionsSelect } from '@/pages/ontologyScene/modules/behaviorActionDetail/components';
import { useRuleManagementStore } from '../../stores';
import { BehaviorActionItem } from '@/pages/ontologyScene/types/behaviorActions';
import { buildAutoTrigger } from '../../utils';
import { AutoRuleFormData, ChangeType } from '../../types';
import { ObjectTypeSelect } from '@/pages/ontologyScene/componens';
import { InstanceSelect } from '@/pages/ontologyScene/componens/ObjectInstanceSelect/InsSelect';
import { useRequest } from 'ahooks';
import { isNil } from 'lodash-es';
import { listOntologyPhysicalProperties } from '@/api/ontologySceneLibrary/graph';

const { TextArea } = Input;

const FormItemGroup = ({
  title,
  className
}: {
  title: string;
  className?: string;
}) => {
  return (
    <div className={classNames([styles['form-item-group'], className])}>
      {title}
    </div>
  );
};

const FormItemCard = (props: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div className={classNames([styles['form-item-card'], props.className])}>
      {props.children || null}
    </div>
  );
};

const CHANGE_TYPE_CONFIG = {
  [ChangeType.PropertyChange]: '属性变化',
  [ChangeType.InstanceCreate]: '实例新增',
  [ChangeType.InstanceDelete]: '实例删除'
};

export interface RuleFormRef {
  form: FormInstance;
}

export const RuleForm = forwardRef<
  RuleFormRef | undefined,
  Record<string, any>
>((props, ref) => {
  const [form] = Form.useForm();
  const objectTypeId = Form.useWatch('objectTypeId', form);
  const modelId = Form.useWatch('modelId', form);
  const { changeAction, ruleDetail, changeObjectType } = useRuleManagementStore(
    (state) => ({
      changeAction: state.changeAction,
      changeObjectType: state.changeObjectTypes,
      ruleDetail: state.ruleData
    })
  );

  const { data: primaryKey, loading: primaryKeyLoading } = useRequest(
    () => {
      if (isNil(objectTypeId)) {
        return Promise.resolve(undefined);
      }
      return listOntologyPhysicalProperties({
        objectTypeIdList: [Number(objectTypeId)],
        isPrimary: 1,
        ontologyModelID: +modelId,
        isUse: 1
      }).then((res) => {
        return res.data.result?.find(({ isPrimary }) => !!isPrimary)?.name;
      });
    },
    {
      ready: !!objectTypeId && !!modelId,
      refreshDeps: [objectTypeId, modelId]
    }
  );

  const syncValidatedValues = useRuleManagementStore(
    (state) => state.syncValidatedValues
  );

  const handleManagedValuesChange = (changedValues: Record<string, any>) => {
    const changedKeys = Object.keys(changedValues || {});
    const needNotChange = ['action', 'modelId', 'objectTypeId'].some((key) =>
      changedKeys?.includes(key)
    );
    // 编辑的的数据不需要进行数据初始化
    if (!changedKeys.length || needNotChange || changedKeys.length > 10) return;
    // 首先校验填写数据是否合法
    form
      .validate(changedKeys)
      .then(() => {
        if (['name', 'description'].some((key) => changedKeys.includes(key))) {
          syncValidatedValues(changedValues);
          return;
        }
        if (changedKeys.includes('triggerType')) {
          const nextTriggerType = changedValues.triggerType;

          // 定时触发
          if (nextTriggerType === 1) {
            // 重置变更触发时候的数据
            form.setFieldsValue({
              changeType: undefined,
              changeOntoScene: undefined,
              changeObjectType: undefined,
              advConfig: false,
              gateChangeFunction: undefined,
              gateChangeParams: undefined
            });
            syncValidatedValues({
              triggerType: nextTriggerType,
              changeConfig: undefined,
              gateConfig: undefined
            });
            //   变更触发
          } else if (nextTriggerType === 2) {
            // 重置定时触发的属性
            form.setFieldsValue({
              cycle: undefined,
              date: undefined,
              time: undefined,
              changeType: ChangeType.PropertyChange,
              insType: 'all'
            });
            syncValidatedValues({
              triggerType: nextTriggerType,
              scheduleConfig: undefined,
              changeConfig: {
                changeType: ChangeType.PropertyChange
              }
            });
          }
          return;
        }

        const isScheduleChanged = changedKeys.some((key) =>
          ['cycle', 'date', 'time'].includes(key)
        );
        const isActionParamsChanged = changedKeys.some(
          (key) => key === 'actionParams' || key.startsWith('actionParams')
        );
        const isActionChanged = changedKeys.some((key) =>
          ['gateConfig', 'changeConfig', 'modelId'].includes(key)
        );

        const allValues = form.getFieldsValue() as AutoRuleFormData;

        if (isScheduleChanged) {
          syncValidatedValues({
            scheduleConfig: buildAutoTrigger(allValues).scheduleConfig
          });
          return;
        }

        if (isActionParamsChanged) {
          syncValidatedValues({
            actionConfig: {
              parameters: allValues.actionParams
            }
          });
          return;
        }

        if (isActionChanged) {
          syncValidatedValues({
            modelId: allValues.changeOntoScene as number | undefined,
            gateConfig: allValues.advConfig
              ? {
                  enabled: true,
                  functionId: allValues.gateChangeFunction as number | undefined
                }
              : undefined
          });
        }
      })
      .catch((e) => {
        console.error('数据校验失败', e);
      });
  };

  useImperativeHandle(ref, () => ({
    form
  }));

  return (
    <Form
      form={form}
      autoFocus={false}
      autoComplete={'off'}
      layout={'horizontal'}
      labelAlign={'left'}
      scrollToFirstError
      initialValues={{
        triggerType: 1
      }}
      onValuesChange={handleManagedValuesChange}
    >
      <div className={'flex h-full gap-4'}>
        <div className={'w-[900px] flex-shrink-0'}>
          <div className={styles['basic-info']}>
            <FormItemGroup title={'基本信息'} />
            <div
              className={classNames(
                styles['basic-info-content'],
                styles['rule-form-item']
              )}
            >
              <FormItem
                field={'name'}
                label={'规则名称'}
                required
                rules={[{ required: true, message: '请输入规则名称' }]}
                className={`${styles['base-form-item']}`}
              >
                <Input
                  placeholder={'请输入规则名称'}
                  maxLength={50}
                  showWordLimit
                />
              </FormItem>
              <FormItem
                field={'description'}
                label={'描述说明'}
                className={styles['base-form-item']}
              >
                <TextArea
                  placeholder={'请输入描述说明，比如规则的用途'}
                  maxLength={500}
                  showWordLimit
                  autoSize={{ minRows: 2, maxRows: 2 }}
                />
              </FormItem>
            </div>
          </div>
          <div
            className={classNames(
              styles['trigger-type'],
              styles['rule-form-item']
            )}
          >
            <FormItemGroup title={'触发方式'} className={'mb-6'} />
            <FormItem noStyle field={'triggerType'}>
              <TriggerType />
            </FormItem>
          </div>
          <div className={classNames(styles['trigger-setting'])}>
            <FormItemGroup title={'触发配置'} className={'mb-6 mt-6'} />
            <FormItemCard className={'!w-[900px] flex-shrink-0'}>
              <Form.Item shouldUpdate={() => true} noStyle>
                {({ triggerType }) => {
                  if (triggerType === 1) {
                    return (
                      <Form.Item noStyle>
                        <FormItemGroup
                          title={'每当以下时间'}
                          className={
                            'mb-4 !text-[14px] !font-[600] !leading-[22px]'
                          }
                        />
                        <SchedulerRun
                          options={{}}
                          onOptionsChange={function (options: CycleText): void {
                            throw new Error('Function not implemented.');
                          }}
                        />
                      </Form.Item>
                    );
                  }
                  return (
                    <Form.Item noStyle>
                      <FormItemGroup
                        title={'当发生以下事件'}
                        className={
                          'mb-4 !text-[14px] !font-[600] !leading-[22px]'
                        }
                      />
                      <FormItem
                        field={'changeType'}
                        label={'变更种类'}
                        required
                      >
                        <Radio.Group
                          options={Object.entries(CHANGE_TYPE_CONFIG).map(
                            ([key, value]) => {
                              return {
                                label: value,
                                value: key
                              };
                            }
                          )}
                        />
                      </FormItem>
                      <FormItem field={'modelId'} label={'本体场景'} required>
                        <OntoSceneSelect
                          placeholder={'请选择或搜索本体场景'}
                          currentSceneData={ruleDetail.modelInfo}
                          onChange={(value, option) => {
                            form.setFieldValue('modelId', value);
                            syncValidatedValues({
                              modelInfo: option
                            });
                          }}
                        />
                      </FormItem>
                      <Form.Item
                        noStyle
                        shouldUpdate={(p, c) => {
                          return p.modelId !== c.modelId;
                        }}
                      >
                        {({ modelId }) => {
                          return (
                            <FormItem
                              field={'objectTypeId'}
                              label={'对象类型'}
                              required
                            >
                              <ObjectTypeSelect
                                disabled={!modelId}
                                ontologyModelID={modelId}
                                onChange={(value, option) => {
                                  form.setFieldsValue({ objectTypeId: value });
                                  changeObjectType({
                                    objectTypeInfo: option,
                                    objectTypeId: value
                                  });
                                }}
                                placeholder={
                                  !modelId
                                    ? '请先选择本体场景'
                                    : '请选择或搜索对象类型'
                                }
                              />
                            </FormItem>
                          );
                        }}
                      </Form.Item>
                      <FormItem
                        label={'对象实例'}
                        required
                        shouldUpdate={(p, c) => {
                          // @ts-ignore
                          return p.objectTypeId !== c.objectTypeId;
                        }}
                      >
                        {({ objectTypeId }) => {
                          return (
                            <>
                              <Form.Item field={'insType'}>
                                <Radio.Group
                                  options={[
                                    {
                                      label: '全部实例',
                                      value: 'all'
                                    },
                                    {
                                      label: '部分实例',
                                      value: 'some'
                                    }
                                  ]}
                                />
                              </Form.Item>
                              <Form.Item field={'ins'}>
                                <InstanceSelect
                                  objectTypeId={objectTypeId}
                                  searchKey={''}
                                  primaryKey={primaryKey}
                                  mode={'multiple'}
                                  maxTagCount={'responsive'}
                                />
                              </Form.Item>
                            </>
                          );
                        }}
                      </FormItem>
                      <FormItem
                        triggerPropName={'checked'}
                        field={'advConfig'}
                        label={'高级配置'}
                        required={false}
                      >
                        <Switch checkedText={'开'} uncheckedText={'关'} />
                      </FormItem>
                      <Form.Item shouldUpdate={() => true} noStyle>
                        {/*是否开启高级配置*/}
                        {({ advConfig: enabled }) => {
                          if (enabled) {
                            return (
                              <Form.Item noStyle>
                                <FormItemGroup
                                  title={'且满足以下条件'}
                                  className={
                                    'mb-4 !text-[14px] !font-[600] !leading-[22px]'
                                  }
                                />
                                <FormItem
                                  field={'gateChangeFunction'}
                                  label={'条件函数'}
                                  tooltip={'触发时机到达后调用布尔函数二次确认'}
                                  required
                                >
                                  <FunctionSelect />
                                </FormItem>
                                <FormItem
                                  field={'gateChangeParams'}
                                  label={'参数配置'}
                                  required
                                ></FormItem>
                              </Form.Item>
                            );
                          }
                          return null;
                        }}
                      </Form.Item>
                    </Form.Item>
                  );
                }}
              </Form.Item>
            </FormItemCard>
          </div>
          <FormItemCard className={'mt-6 !w-[900px]'}>
            <FormItemGroup
              title={'系统将执行以下动作'}
              className={'mb-4 !text-[14px] !font-[600] !leading-[22px]'}
            />
            <Form.Item noStyle>
              <FormItem field={'action'} label={'绑定行为'} required>
                <ActionSelect
                  onChange={(v, action) => {
                    form.setFieldsValue({
                      action: v,
                      actionParams: action?.params
                    });
                    changeAction(action);
                  }}
                  actionData={
                    ruleDetail.actionConfig?.actionInfo as BehaviorActionItem
                  }
                />
              </FormItem>
              <Form.Item
                shouldUpdate={(p, c) => {
                  return p.action !== c.action;
                }}
                noStyle
              >
                {({ action }) => {
                  if (!!action) {
                    return (
                      <FormItem label={'参数配置'} required>
                        <ActionParams
                          field={'actionParams'}
                          actionData={
                            ruleDetail.actionConfig
                              ?.actionInfo as BehaviorActionItem
                          }
                        />
                      </FormItem>
                    );
                  }
                  return null;
                }}
              </Form.Item>
            </Form.Item>
          </FormItemCard>
        </div>
        <div className={styles['rule-form-aside']}>
          <div className={styles['rule-setting-config-sticky']}>
            <RuleSettingConfig mode={'card'} ruleData={ruleDetail} />
          </div>
        </div>
      </div>
    </Form>
  );
});
