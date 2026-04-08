import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle
} from 'react';
import styles from './index.module.scss';
import { Button, Form, Message, Space, Tooltip } from '@arco-design/web-react';
import {
  IconCopy,
  IconDown,
  IconExpand,
  IconFile,
  IconLoading,
  IconRecordStop,
  IconRight,
  IconShrink,
  IconToBottom
} from '@arco-design/web-react/icon';
import {
  CopyItemIcon,
  copyToClipboard,
  DotStatus,
  ProButton
} from '@ceai-front/arco-material';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { lintGutter } from '@codemirror/lint';
import { isNil } from 'lodash-es';
import {
  buildReturnCode,
  bypassFrozenRange,
  getFreezeRanges
} from '@/pages/ontologyScene/modules/functionDetail/utils';
import { EditorView } from '@codemirror/view';
import { Transaction } from '@codemirror/state';
import classNames from 'classnames';
import { BehaviorLogItem } from '@/pages/ontologyScene/modules/behaviorLog/types';
import { ResizeBoxWithCursorChange } from '@/pages/ontologyScene/componens';
import { RunStatus } from '@/pages/ontologyScene/hooks/useTestFunction';
import { OntologyFunctionDetail } from '@/pages/ontologyScene/types/ontologyFunction';
import { OntologyActionParam } from '@/pages/ontologyScene/types/behaviorActions';

const extension = [python(), lintGutter()];

export const FunctionScript = forwardRef(
  (
    props: CustomFormItemCompProps<string> & {
      runInfo?: RunStatus;
      isFullscreen: boolean;
      functionCode?: string;
    },
    ref: React.ForwardedRef<any>
  ) => {
    const {
      value,
      onChange,
      disabled,
      runInfo,
      isFullscreen,
      functionCode = 'my_function'
    } = props;
    const codeEditor = useRef<EditorView>();
    const functionDiv = useRef<HTMLDivElement>(null);
    const [logOpen, setLogOpen] = useState(false);
    const editorReady = !isNil(value);
    const { form } = Form.useFormContext();
    const paramsOut: OntologyActionParam[] = Form.useWatch('output', form);
    const extensions = useMemo(() => {
      if (!editorReady) return extension;
      const funcReturn = buildReturnCode(paramsOut as any);
      return extension.concat(
        getFreezeRanges({ code: value, functionName: functionCode, funcReturn })
      );
    }, [editorReady, value, functionCode, paramsOut]);
    const functionWidth = useRef<number>();
    useEffect(() => {
      const observer = new ResizeObserver((e: ResizeObserverEntry[]) => {
        for (const resizeObserverEntry of e) {
          if (resizeObserverEntry.borderBoxSize) {
            functionWidth.current =
              resizeObserverEntry.borderBoxSize[0].inlineSize;
          }
        }
      });
      !!functionDiv.current && observer.observe(functionDiv.current);
      return () => {
        observer.disconnect();
      };
    }, []);

    const currentRunLog =
      runInfo?.runLog?.map((item, index) => item.run_log).join('\n') || '';

    useImperativeHandle(ref, () => {
      return {
        getWidth: () => functionWidth.current
      };
    });

    useEffect(() => {
      if ([0, 1].includes(runInfo?.run_status || 0)) {
        return setLogOpen(false);
      }
      setLogOpen(true);
    }, [runInfo]);

    return (
      <>
        <div
          className={classNames([
            styles['function-body'],
            props.className,
            disabled ? 'bg-[var(--color-fill-2)]' : ''
          ])}
          id={'functionScriptWrapper'}
          ref={functionDiv}
        >
          <div
            className={classNames({
              [styles['pycode-container']]: true,
              [styles['pycode-disabled']]: disabled
            })}
          >
            {editorReady && (
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
            )}
          </div>
          {!!runInfo?.run_status && (
            <div className={'h-max flex-shrink-0'}>
              <ResizeBoxWithCursorChange
                directions={['top']}
                className={styles['function-footer']}
                maxHeight={logOpen ? (isFullscreen ? 600 : 300) : 40}
                minHeight={logOpen ? 120 : 40}
                style={{
                  maxHeight: logOpen
                    ? isFullscreen
                      ? '600px'
                      : '300px'
                    : '40px',
                  height: logOpen ? '120px' : '40px'
                }}
              >
                <div
                  className={styles['run-log-header']}
                  onClick={() => {
                    setLogOpen((p) => !p);
                  }}
                >
                  <Space>
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
                  </Space>
                  {!!currentRunLog && (
                    <Tooltip
                      getPopupContainer={() => {
                        return (
                          document.querySelector('#functionSettingContainer') ||
                          document.body
                        );
                      }}
                      content={'复制'}
                    >
                      <IconCopy
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(currentRunLog);
                        }}
                        className={`hover:text-[#184ff2] ${styles['copy-btn']}`}
                      />
                    </Tooltip>
                  )}
                </div>
                <pre
                  className={classNames({
                    [styles['run-log-wrapper']]: true,
                    visible: logOpen,
                    hidden: !logOpen
                  })}
                >
                  {currentRunLog}
                </pre>
              </ResizeBoxWithCursorChange>
            </div>
          )}
        </div>
      </>
    );
  }
);
