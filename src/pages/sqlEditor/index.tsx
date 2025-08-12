import React, { useRef, useState } from 'react';
import { Button, Space, Typography } from '@arco-design/web-react';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { bbedit } from '@uiw/codemirror-theme-bbedit';
import { sql } from '@codemirror/lang-sql';
import { format } from 'sql-formatter';
import { lintGutter } from '@codemirror/lint';
import { createSqlLinter } from './sqlLinter';

const sqlLinter = createSqlLinter({
  checkPerformance: false,
  checkInjection: false
});

export default function SqlEditor() {
  const editorRef = useRef<ReactCodeMirrorRef>(null);

  const [value, setValue] = React.useState(
    `SELECT * FROM users WHERE name = 'Alice';`
  );

  const [selectedCode, setSelectedCode] = useState('');

  const onChange = (val, viewUpdate) => {
    console.log('val:', val);
    setValue(val);
  };

  const handleFormatCode = () => {
    if (value) {
      try {
        const formattedCode = format(value, { language: 'sql' });
        setValue(formattedCode);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleRunCode = () => {
    const view = editorRef.current?.view;
    if (view) {
      const { from, to } = view.state.selection.main;
      const selectedText = view.state.doc.sliceString(from, to);
      setSelectedCode(selectedText);
    }
  };

  return (
    <div className="bg-white p-[10px]">
      <div>
        <Typography.Title heading={5}>SQL编码区</Typography.Title>
      </div>

      <div className="flex items-center justify-between">
        <Typography.Title heading={6}>SparkSql</Typography.Title>
        <Space className="">
          <Button type="text" onClick={handleFormatCode}>
            格式化
          </Button>
          <Button type="text" onClick={handleRunCode}>
            运行选中代码
          </Button>
        </Space>
      </div>

      <div style={{ border: '1px solid #eee', fontSize: '16px' }}>
        <CodeMirror
          ref={editorRef}
          value={value}
          height="200px"
          theme={bbedit}
          extensions={[
            sql({ upperCaseKeywords: true }),
            sqlLinter,
            lintGutter()
          ]}
          onChange={onChange}
        />
      </div>

      <div>
        <Typography.Title heading={5}>运行结果区</Typography.Title>
        <span>{selectedCode}</span>
        <Typography.Title heading={6}>Error in SQL:</Typography.Title>
        <Typography.Text>语法错误</Typography.Text>
      </div>
    </div>
  );
}
