import React, { useRef } from 'react';
import { Button, Space, Typography } from '@arco-design/web-react';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { format } from 'sql-formatter';
import { lintGutter, linter } from '@codemirror/lint';

const sqlLinter = linter((view) => {
  const diagnostics: any[] = [];
  const fullCode = view.state.doc.toString();
  const lines = fullCode.split('\n');

  // 检查整个代码块的最后一个非空行是否以分号结尾
  const lastLine = lines[lines.length - 1].trim();
  if (lastLine.length > 0 && !lastLine.endsWith(';')) {
    diagnostics.push({
      from: view.state.doc.line(lines.length).from + lastLine.length,
      to: view.state.doc.line(lines.length).to,
      message: 'SQL语句可能缺少分号',
      severity: 'warning'
    });
  }

  return diagnostics;
});

export default function SqlEditor() {
  const editorRef = useRef<ReactCodeMirrorRef>(null);

  const [value, setValue] = React.useState(
    `SELECT * FROM users WHERE name = 'Alice'`
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
        extensions={[sql({ upperCaseKeywords: true }), sqlLinter, lintGutter()]}
        onChange={onChange}
      />
    </div>
  );
}
