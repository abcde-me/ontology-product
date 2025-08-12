import React from 'react';
import { Typography } from '@arco-design/web-react';
import SqlEditor from './components/SqlEdior';

export default function SqlEditorIndex() {
  return (
    <div className="bg-white p-[10px]">
      <div>
        <Typography.Title heading={5}>SQL编码区</Typography.Title>
      </div>

      <SqlEditor />

      <div>
        <Typography.Title heading={5}>运行结果区</Typography.Title>
        <span>{'selectedCode'}</span>
        <Typography.Title heading={6}>Error in SQL:</Typography.Title>
        <Typography.Text>语法错误</Typography.Text>
      </div>
    </div>
  );
}
