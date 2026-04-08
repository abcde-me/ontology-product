import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle
} from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import { FormInstance } from '@arco-design/web-react/es/Form';
import {
  Checkbox,
  Form,
  Input,
  Radio,
  Select,
  Switch
} from '@arco-design/web-react';
import FormItem from '@/components/FormItem';
import {
  ActionParams,
  ActionSelect,
  FunctionSelect,
  OntoSceneSelect,
  PropConditions,
  RuleSettingConfig,
  TriggerType
} from '@/pages/ruleManagement/components';
import SchedulerRun from '../SchedulerRun';
import { CycleText } from '../SchedulerRun/types';
import { useRuleManagementStore } from '../../stores';
import { BehaviorActionItem } from '@/pages/ontologyScene/types/behaviorActions';
import { buildAutoTrigger, getParamsFromData } from '../../utils';
import {
  AutoRuleFormData,
  ChangeType,
  ConditionType,
  GateConfigRes,
  MonthDayMode,
  PeriodType,
  ScheduleConfigRes
} from '../../types';
import { ObjectTypeSelect } from '@/pages/ontologyScene/componens';
import { InstanceSelect } from '@/pages/ontologyScene/componens/ObjectInstanceSelect/InsSelect';
import { useRequest } from 'ahooks';
import { isNil } from 'lodash-es';
import { listOntologyPhysicalProperties } from '@/api/ontologySceneLibrary/graph';
import { SelectWithNoData } from '@/components/new-no-data-comps';
import { InstanceScope } from '@/pages/ruleManagement/types/';
import { OntologyFunctionItem } from '@/pages/ontologyScene/types/ontologyFunction';
import { getAutoRuleList } from '@/api/businessAutomation/list';

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
  const propertyConditions = Form.useWatch('propertyConditions', form);
  const changeType = Form.useWatch('changeType', form);
  const { ruleDetail, getRule } = useRuleManagementStore((state) => ({
    changeAction: state.changeAction,
    changeObjectType: state.changeObjectTypes,
    ruleDetail: state.ruleData,
    getRule: () => state.ruleData
  }));

  const { data: properties, loading: propertiesLoading } = useRequest(
    () => {
      if (isNil(objectTypeId)) {
        return Promise.resolve(undefined);
      }
      return listOntologyPhysicalProperties({
        objectTypeIdList: [Number(objectTypeId)],
        // isPrimary: 1,
        ontologyModelID: +modelId,
        isUse: 1
      }).then((res) => {
        return res.data.result || [];
      });
    },
    {
      ready: !!objectTypeId && !!modelId,
      refreshDeps: [objectTypeId, modelId]
    }
  );

  const primaryKey = properties?.find(({ isPrimary }) => !!isPrimary)?.name;

  const allProperties = (() => {
    if (!!properties?.length) {
      return properties.map(({ name, id }) => ({
        label: name,
        value: id!
      }));
    }
    return [];
  })();

  const syncValidatedValues = useRuleManagementStore(
    (state) => state.syncValidatedValues
  );

  const validateSameName = async (name: string) => {
    const rules = await getAutoRuleList({
      filter: name,
      pageNo: 1,
      pageSize: 10
    });
    const nameExist = rules.items.some((rule) => {
      return rule.name === name && rule.id !== ruleDetail.id;
    });
    if (nameExist) {
      form.setFields({
        name: {
          error: {
            message: '名称不可重复'
          }
        }
      });
      return Promise.reject('名称不可重复');
    }
    return Promise.resolve();
  };

  const propsChange = (propIds?: React.Key[]) => {
    const currentProps = ruleDetail.changeConfig?.propertyConditions;
    const currentPropMap = new Map(currentProps?.map((p) => [p.id, p]));
    const nextProps = properties
      ?.filter(({ id }) => propIds?.includes(id as number))
      .flatMap((p) => {
        if (currentPropMap.size) {
          if (currentPropMap.has(p.id as number)) {
            const propValue = currentPropMap.get(p.id as number);
            return {
              ...propValue,
              name: p.name,
              fieldType: p.columnType
            };
          }
          return [];
        }
        return {
          id: p.id,
          name: p.name,
          fieldType: p.columnType,
          operator: undefined,
          type: ConditionType.AnyChange,
          value: undefined
        };
      });
    form.setFieldsValue({
      propertyList: nextProps
    });
    syncValidatedValues({
      changeConfig: {
        propertyConditions: nextProps as any
      }
    });
  };

  const handleManagedValuesChange = (
    changedValues: Record<string, any>,
    values
  ) => {
    const changedKeys = Object.keys(changedValues || {});
    const needNotChange = ['action', 'modelId', 'objectTypeId'].some((key) =>
      changedKeys?.includes(key)
    );
    // 编辑的的数据不需要进行数据初始化
    if (!changedKeys.length || needNotChange || changedKeys.length > 2) return;
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
        if (
          changedKeys.some((key) => ['cycle', 'date', 'time'].includes(key))
        ) {
          const { triggerType, cycle, date, time } = values;
          if (triggerType === 1) {
            const scheduleConfig: ScheduleConfigRes = {
              enabled: true,
              time: time || '',
              periodType:
                cycle === 'per_week'
                  ? PeriodType.Weekly
                  : cycle === 'per_month'
                    ? PeriodType.Monthly
                    : PeriodType.Daily
            };

            if (cycle === 'per_week') {
              const weekDays = Array.isArray(date)
                ? date
                    .map((item) => Number(item))
                    .filter((item) => !Number.isNaN(item))
                : [];

              if (weekDays.length) {
                scheduleConfig.weekDays = weekDays;
              }
            }

            if (cycle === 'per_month') {
              if (date === 'L') {
                scheduleConfig.monthDayMode = MonthDayMode.Last;
              } else {
                const monthDays = (Array.isArray(date) ? date : [date])
                  .map((item) => Number(item))
                  .filter((item) => !Number.isNaN(item));

                scheduleConfig.monthDayMode = MonthDayMode.Specific;
                if (monthDays.length) {
                  scheduleConfig.monthDays = monthDays;
                }
              }
            }

            return syncValidatedValues({
              scheduleConfig
            });
          }
          return;
        }
        if (changedKeys.some((key) => key.includes('actionParams'))) {
          syncValidatedValues({
            actionConfig: {
              parameters: values.actionParams
            }
          });
          return;
        }
        if (changedKeys.some((key) => key.includes('functionParams'))) {
          syncValidatedValues({
            gateConfig: {
              parameters: values.functionParams
            }
          });
          return;
        }
        if ('propertyConditions' in changedValues) {
          propsChange(changedValues.propertyConditions);
          return;
        }
      })
      .catch((e) => {
        console.error('数据校验失败', e);
      });
  };
  const validateValues = async () => {
    try {
      const name = form.getFieldValue('name');
      const formData = await form.validate();
      await validateSameName(name);
      return Promise.resolve({
        ...formData,
        name
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  useImperativeHandle(ref, () => ({
    form: {
      ...form,
      validate: validateValues
    }
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
                  onBlur={(e) => {
                    if (!e.target.value?.trim()) return;
                    validateSameName(e.target.value);
                  }}
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
                          onChange={(value) => {
                            form.setFieldsValue({
                              changeType: value,
                              propertyConditions: undefined,
                              propertyList: undefined
                            });
                            syncValidatedValues({
                              changeConfig: {
                                changeType: value,
                                propertyConditions: undefined
                              }
                            });
                          }}
                        />
                      </FormItem>
                      <FormItem field={'modelId'} label={'本体场景'} required>
                        <OntoSceneSelect
                          placeholder={'请选择或搜索本体场景'}
                          currentSceneData={ruleDetail.modelInfo}
                          onChange={(value, option) => {
                            // 修改本体场景之后，重置对象类型、对象实例、属性条件
                            form.setFieldsValue({
                              modelId: value,
                              objectTypeId: undefined,
                              insType: InstanceScope.All,
                              propertyConditions: undefined,
                              propertyList: undefined
                            });
                            syncValidatedValues({
                              modelInfo: option,
                              modelId: value,
                              changeConfig: {
                                objectTypeId: undefined,
                                instanceScope: InstanceScope.All,
                                objectTypeInfo: undefined,
                                instanceIds: undefined,
                                propertyConditions: undefined
                              }
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
                                  // 修改对象类型之后，对象实例、属性条件
                                  form.setFieldsValue({
                                    objectTypeId: value,
                                    insType: InstanceScope.All,
                                    propertyConditions: undefined,
                                    propertyList: undefined
                                  });
                                  syncValidatedValues({
                                    changeConfig: {
                                      objectTypeId: value,
                                      instanceScope: InstanceScope.All,
                                      objectTypeInfo: option,
                                      instanceIds: undefined,
                                      propertyConditions: undefined
                                    }
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

                      {/*用户选择完对象类型之后才能进行下一步的选择*/}
                      <Form.Item
                        noStyle
                        shouldUpdate={(p, c) =>
                          p.objectTypeId !== c.objectTypeId
                        }
                      >
                        {({ objectTypeId }) => {
                          if (!objectTypeId) return null;
                          return (
                            <>
                              <FormItem
                                label={'对象实例'}
                                required
                                className={'mb-0'}
                                shouldUpdate={(p, c) => {
                                  return ['objectTypeId', 'insType'].some(
                                    (field) => {
                                      return p[field] !== c[field];
                                    }
                                  );
                                }}
                              >
                                {({ objectTypeId, insType }) => {
                                  return (
                                    <>
                                      <Form.Item field={'insType'}>
                                        <Radio.Group
                                          disabled={!objectTypeId}
                                          options={[
                                            {
                                              label: '全部实例',
                                              value: InstanceScope.All
                                            },
                                            {
                                              label: '部分实例',
                                              value: InstanceScope.Specific
                                            }
                                          ]}
                                          onChange={(value) => {
                                            form.setFieldsValue({
                                              insType: value,
                                              instanceIds: undefined
                                            });
                                            syncValidatedValues({
                                              changeConfig: {
                                                instanceScope: value,
                                                instanceIds: undefined
                                              }
                                            });
                                          }}
                                        />
                                      </Form.Item>
                                      {insType !== InstanceScope.All && (
                                        <Form.Item field={'instanceIds'}>
                                          <InstanceSelect
                                            objectTypeId={objectTypeId}
                                            searchKey={''}
                                            primaryKey={primaryKey}
                                            mode={'multiple'}
                                            maxTagCount={'responsive'}
                                            placeholder={
                                              !objectTypeId
                                                ? '请先选择对象类型'
                                                : '请选择对象实例'
                                            }
                                            onChange={(value) => {
                                              form.setFieldsValue({
                                                instanceIds: value
                                              });
                                              syncValidatedValues({
                                                changeConfig: {
                                                  instanceIds: value as number[]
                                                }
                                              });
                                            }}
                                          />
                                        </Form.Item>
                                      )}
                                    </>
                                  );
                                }}
                              </FormItem>
                              <Form.Item noStyle shouldUpdate={() => true}>
                                {({
                                  propertyConditions,
                                  insType,
                                  changeType
                                }) => {
                                  if (changeType !== ChangeType.PropertyChange)
                                    return null;
                                  return (
                                    <FormItem
                                      label={'属性条件'}
                                      className={'mb-0'}
                                      required
                                    >
                                      <FormItem field={'propertyConditions'}>
                                        <SelectWithNoData
                                          placeholder={
                                            !propertyConditions?.length &&
                                            insType !== 'all'
                                              ? '请先选择对象实例'
                                              : '请选择属性'
                                          }
                                          mode={'multiple'}
                                          maxTagCount={'responsive'}
                                        >
                                          {!!allProperties?.length && (
                                            <div
                                              className={
                                                'flex h-[36px] items-center px-[7px]'
                                              }
                                            >
                                              <Checkbox
                                                onChange={(checked) => {
                                                  form.setFieldValue(
                                                    'propertyConditions',
                                                    checked
                                                      ? allProperties.map(
                                                          (item) => item.value
                                                        )
                                                      : undefined
                                                  );
                                                }}
                                                // value长度等于所有属性长度时，表示全选
                                                checked={
                                                  [
                                                    propertyConditions,
                                                    allProperties
                                                  ].every(
                                                    (arr) => !!arr?.length
                                                  ) &&
                                                  propertyConditions.length ===
                                                    allProperties.length
                                                }
                                              >
                                                全部
                                              </Checkbox>
                                            </div>
                                          )}
                                          {allProperties.map((item) => {
                                            return (
                                              <Select.Option
                                                key={item.value}
                                                value={item.value}
                                              >
                                                {item.label}
                                              </Select.Option>
                                            );
                                          })}
                                        </SelectWithNoData>
                                      </FormItem>
                                      {!!propertyConditions?.length && (
                                        <FormItem field={'propertyList'}>
                                          <PropConditions
                                            allProps={properties}
                                            propIds={propertyConditions}
                                            onChange={(value) => {
                                              form.setFieldValue(
                                                'propertyList',
                                                value
                                              );
                                              syncValidatedValues({
                                                changeConfig: {
                                                  propertyConditions: value
                                                }
                                              });
                                            }}
                                          />
                                        </FormItem>
                                      )}
                                    </FormItem>
                                  );
                                }}
                              </Form.Item>
                            </>
                          );
                        }}
                      </Form.Item>
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
                                  field={'function'}
                                  label={'条件函数'}
                                  tooltip={'触发时机到达后调用布尔函数二次确认'}
                                  required
                                >
                                  <FunctionSelect
                                    onChange={(v, f: OntologyFunctionItem) => {
                                      // 函数发生变化时，重置函数参数表单和当前规则数据
                                      form.setFieldValue('functionParams', v);
                                      const functionParams = getParamsFromData(
                                        f?.params
                                      ) as any;
                                      form.setFieldsValue({
                                        functionParams
                                      });
                                      syncValidatedValues({
                                        gateConfig: v
                                          ? ({
                                              enabled: true,
                                              functionId: v,
                                              functionCode: f.code,
                                              functionName: f.name,
                                              functionInfo: f,
                                              parameters: functionParams
                                            } as GateConfigRes)
                                          : undefined
                                      });
                                    }}
                                  />
                                </FormItem>
                                <Form.Item
                                  noStyle
                                  shouldUpdate={(p, c) => {
                                    return p.function !== c.function;
                                  }}
                                >
                                  {({ function: functionId }) => {
                                    if (isNil(functionId)) return null;
                                    return (
                                      <FormItem label={'参数配置'} required>
                                        <ActionParams
                                          field={'functionParams'}
                                          modelId={
                                            ruleDetail.gateConfig?.functionInfo
                                              ?.ontologyModelID
                                          }
                                        />
                                      </FormItem>
                                    );
                                  }}
                                </Form.Item>
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
                    const actionParams = getParamsFromData(action?.params);
                    form.setFieldsValue({
                      action: v,
                      actionParams
                    });
                    syncValidatedValues({
                      actionConfig: v
                        ? {
                            actionInfo: action,
                            actionCode: action?.code,
                            actionId: v as any,
                            parameters: actionParams as any
                          }
                        : undefined
                    });
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
                          modelId={
                            ruleDetail.actionConfig?.actionInfo?.ontologyModelID
                          }
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
