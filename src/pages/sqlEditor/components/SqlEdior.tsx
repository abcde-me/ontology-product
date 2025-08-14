import React, { useEffect, useRef, useState } from 'react';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { bbedit } from '@uiw/codemirror-theme-bbedit';
import { sql } from '@codemirror/lang-sql';
import { format } from 'sql-formatter';
import { lintGutter } from '@codemirror/lint';
import { createSqlLinter } from '../utils/sqlLinterUtil';
import { FullscreenContainer } from '../components/Fullscreen';
import { Button, Link, Space, Typography } from '@arco-design/web-react';
import { SQL_EDITOR_HEIGHT } from '../constant';

/**
 * TODO:
 * 当前坐标位置，插入表
 * 当前坐标位置，插入字段
 * Sparksql 方言语法解析
 */

const sqlLinter = createSqlLinter({
  checkPerformance: false,
  checkInjection: false
});

interface SqlEditorProps {
  initialState?: string;
}

function SqlEditor(props: SqlEditorProps) {
  const { initialState } = props;

  const editorRef = useRef<ReactCodeMirrorRef>(null);

  const [value, setValue] = React.useState(initialState);

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
        className="h-full"
        onEnter={() => console.log('进入全屏')}
        onExit={() => console.log('退出全屏')}
      >
        {({ isFullscreen, toggleFullscreen }) => {
          return (
            <div className="flex h-full flex-col overflow-hidden">
              <div className="shrik-0 flex items-center justify-between bg-blue-50 px-[12px]">
                <span className="text-[16px] font-[600] leading-[40px] text-[rgb(var(--blue-6))]">
                  SparkSql
                </span>
                <Space size={10}>
                  <Link href="#" onClick={handleRunCode}>
                    <span className="font-[600]">立即执行</span>
                  </Link>
                  <Link href="#" onClick={handleRunCode}>
                    <span className="font-[600]">保存SQL脚本</span>
                  </Link>
                  <Link href="#" onClick={handleFormatCode}>
                    <span className="font-[600]">格式化</span>
                  </Link>
                  <Link href="#" onClick={toggleFullscreen}>
                    <span className="font-[600]">
                      {isFullscreen ? '退出全屏' : '全屏'}
                    </span>
                  </Link>
                </Space>
              </div>

              <div
                className="flex-1 overflow-auto"
                style={editorContainerStyles}
              >
                <CodeMirror
                  ref={editorRef}
                  value={value}
                  height={
                    isFullscreen ? 'calc(100vh - 100px)' : SQL_EDITOR_HEIGHT
                  }
                  theme={bbedit}
                  extensions={[
                    sql({ upperCaseKeywords: true }),
                    sqlLinter,
                    lintGutter()
                  ]}
                  onChange={onChange}
                />
              </div>
            </div>
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
