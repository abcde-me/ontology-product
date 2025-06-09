import React, { useEffect, useState } from 'react';
import { Button, Drawer, Form, Input, Message, Radio, TreeSelect, Select, Space } from '@arco-design/web-react';
import {
  IconDelete,
  IconSettings,
  IconCopy
} from '@arco-design/web-react/icon';
import OptimizationIcon from '@/assets/optimization.svg';

export default function CreateByFewShot(props) {
  return (
    <div className='fewshot-prompt-content'>
      <Form.Item field="bgPrompt" required label="背景指令">
        <Input.TextArea
          maxLength={8000}
          showWordLimit
          style={{ height: 248, width: '100%' }}
        />
      </Form.Item>
      <Form.List field='examples' rules={[{required: true,}]}>
        {(fields, { add, remove }) => {
          return (
            <div>
              <div className='examples-header'><span className='star'>*</span>示例</div>
              <table className='example-table'>
                <colgroup>
                  <col style={{ width: '9.46%' }}></col>
                  <col style={{ width: '38.8%' }}></col>
                  <col style={{ width: '38.8%' }}></col>
                  <col style={{ width: '12.94%' }}></col>
                </colgroup>
                <thead><tr><th>序号</th><th>输入</th><th>输出</th><th>操作</th></tr></thead>
                <tbody>
                {fields.map((item, index) => {
                  return (
                    <tr key={item.key}>
                      <td>{index + 1}</td>
                      <td>
                      <Form.Item field={item.field + '.input'} noStyle>
                        <Input.TextArea
                          maxLength={8000}
                          showWordLimit
                          placeholder='请输入'
                          style={{ height: 100, width: '100%' }}
                        />
                      </Form.Item>
                      </td>
                      <td>
                      <Form.Item field={item.field + '.output'} noStyle>
                        <Input.TextArea
                          maxLength={8000}
                          showWordLimit
                          placeholder='请输入'
                          style={{ height: 100, width: '100%' }}
                        />
                      </Form.Item>
                      </td>
                      <td align='center'>
                        <Button type='text' onClick={() => remove(index)}>删除</Button>
                      </td>
                    </tr>
                  )
                })}
                </tbody>
                <tfoot>
                  <tr><td align="center" colSpan={4}><Button type='text' onClick={() => add()}>添加</Button></td></tr>
                </tfoot>
              </table>
            </div>
          )
        }}
          
      </Form.List>
    </div>
  )
}
