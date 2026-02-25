import React, { useEffect, useMemo, useRef } from 'react';
import styles from './index.module.scss';
import { Button, Tooltip } from '@arco-design/web-react';
import {
  IconExpand,
  IconFile,
  IconRecordStop,
  IconShrink
} from '@arco-design/web-react/icon';
import { ProButton } from '@ceai-front/arco-material';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { lintGutter } from '@codemirror/lint';
import { isNil } from 'lodash-es';
import {
  bypassFrozenRange,
  getFreezeRanges
} from '@/pages/ontologyScene/modules/functionDetail/utils';
import { EditorView } from '@codemirror/view';
import { Transaction } from '@codemirror/state';
import classNames from 'classnames';

const extension = [python(), lintGutter()];

export const FunctionScript = (props: CustomFormItemCompProps<string>) => {
  const { value, onChange, disabled } = props;
  const codeEditor = useRef<EditorView>();
  const extensions = useMemo(() => {
    if (isNil(value)) return extension;
    // return extension;
    return extension.concat([getFreezeRanges(value)]);
  }, [value]);

  return (
    <>
      <div className={classNames([styles['function-body'], props.className])}>
        <CodeMirror
          extensions={extensions}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: false,
            foldGutter: false,
            highlightActiveLine: false,
            tabSize: 2
          }}
          value={value}
          onCreateEditor={(view) => {
            codeEditor.current = view;
          }}
          readOnly={disabled}
          onChange={(e) => {
            onChange?.(e);
          }}
        />
      </div>
      <div className={styles['function-footer']}></div>
    </>
  );
};
