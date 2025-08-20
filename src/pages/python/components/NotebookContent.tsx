import React, { useState } from 'react';
import { Button, Tag } from '@arco-design/web-react';
import {
  IconPlayArrow,
  IconFile,
  IconList,
  IconSettings
} from '@arco-design/web-react/icon';
import MonacoEditor from 'react-monaco-editor';
import './NotebookContent.scss';

interface NotebookContentProps {
  fileName?: string;
  initialContent?: string;
}

const NotebookContent: React.FC<NotebookContentProps> = ({
  fileName = '我的第一个PySpark文件',
  initialContent = '# 在这里编写您的代码\n'
}) => {
  const [content, setContent] = useState(initialContent);

  const handleContentChange = (value: string) => {
    setContent(value || '');
  };

  const handleRunCode = () => {
    // 这里可以添加运行代码的逻辑
    console.log('Running code:', content);
  };

  const handleExportDataset = () => {
    console.log('Exporting dataset...');
  };

  const handleExportList = () => {
    console.log('Exporting list...');
  };

  const handleCallOperator = () => {
    console.log('Calling operator...');
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="notebook-content">
      {/* 代码编辑器 */}
      <div className="editor-container">
        <MonacoEditor
          height="100%"
          language="python"
          theme="vs"
          value={content}
          onChange={handleContentChange}
          options={{
            selectOnLineNumbers: true,
            roundedSelection: false,
            readOnly: false,
            cursorStyle: 'line',
            automaticLayout: true,
            minimap: {
              enabled: false
            },
            scrollBeyondLastLine: false,
            fontSize: 14,
            lineNumbers: 'on',
            wordWrap: 'on',
            folding: true,
            showFoldingControls: 'always',
            lineHeight: 20,
            padding: {
              top: 16,
              bottom: 16
            }
          }}
        />
      </div>
    </div>
  );
};

export default NotebookContent;
