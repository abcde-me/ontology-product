import { Form, Input, Select } from '@arco-design/web-react';
import React from 'react';
import * as _ from 'lodash';
import MonacoEditor from 'react-monaco-editor';

export function NameField() {
  return (
    <Form.Item label="工具名称" field="provider">
      <Input />
    </Form.Item>
  );
}

export function DescField() {
  return (
    <Form.Item label="工具描述" field="description">
      <Input.TextArea />
    </Form.Item>
  );
}

function JSONEditor(props: { value?: string; onChange?: (val) => void }) {
  const { value, onChange } = props;
  return (
    <MonacoEditor
      width="800"
      height="600"
      language="json"
      theme="vs-dark"
      value={value}
      options={{
        lineNumbers: 'on',
        roundedSelection: false,
        scrollBeyondLastLine: false,
        readOnly: false
      }}
    />
  );
}

export function JSONFiled() {
  return (
    <Form.Item label="" field="schema">
      <JSONEditor />
    </Form.Item>
  );
}

export function AuthField() {
  return (
    <>
      <Form.Item label="鉴权类型" field="credentials.auth_type">
        <Select
          options={[
            { label: '无', value: 'none' },
            { label: 'API Key', value: 'api_key' }
          ]}
        ></Select>
      </Form.Item>
      <Form.Item noStyle shouldUpdate>
        {(values) => {
          if (_.get(values, 'credentials.auth_type') === 'none') return null;
          return (
            <>
              <Form.Item
                label="鉴权头部前缀"
                field="credentials.api_key_header_prefix"
              >
                <Select
                  options={[
                    { label: 'Basic', value: 'basic' },
                    { label: 'Bearer', value: 'bearer' },
                    { label: 'Custom', value: 'custom' }
                  ]}
                ></Select>
              </Form.Item>
              <Form.Item label="键" field="credentials.api_key_header">
                <Input />
              </Form.Item>
              <Form.Item label="值" field="credentials.api_key_value">
                <Input />
              </Form.Item>
            </>
          );
        }}
      </Form.Item>
    </>
  );
}

export function PrivacyField() {
  return (
    <Form.Item label="隐私协议" field="privacy_policy">
      <Input />
    </Form.Item>
  );
}
