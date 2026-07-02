import React from 'react';
import styles from './index.module.scss';
import { Button, Tooltip } from '@arco-design/web-react';
import { IconLeft, IconQuestionCircle } from '@arco-design/web-react/icon';
import { useHistory } from 'react-router-dom';
import { GlobalTooltip } from '@ceai-front/arco-material';
import classNames from 'classnames';

export interface PageHeaderProps {
  showBack?: boolean;
  backPath?: string;
  title: string;
  subTitle?: string;
  className?: string;
  extra?: React.ReactNode;
}

export function PageHeaderInfoIcon({
  content,
  className
}: {
  content: React.ReactNode;
  className?: string;
}) {
  if (!content) {
    return null;
  }

  return (
    <Tooltip content={content} position="top">
      <IconQuestionCircle
        className={classNames(styles['page-header-info-icon'], className)}
      />
    </Tooltip>
  );
}

const PageHeader = (props: PageHeaderProps) => {
  const { showBack = false, title, subTitle, extra } = props;
  const history = useHistory();

  const goBack = () => {
    history.replace(props.backPath || '');
  };

  return (
    <div className={classNames([styles['page-header'], props.className])}>
      <div className={styles['page-header-main']}>
        <div className={styles['page-header-title']}>
          {showBack && (
            <Button
              icon={<IconLeft />}
              type="default"
              size="default"
              onClick={goBack}
            />
          )}
          <span className={styles['page-header-title-group']}>
            <GlobalTooltip.Ellipsis
              text={title}
              className={styles['page-header-title-text']}
            />
            <PageHeaderInfoIcon content={subTitle} />
          </span>
        </div>
        {extra ? (
          <div className={styles['page-header-extra']}>{extra}</div>
        ) : null}
      </div>
    </div>
  );
};
export default PageHeader;
