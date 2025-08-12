import React, { useRef } from 'react';
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
        alert('格式化失败，请检查SQL语法。');
        console.error(e);
      }
    }
  };

  const handleRunCode = () => {
    const view = editorRef.current?.view;
    if (view) {
      const { from, to } = view.state.selection.main;
      const selectedText = view.state.doc.sliceString(from, to);

      if (selectedText.trim()) {
        alert(`已发送选中代码到服务器：\n\n${selectedText}`);
        console.log('Selected SQL:', selectedText);
      } else {
        alert('请先选择要运行的SQL代码。');
      }
    }
  };

  return (
    <div className="bg-white p-[10px]">
      <Typography.Title heading={6}>SQL编码区</Typography.Title>

      <div className="flex items-center justify-between">
        <span>SparkSql</span>
        <Space className="">
          <Button type="text" onClick={handleFormatCode}>
            格式化
          </Button>
          <Button type="text" onClick={handleRunCode}>
            运行选中代码
          </Button>
        </Space>
      </div>

      <CodeMirror
        ref={editorRef}
        value={value}
        height="200px"
        theme={bbedit}
        extensions={[sql({ upperCaseKeywords: true }), sqlLinter, lintGutter()]}
        onChange={onChange}
      />
    </div>
  );
}
