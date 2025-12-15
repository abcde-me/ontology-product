import React, { ComponentProps, memo, useMemo, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { lintGutter } from '@codemirror/lint';
import styled from '@emotion/styled';
import { IconExpand, IconShrink } from '@arco-design/web-react/icon';
import { Typography } from '@arco-design/web-react';

type EditorProps = Partial<ComponentProps<typeof CodeMirror>> & {
  editorMode?: 'max' | 'normal';
  changeMode?: (mode: 'max' | 'normal') => void;
};

const CodeEditor = (props: EditorProps) => {
  const extension = useMemo(() => {
    return [sql({ upperCaseKeywords: true }), lintGutter()];
  }, []);

  const {
    value,
    onChange,
    defaultValue,
    editorMode,
    changeMode,
    ...otherProps
  } = props;
  return (
    <IEditor
      {...otherProps}
      value={value}
      onChange={onChange}
      defaultValue={defaultValue}
      className={'code-editor '}
      placeholder={props.placeholder}
      extensions={extension}
      basicSetup={{
        lineNumbers: true,
        highlightActiveLineGutter: false,
        foldGutter: false,
        highlightActiveLine: false
      }}
    >
      {editorMode === 'normal' && (
        <IconExpand
          className={'absolute right-3 top-5 hover:cursor-pointer'}
          onClick={() => changeMode?.('max')}
        />
      )}
    </IEditor>
  );
};

export const SqlEditor = memo((props: EditorProps) => {
  const [maxMode, setMaxMode] = useState(false);
  return (
    <>
      <div style={{ height: 240 }}>
        <CodeEditor
          {...props}
          editorMode={maxMode ? 'max' : 'normal'}
          changeMode={(mode) => setMaxMode(mode === 'max')}
        />
      </div>
      <EditorMax data-mode={maxMode}>
        <div className={'flex h-full w-full flex-col rounded-[8px] bg-white'}>
          <div
            className={
              'editor-header flex flex-shrink-0 items-center justify-between p-4 '
            }
          >
            <Typography.Text bold>SQL脚本语句</Typography.Text>
            <IconShrink
              onClick={() => setMaxMode(false)}
              className={'hover:cursor-pointer'}
            />
          </div>
          <div className={'h-full w-full flex-1 p-3'}>
            <CodeEditor
              {...props}
              editorMode={maxMode ? 'max' : 'normal'}
              changeMode={(mode) => setMaxMode(mode === 'max')}
              height={'100%'}
            />
          </div>
        </div>
      </EditorMax>
    </>
  );
});
const IEditor = styled(CodeMirror)`
  border: 1px solid #e2e8f0;
  background: #fff;
  border-radius: 8px;
  padding: 12px 24px 12px 12px;
  position: relative;
  height: 100%;

  &:focus-within {
    border: 1px solid #007dfa;
    background: #eef6ff;
  }

  .cm-focused {
    outline: unset;
  }

  .cm-editor {
    background: transparent !important;
    height: 100%;
  }

  .cm-content {
    font-weight: 400;
    font-size: 14px;
    line-height: 24px;
    color: #0f172a;
  }

  .cm-placeholder {
    color: #94a3b8;
  }

  .cm-line {
    padding: 0 12px;
  }

  .cm-activeLine {
    background-color: unset;
  }

  .cm-gutters {
    border: unset;
    padding-top: 3px;
    background-color: unset;
    color: var(--color-text-4);
    width: 24px;

    .cm-gutter-lint {
      width: 0;
    }
  }

  .cm-gutters-before {
    border: none;
  }
`;

const EditorMax = styled.div`
  z-index: ${(props) => (props['data-mode'] ? 999 : -1)};
  bottom: 0;
  right: 0;
  visibility: ${(props) => (props['data-mode'] ? 'visible' : 'hidden')};
  background: transparent;
  pointer-events: auto;
  padding: 10px;
  position: fixed;
  width: calc(100vw - 200px);
  height: calc(100vh - 106px);

  .editor-header {
    border-bottom: 1px solid #e2e8f0;
  }
`;
