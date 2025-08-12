import React, { useEffect, useRef, useState } from 'react';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { bbedit } from '@uiw/codemirror-theme-bbedit';
import { sql } from '@codemirror/lang-sql';
import { format } from 'sql-formatter';
import { lintGutter } from '@codemirror/lint';
import { createSqlLinter } from '../utils/sqlLinterUtil';
import { FullscreenContainer } from '../components/Fullscreen';
import { Button, Space, Typography } from '@arco-design/web-react';

const sqlLinter = createSqlLinter({
  checkPerformance: false,
  checkInjection: false
});

function SqlEditor() {
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
    const codeValue = editorRef.current?.view?.state.doc.toString();
    setSelectedCode(codeValue || '');
  };

  const handleRunSelectedCode = () => {
    const view = editorRef.current?.view;
    if (view) {
      const { from, to } = view.state.selection.main;
      const selectedText = view.state.doc.sliceString(from, to);
      setSelectedCode(selectedText);
    }
  };

  return (
    <>
      <FullscreenContainer
        onEnter={() => console.log('进入全屏')}
        onExit={() => console.log('退出全屏')}
      >
        {({ isFullscreen, toggleFullscreen }) => {
          return (
            <>
              <div className="flex items-center justify-between">
                <Typography.Title heading={6}>SparkSql</Typography.Title>
                <Space className="">
                  <Button type="text" onClick={handleRunCode}>
                    立即执行
                  </Button>
                  <Button type="text" onClick={handleRunSelectedCode}>
                    运行选中代码
                  </Button>
                  <Button type="text" onClick={handleFormatCode}>
                    格式化
                  </Button>
                  <Button type="text" onClick={toggleFullscreen}>
                    {isFullscreen ? '退出全屏' : '全屏'}
                  </Button>
                </Space>
              </div>

              <div style={editorContainerStyles}>
                <CodeMirror
                  ref={editorRef}
                  value={value}
                  height={isFullscreen ? 'calc(100vh - 100px)' : '200px'}
                  theme={bbedit}
                  extensions={[
                    sql({ upperCaseKeywords: true }),
                    sqlLinter,
                    lintGutter()
                  ]}
                  onChange={onChange}
                />
              </div>
            </>
          );
        }}
      </FullscreenContainer>
    </>
  );
}

export default SqlEditor;

const editorContainerStyles: React.CSSProperties = {
  border: '1px solid #eee',
  fontSize: '16px'
};
