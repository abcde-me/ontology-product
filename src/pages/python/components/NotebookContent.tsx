import React, { useState, useEffect } from 'react';
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
  content: string;
}

const NotebookContent: React.FC<NotebookContentProps> = ({
  fileName = '我的第一个PySpark文件',
  content
}) => {
  const [editorContent, setEditorContent] = useState(content);

  // 当content prop变化时，更新编辑器内容
  useEffect(() => {
    setEditorContent(content);
  }, [content]);

  const handleContentChange = (value: string) => {
    setEditorContent(value || '');
  };

  const handleRunCode = () => {
    // 这里可以添加运行代码的逻辑
    console.log('Running code:', editorContent);
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
          value={editorContent}
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
            lineHeight: 24,
            // 启用实时错误检查
            quickSuggestions: true,
            suggestOnTriggerCharacters: true,
            // 启用参数提示
            parameterHints: {
              enabled: true
            },
            // 启用悬停提示
            hover: {
              enabled: true
            },
            // 启用自动缩进
            autoIndent: 'full',
            // 启用括号匹配
            bracketPairColorization: {
              enabled: true
            },
            // 启用指南线
            guides: {
              bracketPairs: true,
              indentation: true
            }
          }}
        />
      </div>
    </div>
  );
};

export default NotebookContent;
