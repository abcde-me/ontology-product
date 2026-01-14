import React, { memo, useEffect, useState } from 'react';
import {
  Button,
  Divider,
  Drawer,
  Form,
  Input,
  Message,
  Radio,
  Tooltip,
  Typography
} from '@arco-design/web-react';
import {
  IconDelete,
  IconMenuFold,
  IconMenuUnfold,
  IconPlus
} from '@arco-design/web-react/icon';
import { useStore } from '@/pages/workflowConfig/task/store';
import { useShallow } from 'zustand/react/shallow';
import { EditWorkflowParams } from '@/types/workflowApi';
import {
  DEFAULT_FLOW_INFO,
  EXECUTION_TYPE_OPTIONS,
  FORM_RADIO_SCHEMA
} from '@/pages/workflowList/types';
import { useDebounceFn } from 'ahooks';
import { editWorkflow } from '@/api/workflow';
import { useNodesReadOnly } from '@/pages/workflowConfig/workflow/hooks';
import { LocalParam } from '@/pages/workflowConfig/types/workflow';
import styles from './index.module.scss';
import cn from 'classnames';
import { getStructuredWorkflowList } from '@/api/workflowList';

const formatLocalParams = (params: LocalParam[]) => {
  const localParams = params.map((item) => {
    const { prop, value } = item;
    const res: Partial<LocalParam> = {
      direct: 'IN',
      type: 'VARCHAR'
    };
    if (!!prop) {
      res.prop = prop;
    }
    if (!!value) {
      res.value = value;
    }
    return res;
  });
  return JSON.stringify(localParams);
};

export default memo(function FlowSetting() {
  const [show, setShow] = useState(true);
  const [form] = Form.useForm();
  const { workflowDetail, setWorkflowDetail } = useStore(
    useShallow((state) => ({
      workflowDetail: state.workflowDetail,
      setWorkflowDetail: state.setWorkflowDetail
    }))
  );
  const { nodesReadOnly } = useNodesReadOnly();

  useEffect(() => {
    if (!workflowDetail) return;
    const {
      workflow_name,
      global_params,
      execution_type = DEFAULT_FLOW_INFO.execution_type,
      failure_strategy = DEFAULT_FLOW_INFO.failure_strategy,
      process_instance_priority = DEFAULT_FLOW_INFO.process_instance_priority,
      description
    } = workflowDetail;
    const formData: Record<string, any> = {
      workflow_name,
      execution_type,
      failure_strategy,
      process_instance_priority,
      description
    };
    if (global_params) {
      try {
        formData.global_params = JSON.parse(global_params);
      } catch (e) {
        formData.global_params = [{ prop: undefined, value: undefined }];
        Message.error('工作流全局参数错误');
      }
    }
    form.setFieldsValue(formData);
  }, [workflowDetail]);

  const saveFlow = async (flow: EditWorkflowParams) => {
    const workflowRes = await editWorkflow(flow);

    if (workflowRes?.status === 200) {
      workflowDetail &&
        setWorkflowDetail({
          ...workflowDetail,
          ...flow,
          global_params: formatLocalParams(flow.global_params || [])
        });
      return Promise.resolve();
    }
    return Promise.reject(workflowRes.message || '');
  };

  const { run: onFlowChange } = useDebounceFn(
    (changedValues) => {
      // 批量赋值时不走保存逻辑
      if (Object.keys(changedValues).length > 1) return;
      form
        .validate()
        .then((res) => {
          const { description, params, global_params, ...otherData } = res;
          const saveData: EditWorkflowParams = {
            workflow_uuid: workflowDetail?.workflow_uuid,
            ...otherData
          };
          if (description) {
            saveData.description = description;
          }
          if (global_params?.length) {
            saveData.global_params = global_params.map((p) => ({
              ...p,
              direct: 'IN',
              type: 'VARCHAR'
            }));
          }
          return saveData;
        })
        .then(saveFlow)
        .catch((e) => {
          console.error(e);
          typeof e === 'string' && Message.error(e);
        });
    },
    { wait: 2000 }
  );
  return (
    <div
      className={cn({
        'app-workflow-page-sub-header': true,
        [styles['flow-setting']]: true,
        [styles['flow-setting-open']]: show
      })}
    >
      {!show ? (
        <Button
          type={'text'}
          className={
            'p-0 font-PingFangSc text-[16px] font-medium leading-6 text-default'
          }
          style={{ color: '#0F172A' }}
          onClick={() => setShow(true)}
        >
          工作流配置
          <Tooltip content={'打开工作流配置'}>
            <IconMenuUnfold className={'text-[#334155] hover:text-[#438DFB]'} />
          </Tooltip>
        </Button>
      ) : (
        <div className={'mt-[-8px] flex h-full flex-col overflow-hidden'}>
          <div
            className={`${styles['setting-header']} flex flex-shrink-0 items-center justify-between pb-4 pt-4`}
          >
            <div
              className={
                'font-PingFangSc text-[16px] font-medium leading-6 text-[#1E293B]'
              }
            >
              工作流配置
            </div>
            <Tooltip content={'收起'}>
              <IconMenuFold
                className={
                  'text-[16px] hover:cursor-pointer hover:text-[#438DFB]'
                }
                onClick={() => setShow(false)}
              />
            </Tooltip>
          </div>
          <div
            className={`flex-1 overflow-y-auto overflow-x-hidden ${styles['setting-content']} mt-4`}
          >
            <Form
              form={form}
              autoComplete={'off'}
              layout={'vertical'}
              onChange={onFlowChange}
              disabled={nodesReadOnly}
              validateTrigger={'onFinish'}
            >
              <div
                className={
                  'mb-2 font-PingFangSc text-[14px] font-medium leading-[22px]'
                }
              >
                基本信息
              </div>
              <Form.Item
                field={'workflow_name'}
                label={'工作流名称：'}
                required
                rules={[
                  {
                    validator(value, onError) {
                      if (!value?.trim()) {
                        onError('工作流名称不能为空');
                        return;
                      }
                      return getStructuredWorkflowList({
                        keywords: value,
                        page: 1,
                        page_size: 1
                      })
                        .then((res) => {
                          if (res.items.length >= 1) {
                            onError('工作流名称已存在');
                          }
                          return Promise.resolve();
                        })
                        .catch(console.error);
                    }
                  }
                ]}
              >
                <Input
                  maxLength={100}
                  placeholder={'请输入工作流名称'}
                  showWordLimit
                  allowClear
                />
              </Form.Item>
              <Form.Item field={'description'} label={'工作流描述：'}>
                <Input placeholder={'请输入工作流描述'} />
              </Form.Item>
              <Divider className={'mb-4 mt-0'} />
              <div
                className={
                  'mb-2 font-PingFangSc text-[14px] font-medium leading-[22px]'
                }
              >
                运行配置
              </div>
              {FORM_RADIO_SCHEMA.flatMap(({ options, message, ...other }) =>
                other.field === 'execution_type' ? (
                  []
                ) : (
                  <Form.Item
                    {...other}
                    key={other.field}
                    rules={[{ required: true, message }]}
                  >
                    <Radio.Group options={options} />
                  </Form.Item>
                )
              )}
              <Divider className={'mb-4 mt-0'} />
              <div
                className={
                  'mb-2 font-PingFangSc text-[14px] font-medium leading-[22px]'
                }
              >
                全局配置
              </div>
              <Form.Item
                label={'运行策略：'}
                field={'execution_type'}
                rules={[{ required: true, message: '请选择运行策略' }]}
              >
                <Radio.Group>
                  <div className={'flex w-full gap-4'}>
                    <Radio value={'PARALLEL'}>并行运行</Radio>
                    <Radio value={'SERIAL_WAIT'}>串行等待</Radio>
                  </div>
                  <div className={'flex w-full gap-4'}>
                    <Radio value={'SERIAL_DISCARD'}>串行抛弃</Radio>
                    <Radio value={'SERIAL_PRIORITY'}>串行优先</Radio>
                  </div>
                </Radio.Group>
              </Form.Item>
              <Form.List field={'global_params'}>
                {(fields, { add, remove }) => {
                  return (
                    <>
                      <div
                        className={'flex w-full items-center justify-between'}
                      >
                        全局参数：
                        <Button
                          type={'text'}
                          className={`flex items-center justify-center ${styles['add-params']}`}
                          icon={<IconPlus className={'text-[#1E293B]'} />}
                          size={'mini'}
                          onClick={() => add()}
                          disabled={nodesReadOnly}
                        />
                      </div>
                      <Form.Item className={styles['add-field-action']}>
                        {!!fields.length &&
                          fields.map((field, index) => (
                            <div key={field.key} className={'flex flex-1'}>
                              <div className={'fields-item flex gap-3'}>
                                <Form.Item
                                  field={`${field.field}.prop`}
                                  required
                                  label={
                                    index === 0 ? (
                                      <Form.Item noStyle>
                                        <div
                                          className={
                                            'font-PingFangSc text-[12px] font-[600] leading-[18px]'
                                          }
                                        >
                                          参数名
                                        </div>
                                      </Form.Item>
                                    ) : undefined
                                  }
                                  rules={[
                                    {
                                      validator(v, onInValid) {
                                        if (!v) {
                                          onInValid('参数名不能为空');
                                          return;
                                        }
                                        const sameKey = form
                                          .getFieldValue('global_params')
                                          .filter(({ prop }) => prop === v);
                                        if (sameKey.length > 1) {
                                          onInValid('参数名重复');
                                          return;
                                        }
                                      }
                                    }
                                  ]}
                                  dependencies={fields.flatMap((f) =>
                                    field.key === f.key ? [] : `${f.field}.key`
                                  )}
                                >
                                  <Input placeholder={'参数名'} />
                                </Form.Item>
                                <Form.Item
                                  field={`${field.field}.value`}
                                  rules={[
                                    {
                                      required: true,
                                      message: '参数值不能为空'
                                    }
                                  ]}
                                  label={
                                    index === 0 ? (
                                      <Form.Item noStyle>
                                        <div
                                          className={
                                            'font-PingFangSc text-[12px] font-[600] leading-[18px]'
                                          }
                                        >
                                          参数值
                                        </div>
                                      </Form.Item>
                                    ) : undefined
                                  }
                                >
                                  <Input placeholder={'参数值'} />
                                </Form.Item>
                              </div>
                              <Form.Item
                                className={'w-auto flex-shrink-0'}
                                label={
                                  index === 0 ? (
                                    <Typography.Text
                                      bold
                                      className={styles['label-hidden']}
                                    >
                                      删
                                    </Typography.Text>
                                  ) : undefined
                                }
                              >
                                <Button
                                  type={'text'}
                                  className={'p-0'}
                                  icon={
                                    <IconDelete className={'text-[#0F172A]'} />
                                  }
                                  onClick={() => {
                                    remove(index);
                                    setTimeout(() => {
                                      form
                                        .validate(
                                          fields.map(
                                            ({ field }) => `${field}.prop`
                                          )
                                        )
                                        .catch(console.error);
                                    }, 0);
                                  }}
                                />
                              </Form.Item>
                            </div>
                          ))}
                      </Form.Item>
                    </>
                  );
                }}
              </Form.List>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
});
