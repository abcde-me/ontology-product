import React, {
  ComponentProps,
  memo,
  ReactNode,
  useMemo,
  useState
} from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { lintGutter } from '@codemirror/lint';
import { IconExpand, IconShrink } from '@arco-design/web-react/icon';
import { Tooltip, Typography } from '@arco-design/web-react';
import cn from 'classnames';
import styles from './index.module.scss';

type EditorProps = Partial<ComponentProps<typeof CodeMirror>> & {
  editorMode?: 'max' | 'normal';
  changeMode?: (mode: 'max' | 'normal') => void;
  editorTitle: ReactNode;
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
    className,
    ...otherProps
  } = props;
  return (
    <CodeMirror
      {...otherProps}
      value={value}
      onChange={onChange}
      defaultValue={defaultValue}
      className={`${styles['code-editor']} ${className || ''}`}
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
        <Tooltip content={'全屏'}>
          <IconExpand
            className={'absolute right-3 top-5 hover:cursor-pointer'}
            onClick={() => changeMode?.('max')}
          />
        </Tooltip>
      )}
    </CodeMirror>
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
      {maxMode && (
        <div className={styles['max-mode']}>
          <div className={'flex h-full w-full flex-col rounded-[8px] bg-white'}>
            <div
              className={`flex flex-shrink-0 items-center justify-between p-4 ${styles['editor-header']}`}
            >
              <div
                className={
                  'font-PingFangSc text-[16px] font-[600] leading-6 text-[#0F172A]'
                }
              >
                {props.editorTitle}
              </div>
              <Tooltip content={'退出全屏'}>
                <IconShrink
                  onClick={() => setMaxMode(false)}
                  className={'hover:cursor-pointer'}
                />
              </Tooltip>
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
        </div>
      )}
    </>
  );
});
