import React from 'react';
import styles from './index.module.scss';
import CodeMirror, { ReactCodeMirrorProps } from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { lintGutter } from '@codemirror/lint';

const extension = [python(), lintGutter()];
export const PyCodeContent = (
  props: ReactCodeMirrorProps & {
    // 是否可以复制
    copy?: boolean;
    // 是否可以全屏
    fullScreen?: boolean;
  }
) => {
  const { copy, fullScreen, readOnly, ...otherProps } = props;

  return (
    <div className={styles['py-code']}>
      {readOnly && <div className={styles['code-mask']} />}
      <CodeMirror
        {...otherProps}
        readOnly={readOnly}
        extensions={extension}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: false,
          foldGutter: false,
          highlightActiveLine: false
        }}
        style={{
          overflow: 'auto',
          ...otherProps.style
        }}
      />
    </div>
  );
};
