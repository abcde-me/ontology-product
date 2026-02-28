import React from 'react';
import styles from './index.module.scss';
import { CopyItemIcon } from '@ceai-front/arco-material';
import classNames from 'classnames';

export interface ContentWithCopyProps {
  copy?: boolean;
  value: string;
  className?: string;
  style?: React.CSSProperties;
}

export const ContentWithCopy = (props: ContentWithCopyProps) => {
  const { copy = true, value, className, style } = props;
  return (
    <div className={classNames([styles['copy-value-wrapper'], className])}>
      <p>{value}</p>
      {copy && (
        <CopyItemIcon
          value={value}
          className={`${styles['copy-icon']} copy-icon`}
        />
      )}
    </div>
  );
};
