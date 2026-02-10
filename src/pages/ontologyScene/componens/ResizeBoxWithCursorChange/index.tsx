import React, {
  ComponentProps,
  useCallback,
  useLayoutEffect,
  useRef,
  useState
} from 'react';
import classNames from 'classnames';
import { ResizeBox, ResizeBoxProps } from '@arco-design/web-react';
import styles from './index.module.scss';

type ResizeBoxWithCursorChangeProps = ComponentProps<typeof ResizeBox> & {
  minWidth?: number;
  maxWidth?: number;
  maxHeight?: number;
  minHeight?: number;
};

export const ResizeBoxWithCursorChange = (
  props: ResizeBoxWithCursorChangeProps
) => {
  const {
    minHeight,
    minWidth,
    className,
    maxHeight,
    maxWidth,
    onMoving,
    ...otherProps
  } = props;
  const boxRef = useRef<HTMLDivElement>(null);
  const [XisMin, setXisMin] = useState(false);
  const [XisMax, setXisMax] = useState(false);
  const [YisMin, setYisMin] = useState(false);
  const [YisMax, setYisMax] = useState(false);

  const movingEnd = useCallback(() => {
    const node = boxRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const { width, height } = rect;
    if (!!minWidth) {
      setXisMin(width <= minWidth);
    }
    if (!!minHeight) {
      setYisMin(height <= minHeight);
    }
    if (!!maxWidth) {
      setXisMax(width >= maxWidth);
    }
    if (!!maxHeight) {
      setYisMax(height >= maxHeight);
    }
  }, [minHeight, minWidth]);

  useLayoutEffect(() => {
    movingEnd();
  }, [minHeight, minWidth, maxHeight, maxWidth]);

  const DropTrigger = (
    <div className={styles['resize-trigger']}>
      <div />
    </div>
  );

  return (
    <ResizeBox
      ref={boxRef as any}
      className={classNames([
        className,
        styles['resize-box'],
        XisMin ? styles['x-min'] : '',
        YisMin ? styles['y-min'] : '',
        XisMax ? styles['x-max'] : '',
        YisMax ? styles['y-max'] : ''
      ])}
      resizeTriggers={{
        left: DropTrigger,
        right: DropTrigger,
        top: DropTrigger,
        bottom: DropTrigger
      }}
      onMovingEnd={movingEnd}
      {...otherProps}
    />
  );
};
