import React, { useEffect, useLayoutEffect, useRef } from 'react';
import styles from './index.module.scss';
import CodeMirror, { ReactCodeMirrorProps } from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { lintGutter } from '@codemirror/lint';
import { useFullscreen } from 'ahooks';
import { CopyItemIcon, copyToClipboard } from '@ceai-front/arco-material';
import { IconCopy, IconExpand, IconShrink } from '@arco-design/web-react/icon';
import { Message, Tooltip } from '@arco-design/web-react';

const extension = [python(), lintGutter()];
export const PyCodeContent = (
  props: ReactCodeMirrorProps & {
    // 是否可以复制
    copy?: boolean;
    // 是否可以全屏
    fullScreen?: boolean;
  }
) => {
  const { copy = true, fullScreen = true, readOnly, ...otherProps } = props;
  const codeRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, { toggleFullscreen }] = useFullscreen(codeRef);

  useEffect(() => {
    Message.config({
      getContainer() {
        return isFullscreen ? codeRef.current || document.body : document.body;
      }
    });
  }, [isFullscreen]);

  return (
    <div className={styles['py-code']} ref={codeRef}>
      {readOnly && <div className={styles['code-mask']} />}
      <div className={styles['toolbar']}>
        {copy && <CopyItemIcon value={props.value || ''} />}
        <Tooltip
          content={isFullscreen ? '退出全屏' : '全屏'}
          getPopupContainer={() => codeRef.current || document.body}
        >
          <div onClick={toggleFullscreen}>
            {fullScreen && (isFullscreen ? <IconShrink /> : <IconExpand />)}
          </div>
        </Tooltip>
      </div>
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
