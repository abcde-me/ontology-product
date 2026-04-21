import React from 'react';
import styles from './index.module.scss';
import { CopyItemIcon, GlobalTooltip } from '@ceai-front/arco-material';
import classNames from 'classnames';

export interface ContentWithCopyProps {
  copy?: boolean;
  value: string;
  className?: string;
  textClassName?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const ContentWithCopy = (props: ContentWithCopyProps) => {
  const { copy = true, value, className, style, onClick } = props;
  return (
    <div className={classNames([styles['copy-value-wrapper'], className])}>
      <div className={'w-max overflow-hidden'} onClick={onClick}>
        <GlobalTooltip.Ellipsis text={value} className={props.textClassName} />
      </div>
      {copy && (
        <CopyItemIcon
          value={value}
          className={`${styles['copy-icon']} copy-icon`}
        />
      )}
    </div>
  );
};
