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
    children = <></>
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
    </div>
  );
};
