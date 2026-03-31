import React, { forwardRef, useImperativeHandle } from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import { FormInstance } from '@arco-design/web-react/es/Form';
import { Form, Input, Radio, Select, Switch } from '@arco-design/web-react';
import FormItem from '@/components/FormItem';
import {
  RuleSettingConfig,
  TriggerType
} from '@/pages/ruleManagement/components';
import SchedulerRun from '../SchedulerRun';
import { CycleText } from '../SchedulerRun/types';
import { FunctionsSelect } from '@/pages/ontologyScene/modules/behaviorActionDetail/components';

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

export interface RuleFormRef {
  form: FormInstance;
}

export const RuleForm = forwardRef<
  RuleFormRef | undefined,
  Record<string, any>
>((props, ref) => {
  const [form] = Form.useForm();

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
                      <>
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
                      </>
                    );
                  }
                  return (
                    <>
                      <FormItemGroup
                        title={'当发生以下事件'}
                        className={
                          'mb-4 !text-[14px] !font-[600] !leading-[22px]'
                        }
                      />
                      <FormItem
                        field={'eventConfig'}
                        label={'变更种类'}
                        required
                      >
                        <Radio.Group
                          options={[
                            {
                              label: '属性变化',
                              value: 1
                            },
                            {
                              label: '实例新增',
                              value: 2
                            },
                            {
                              label: '实例删除',
                              value: 3
                            }
                          ]}
                        />
                      </FormItem>
                      <FormItem
                        field={'eventConfig'}
                        label={'本体场景'}
                        required
                      >
                        <Select
                          placeholder={'请选择或搜索本体场景'}
                          options={[]}
                        />
                      </FormItem>
                      <FormItem
                        field={'eventConfig'}
                        label={'对象类型'}
                        required
                      >
                        <Select
                          placeholder={'请选择或搜索本体场景'}
                          options={[]}
                        />
                      </FormItem>
                      <FormItem
                        triggerPropName={'checked'}
                        field={'enabled'}
                        label={'高级配置'}
                        required={false}
                      >
                        <Switch checkedText={'开'} uncheckedText={'关'} />
                      </FormItem>
                      <Form.Item shouldUpdate={() => true} noStyle>
                        {({ enabled }) => {
                          if (enabled) {
                            return (
                              <>
                                <FormItemGroup
                                  title={'且满足以下条件'}
                                  className={
                                    'mb-4 !text-[14px] !font-[600] !leading-[22px]'
                                  }
                                />
                                <FormItem
                                  field={'changeConfig'}
                                  label={'条件函数'}
                                  tooltip={'触发时机到达后调用布尔函数二次确认'}
                                  required
                                >
                                  <Select placeholder={'请选择或搜索函数'} />
                                </FormItem>
                                <FormItem
                                  field={'scheduleConfig'}
                                  label={'参数配置'}
                                  required
                                ></FormItem>
                              </>
                            );
                          }
                          return null;
                        }}
                      </Form.Item>
                    </>
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
            <FormItem field={'actionConfig'} label={'绑定行为'} required>
              <Select placeholder={'请选择或搜索行为'} options={[]} />
            </FormItem>
            <FormItem
              field={'scheduleConfig'}
              label={'参数配置'}
              required
            ></FormItem>
          </FormItemCard>
        </div>
        <div className={styles['rule-form-aside']}>
          <div className={styles['rule-setting-config-sticky']}>
            <RuleSettingConfig mode={'card'} />
          </div>
        </div>
      </div>
    </Form>
  );
});
