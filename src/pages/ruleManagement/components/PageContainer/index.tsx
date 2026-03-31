import React from 'react';
import PageHeader, { PageHeaderProps } from '@/components/PageHeader';
import styles from './index.module.scss';
import { Button, ButtonProps } from '@arco-design/web-react';
import classNames from 'classnames';

export interface PageContainerProps extends PageHeaderProps {
  // 确认按钮
  confirmButtonProps: ButtonProps;
  // 取消按钮
  cancelButtonProps: ButtonProps;
  // 页面内容
  children?: React.ReactNode;
  wrapperClassName?: string;
}

export const PageContainer = (props: PageContainerProps) => {
  const {
    confirmButtonProps,
    cancelButtonProps,
    children,
    wrapperClassName,
    ...otherProps
  } = props;
  return (
    <div className={classNames([styles['page-container']])}>
      <PageHeader {...otherProps}></PageHeader>
      <div className={classNames(styles['page-content'], wrapperClassName)}>
        {children}
      </div>
      <div className={styles.footer}>
        <Button {...confirmButtonProps} type={'primary'} />
        <Button {...cancelButtonProps} type={'default'} />
      </div>
    </div>
  );
};
