import React, { memo, useEffect, useState } from 'react';
import {
  Button,
  Drawer,
  Form,
  Input,
  Message,
  Radio,
  Typography
} from '@arco-design/web-react';
import {
  IconDelete,
  IconMenuFold,
  IconMenuUnfold,
  IconPlus
} from '@arco-design/web-react/icon';
import styled from '@emotion/styled';
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
import { isEmpty } from 'lodash-es';

export default memo(function FlowSetting() {
  const [show, setShow] = useState(true);
  const [form] = Form.useForm();
  const { workflowDetail, setWorkflowDetail } = useStore(
    useShallow((state) => ({
      workflowDetail: state.workflowDetail,
      setWorkflowDetail: state.setWorkflowDetail
    }))
  );

  useEffect(() => {
    if (!workflowDetail) return;
    const {
      workflow_name,
      params,
      execution_type = DEFAULT_FLOW_INFO.execution_type,
      failure_strategy = DEFAULT_FLOW_INFO.failure_strategy,
      process_instance_priority = DEFAULT_FLOW_INFO.process_instance_priority
    } = workflowDetail;
    const formData: Record<string, any> = {
      workflow_name,
      execution_type,
      failure_strategy,
      process_instance_priority
    };
    if (!!params) {
      formData.params = Object.entries(params).map(([key, value]) => ({
        key,
        value
      }));
    }
    form.setFieldsValue(formData);
  }, [workflowDetail]);

  const saveFlow = async (flow: EditWorkflowParams) => {
    const workflowRes = await editWorkflow(flow);

    if (workflowRes?.status === 200) {
      workflowDetail &&
        setWorkflowDetail({
          ...workflowDetail,
          ...flow
        });
      return Promise.resolve();
    }
    return Promise.reject();
  };

  const { run: onFlowChange } = useDebounceFn(
    () => {
      form
        .validate()
        .then((res) => {
          const {
            workflow_name,
            description,
            process_instance_priority,
            params,
            execution_type
          } = res;
          const saveData: EditWorkflowParams = {
            workflow_name,
            process_instance_priority,
            workflow_uuid: workflowDetail?.workflow_uuid,
            execution_type
          };
          if (description) {
            saveData.description = description;
          }
          if (params?.length) {
            const paramObj: Record<string, any> = {};
            params.forEach(({ key, value }: { key: string; value: any }) => {
              if (key) paramObj[key] = value;
            });
            !isEmpty(paramObj) && (saveData.params = paramObj);
          }
          return saveData;
        })
        .then(saveFlow)
        .catch(console.error);
    },
    { wait: 200 }
  );
  return (
    <SettingContainer
      className={'app-workflow-page-sub-header'}
      data-mode={show ? 'open' : 'close'}
    >
      {!show ? (
        <Button
          type={'text'}
          className={'p-0'}
          style={{ color: '#0F172A' }}
          onClick={() => setShow(true)}
        >
          工作流配置
          <IconMenuUnfold />
        </Button>
      ) : (
        <div className={'mt-[-8px]'}>
          <div className={'setting-header flex justify-between pb-4 pt-4'}>
            <Typography.Text bold>工作流配置</Typography.Text>
            <IconMenuFold
              className={'text-[16px] hover:cursor-pointer'}
              onClick={() => setShow(false)}
            />
          </div>
          <GroupLine />
          <Form
            form={form}
            autoComplete={'off'}
            layout={'vertical'}
            initialValues={DEFAULT_FLOW_INFO}
            onChange={onFlowChange}
          >
            <Typography.Text bold className={'mb-2'}>
              基本信息
            </Typography.Text>
            <Form.Item
              field={'workflow_name'}
              label={'工作流名称'}
              required
              rules={[{ required: true, message: '工作流名称不能为空' }]}
            >
              <Input
                maxLength={30}
                placeholder={'请输入工作流名称'}
                showWordLimit
              />
            </Form.Item>
            <Form.Item field={'description'} label={'工作流描述'}>
              <Input placeholder={'请输入工作流描述'} />
            </Form.Item>
            <GroupLine />
            <Typography.Text bold className={'mb-2'}>
              运行配置
            </Typography.Text>
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
            <GroupLine />
            <Typography.Text bold className={'mb-2'}>
              全局配置
            </Typography.Text>
            <Form.Item
              label={'运行策略'}
              field={'execution_type'}
              rules={[{ required: true, message: '请选择运行策略' }]}
            >
              <Radio.Group options={EXECUTION_TYPE_OPTIONS} />
            </Form.Item>
            <Form.List field={'params'}>
              {(fields, { add, remove }) => {
                return (
                  <>
                    <div className={'flex w-full items-center justify-between'}>
                      全局参数
                      <Button
                        type={'default'}
                        size={'mini'}
                        icon={<IconPlus />}
                        onClick={() => add()}
                      />
                    </div>
                    <Form.Item className={'add-field-action'}>
                      {!!fields.length &&
                        fields.map((field, index) => (
                          <div key={field.key} className={'flex flex-1'}>
                            <div className={'fields-item flex gap-3'}>
                              <Form.Item
                                field={`${field.field}.key`}
                                label={
                                  index === 0 ? (
                                    <Form.Item noStyle>
                                      <Typography.Text bold>
                                        参数名
                                      </Typography.Text>
                                    </Form.Item>
                                  ) : undefined
                                }
                                rules={[
                                  {
                                    validator(v, onInValid) {
                                      const sameKey = form
                                        .getFieldValue('params')
                                        .filter(({ key }) => key === v);
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
                                label={
                                  index === 0 ? (
                                    <Form.Item noStyle>
                                      <Typography.Text bold>
                                        参数值
                                      </Typography.Text>
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
                                    className={'label-hidden'}
                                  >
                                    删
                                  </Typography.Text>
                                ) : undefined
                              }
                            >
                              <Button
                                type={'text'}
                                className={'p-0'}
                                icon={<IconDelete />}
                                onClick={() => {
                                  remove(index);
                                  setTimeout(() => {
                                    form
                                      .validate(
                                        fields.map(
                                          ({ field }) => `${field}.key`
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
      )}
    </SettingContainer>
  );
});
const SettingContainer = styled.div`
  height: ${(props) =>
    props['data-mode'] === 'open' ? 'calc(100vh - 140px)' : 'auto'};
  width: ${(props) => (props['data-mode'] === 'open' ? '360px' : 'auto')};
  align-items: flex-start !important;
  overflow: auto;
  position: relative;

  .label-hidden {
    visibility: hidden;
  }

  .add-field-action {
    .arco-form-label-item {
      label {
        width: 100%;
      }
    }
  }

  .arco-radio-group {
    label {
      margin-right: 10px;
    }
  }
`;
const GroupLine = styled.div`
  width: 100%;
  height: 1px;
  background: #e2e8f0;
  margin-bottom: 8px;
`;
