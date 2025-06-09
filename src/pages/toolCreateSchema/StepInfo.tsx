import { Form, Input, Select } from '@arco-design/web-react';
import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import './index.css';
import { toolCreateStore } from './model';
import { observer } from 'mobx-react-lite';

function StepInfo(props, ref) {
  const [form] = Form.useForm();

  const formData = toolCreateStore.formData;
  useEffect(() => {
    if (formData) form.setFieldsValue(formData);
  }, [form, formData]);

  useImperativeHandle(ref, () => {
    return {
      async validate() {
        const values = await form.validate();
        toolCreateStore.setFormData(values);
      }
    };
  });

  const path = Form.useWatch('path', form);
  const method = Form.useWatch('method', form);
  const name = Form.useWatch('name', form);

  return (
    <Form
      layout="vertical"
      form={form}
      validateMessages={{ required: '必填项' }}
    >
      <div className="ml-auto mr-auto w-[84%] rounded-[8px] bg-[var(--color-bg-3)] p-[24px]">
        <div className="mx-auto w-[64%]">
          <div className="mb-[8px] text-[14px] font-[600] leading-[22px] text-[var(--color-text-1)]">
            工具基本信息
          </div>

          <Form.Item label="工具名称" rules={[{ required: true }]} field="name">
            <Input />
          </Form.Item>
          <Form.Item label="工具描述" rules={[{ required: true }]} field="des">
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            label={
              <span className="text-[14px] font-[600] leading-[22px] text-[var(--color-text-1)]">
                工具路径
              </span>
            }
            field="path"
            rules={[
              { required: true },
              {
                validator(value, callback) {
                  if (value && method && name) {
                    const tool = toolCreateStore.getTool(path, method);
                    if (tool && tool.operationId !== name) {
                      callback('工具的路径或请求方法重复了');
                      return;
                    }
                    callback();
                  } else callback();
                }
              }
            ]}
          >
            <Input addBefore={toolCreateStore.urlPrefix} />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-[14px] font-[600] leading-[22px] text-[var(--color-text-1)]">
                请求方法
              </span>
            }
            field="method"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                {
                  label: 'Get方法',
                  value: 'get'
                },
                {
                  label: 'Post方法',
                  value: 'post'
                },
                {
                  label: 'Delete方法',
                  value: 'delete'
                },
                {
                  label: 'Put方法',
                  value: 'put'
                },
                {
                  label: 'Patch方法',
                  value: 'patch'
                }
              ]}
            />
          </Form.Item>
        </div>
      </div>
    </Form>
  );
}
export default observer(forwardRef(StepInfo));
