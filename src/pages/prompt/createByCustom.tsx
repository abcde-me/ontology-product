import React, { useEffect, useState } from 'react';
import { Button, Drawer, Form, Input, Message, Radio, TreeSelect, Select, Space } from '@arco-design/web-react';
import {
  IconDelete,
  IconSettings,
  IconCopy
} from '@arco-design/web-react/icon';
import OptimizationIcon from '@/assets/optimization.svg';

export default function CreateByCustom(props) {
  return (
    <Form.Item field="content" required label="">
      <div className='custom-prompt-content'>
        <div className='content-header'>
          <span className='prefix-text'><span className='star'>*</span>Prompt内容</span>
          <div className='prompt-content-suffix-actions'>
            <div className='copy-action'><IconCopy className='text-[#007DFA] size-[16px] mr-[4]px'/><span>复制完整Prompt</span></div>
            <div className='opt-action'><OptimizationIcon className='size-[16px] mr-[4]px'/><span>优化Prompt</span></div>
          </div>
        </div>
        
        <Input.TextArea
          maxLength={8000}
          showWordLimit
          style={{ height: 248, width: '100%' }}
        />
      </div>
    </Form.Item>
  )
}
