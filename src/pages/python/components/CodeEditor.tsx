import React from 'react';
import { Input } from '@arco-design/web-react';
import './CodeEditor.scss';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: 'python' | 'markdown' | 'sql';
  height?: string;
  readOnly?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language = 'python',
  height = '200px',
  readOnly = false
}) => {
  return (
    <div className="code-editor-wrapper">
      <Input.TextArea
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        style={{
          height,
          fontFamily: 'Monaco, Menlo, Ubuntu Mono, monospace',
          fontSize: '14px',
          lineHeight: '1.5',
          backgroundColor: '#f8f9fa',
          border: 'none',
          borderRadius: '0',
          padding: '16px'
        }}
        placeholder={`在这里编写您的${language === 'python' ? 'Python' : language === 'markdown' ? 'Markdown' : 'SQL'}代码...`}
      />
    </div>
  );
};

export default CodeEditor;
