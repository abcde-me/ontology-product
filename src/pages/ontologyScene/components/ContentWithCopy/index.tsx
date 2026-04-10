import React from 'react';
import styles from './index.module.scss';
import { CopyItemIcon } from '@ceai-front/arco-material';
import classNames from 'classnames';
import { Tooltip } from '@arco-design/web-react';

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
      <Tooltip content={value}>
        <p>{value}</p>
      </Tooltip>
      {copy && (
        <CopyItemIcon
          value={value}
          className={`${styles['copy-icon']} copy-icon`}
        />
      )}
    </div>
  );
};
