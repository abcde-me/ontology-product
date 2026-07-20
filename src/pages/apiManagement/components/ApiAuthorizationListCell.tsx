import React from 'react';
import { countApiAuthorizationRules } from '../services/authorizationStorage';
import styles from '../index.module.scss';

interface ApiAuthorizationListCellProps {
  apiId: string;
  onClick: () => void;
}

export const ApiAuthorizationListCell: React.FC<
  ApiAuthorizationListCellProps
> = ({ apiId, onClick }) => {
  const count = countApiAuthorizationRules(apiId);

  return (
    <button
      type="button"
      className={styles['auth-list-cell']}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    >
      {count > 0 ? `${count} 条授权` : '未授权'}
    </button>
  );
};
