import { Form, Input, Message } from '@arco-design/web-react';
import React from 'react';
import { FormRules } from '@ccf2e/arco-material';
import { appConfigStore } from '../model';

export function NameField() {
  return (
    <Form.Item label="应用名称" field="title" rules={FormRules.name.rules}>
      <Input
        placeholder="命名应用"
        maxLength={{ length: 127, errorOnly: true }}
        showWordLimit
        onBlur={async (evt) => {
          try {
            const val = evt.target.value.trim();
            if (val) {
              await appConfigStore.triggerCreateApp();
            }
          } catch (err) {
            Message.error(err?.message);
            console.error(err);
          }
        }}
      />
    </Form.Item>
  );
}
