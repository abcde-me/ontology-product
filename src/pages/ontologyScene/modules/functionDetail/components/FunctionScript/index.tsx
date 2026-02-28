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
import { BehaviorLogItem } from '@/pages/ontologyScene/modules/behaviorLog/types';
import { ResizeBoxWithCursorChange } from '@/pages/ontologyScene/componens';

const extension = [python(), lintGutter()];

export const FunctionScript = (
  props: CustomFormItemCompProps<string> & { runInfo?: BehaviorLogItem }
) => {
  const { value, onChange, disabled, runInfo } = props;
  const codeEditor = useRef<EditorView>();
  const extensions = useMemo(() => {
    if (isNil(value)) return extension;
    // return extension;
    return extension.concat([getFreezeRanges(value)]);
  }, [value]);

  return (
    <>
      <div
        className={classNames([
          styles['function-body'],
          props.className,
          isNil(runInfo) ? '' : 'pb-[40px]'
        ])}
      >
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
      {!!runInfo && (
        <ResizeBoxWithCursorChange
          directions={['top']}
          className={styles['function-footer']}
          maxHeight={600}
          minHeight={40}
        >
          <div className={styles['run-log-wrapper']}>这是一条神奇的天路</div>
        </ResizeBoxWithCursorChange>
      )}
    </>
  );
};
