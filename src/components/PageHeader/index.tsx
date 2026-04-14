import React from 'react';
import styles from './index.module.scss';
import { Button } from '@arco-design/web-react';
import { IconLeft } from '@arco-design/web-react/icon';
import { useHistory } from 'react-router-dom';
import { GlobalTooltip } from '@ceai-front/arco-material';
import classNames from 'classnames';

export interface PageHeaderProps {
  showBack?: boolean;
  backPath?: string;
  title: string;
  subTitle?: string;
  className?: string;
}

const PageHeader = (props: PageHeaderProps) => {
  const { showBack = false, title, subTitle } = props;
  const history = useHistory();

  const goBack = () => {
    history.replace(props.backPath || '');
  };

  return (
    <div className={classNames([styles['page-header'], props.className])}>
      <div className={styles['page-header-title']}>
        {showBack && (
          <Button
            icon={<IconLeft></IconLeft>}
            type={'default'}
            onClick={goBack}
          />
        )}
        <GlobalTooltip.Ellipsis
          text={title}
          className={styles['page-header-title-text']}
        />
      </div>
      {!!subTitle && (
        <GlobalTooltip.Ellipsis
          text={subTitle}
          className={styles['page-header-sub-title']}
        />
      )}
    </div>
  );
};
export default PageHeader;
