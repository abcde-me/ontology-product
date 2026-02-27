import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import { Button } from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';

interface IProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onCreate?: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  isShowCard?: boolean;
  empty?: boolean;
  /** 当 empty 为 true 时，可以传入额外的隐藏 DOM（用于确保某些组件始终挂载，如 ref 绑定） */
  hiddenContent?: React.ReactNode;
}

export const OsEmptyStatusWrapper = (props: IProps) => {
  const {
    empty,
    className,
    style = {},
    onCreate,
    title,
    description,
    isShowCard = true,
    children = <></>,
    hiddenContent
  } = props;
  return (
    <div
      className={classNames([className, styles['os-empty-wrapper']])}
      style={style}
    >
      {empty
        ? isShowCard && (
            <div className={styles['create-card']}>
              <p>{title}</p>
              <p>{description}</p>
              <Button
                icon={<IconPlus />}
                onClick={onCreate}
                className={'w-auto'}
              >
                去创建
              </Button>
            </div>
          )
        : children}
      {/* 当 empty 为 true 时，渲染隐藏的额外内容，确保组件始终挂载 */}
      {empty && hiddenContent && (
        <div
          style={{
            position: 'absolute',
            visibility: 'hidden',
            pointerEvents: 'none',
            width: 0,
            height: 0,
            overflow: 'hidden'
          }}
        >
          {hiddenContent}
        </div>
      )}
    </div>
  );
};
