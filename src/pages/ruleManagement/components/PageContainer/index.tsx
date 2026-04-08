import React from 'react';
import PageHeader, { PageHeaderProps } from '@/components/PageHeader';
import styles from './index.module.scss';
import { Button, ButtonProps, Spin } from '@arco-design/web-react';
import classNames from 'classnames';

export interface PageContainerProps extends PageHeaderProps {
  // 确认按钮
  confirmButtonProps: ButtonProps;
  // 取消按钮
  cancelButtonProps: ButtonProps;
  // 页面内容
  children?: React.ReactNode;
  wrapperClassName?: string;
  // 页面数据加载中
  loading?: boolean;
}

export const PageContainer = (props: PageContainerProps) => {
  const {
    confirmButtonProps,
    cancelButtonProps,
    children,
    wrapperClassName,
    loading = false,
    ...otherProps
  } = props;
  return (
    <div className={classNames([styles['page-container']])}>
      {loading && (
        <div className={styles.loading}>
          <Spin loading={loading} />
        </div>
      )}
      <PageHeader {...otherProps} />
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
