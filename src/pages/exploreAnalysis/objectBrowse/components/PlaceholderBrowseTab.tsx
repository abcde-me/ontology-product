import React from 'react';
import { NoDataCard } from '@ceai-front/arco-material';
import styles from '../index.module.scss';

interface PlaceholderBrowseTabProps {
  title: string;
}

export const PlaceholderBrowseTab: React.FC<PlaceholderBrowseTabProps> = ({
  title
}) => {
  return (
    <div className={styles['placeholder-tab']}>
      <NoDataCard type="block" title={`${title}功能开发中`} />
    </div>
  );
};
