import { Button, Checkbox, Form, Input } from '@arco-design/web-react';
import React from 'react';
import { IconMinusCircle, IconPlusCircle } from '@arco-design/web-react/icon';

export function DescriptionField() {
  return (
    <Form.Item label="描述" field="description">
      <Input.TextArea
        placeholder="请输入应用描述"
        maxLength={{ length: 255, errorOnly: true }}
        showWordLimit
      />
    </Form.Item>
  );
}

export function InstructionField() {
  return (
    <Form.Item label="" field="pre_prompt" rules={[{ required: true }]}>
      <Input.TextArea
        placeholder="这个应用有什么作用？它的行为如何？它应该避免做什么？"
        rows={6}
        className="min-h-[280px]"
        autoSize
        maxLength={{ length: 1000, errorOnly: true }}
        showWordLimit
      />
    </Form.Item>
  );
}

export function StarterField() {
  return (
    <Form.Item
      label={
        <span className="font-[600] text-[var(--color-text-1)]">开场白</span>
      }
      field="opening_statement"
    >
      <Input placeholder="输入会话开始语" />
    </Form.Item>
  );
}
export function SuggestedQuestionsField() {
  let addItem;
  return (
    <Form.Item
      className="suggested-questions"
      label={
        <div className="flex items-center justify-between">
          <span className="font-[600] text-[var(--color-text-1)]">
            预设问题
          </span>
          <div
            onClick={() => addItem('')}
            className="flex cursor-pointer items-center text-[rgb(var(--primary-6))]"
          >
            <IconPlusCircle className="mr-[4px] text-[16px]" />
            添加问题
          </div>
        </div>
      }
    >
      <Form.List field="suggested_questions">
        {(fields, { add, remove, move }) => {
          addItem = add;
          return fields.map((item, index) => {
            return (
              <div
                key={item.key}
                className="mb-[8px] flex items-center last:mb-0"
              >
                <Form.Item
                  className="mb-0 mr-[8px] flex-auto"
                  field={item.field}
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
                <Button
                  className="flex-none"
                  type="outline"
                  icon={<IconMinusCircle />}
                  onClick={() => remove(index)}
                />
              </div>
            );
          });
        }}
      </Form.List>
    </Form.Item>
  );
}

export function CapabilityField() {
  return (
    <Form.Item label="">
      <Checkbox.Group
        direction="vertical"
        options={[
          {
            label: '文生图',
            value: '1'
          },
          {
            label: '网页浏览',
            value: '2'
          },
          {
            label: '代码解释器',
            value: '3'
          }
        ]}
      ></Checkbox.Group>
    </Form.Item>
  );
}
