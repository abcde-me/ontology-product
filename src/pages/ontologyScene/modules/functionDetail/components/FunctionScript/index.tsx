import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from './index.module.scss';
import { Button, Tooltip } from '@arco-design/web-react';
import {
  IconDown,
  IconExpand,
  IconFile,
  IconLoading,
  IconRecordStop,
  IconRight,
  IconShrink,
  IconToBottom
} from '@arco-design/web-react/icon';
import { DotStatus, ProButton } from '@ceai-front/arco-material';
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
import { RunStatus } from '@/pages/ontologyScene/hooks/useTestFunction';

const extension = [python(), lintGutter()];

export const FunctionScript = (
  props: CustomFormItemCompProps<string> & {
    runInfo?: RunStatus;
    isFullscreen: boolean;
  }
) => {
  const { value, onChange, disabled, runInfo, isFullscreen } = props;
  const codeEditor = useRef<EditorView>();
  const [logOpen, setLogOpen] = useState(false);
  const extensions = useMemo(() => {
    if (isNil(value)) return extension;
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
            tabSize: 4
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
      {!!runInfo?.run_status && (
        <ResizeBoxWithCursorChange
          directions={['top']}
          className={styles['function-footer']}
          maxHeight={logOpen ? (isFullscreen ? 600 : 300) : 40}
          minHeight={logOpen ? 120 : 40}
          style={{
            maxHeight: logOpen ? (isFullscreen ? '600px' : '300px') : '40px',
            height: logOpen ? '120px' : '40px'
          }}
        >
          <div
            className={styles['run-log-header']}
            onClick={() => {
              setLogOpen((p) => !p);
            }}
          >
            {logOpen ? <IconDown /> : <IconRight />}
            运行结果
            {runInfo.run_status === 1 && (
              <div className={'flex items-center gap-2 text-[#6E7B8D]'}>
                运行中
                <IconLoading style={{ color: '#184FF2' }} />
              </div>
            )}
            {runInfo.run_status === 2 && (
              <DotStatus color={'#10B981'} text={'运行成功'} />
            )}
            {runInfo.run_status === 3 && (
              <DotStatus color={'#E52E2D'} text={'运行失败'} />
            )}
            {runInfo.run_status === 4 && (
              <DotStatus color={'#E52E2D'} text={'已被手动停止'} />
            )}
          </div>
          <div
            className={classNames({
              [styles['run-log-wrapper']]: true,
              visible: logOpen,
              hidden: !logOpen
            })}
          >
            {runInfo.runLog
              ?.map((item, index) => item.run_log)
              .join('\n')
              .split('\n')
              .map((l, i) => {
                return <p key={i}>{l}</p>;
              })}
          </div>
        </ResizeBoxWithCursorChange>
      )}
    </>
  );
};
