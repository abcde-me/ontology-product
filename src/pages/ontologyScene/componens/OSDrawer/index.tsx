import React from 'react';
import { Button, Drawer, DrawerProps } from '@arco-design/web-react';
import styles from './index.module.scss';
import { IconClose } from '@arco-design/web-react/icon';
import classNames from 'classnames';
import { ProButton } from '@ceai-front/arco-material';
import { usePermission } from '@/hooks';
import { PermissionWrapper } from '@/components/PermissionGuard';
import { ONTOLOGY_PERMISSIONS } from '@/config/permissions';

export interface OSDrawerProps extends DrawerProps {
  onEdit?: () => void;
  extra?: React.ReactNode;
}

export const OsDrawer = (props: OSDrawerProps) => {
  const { className, onEdit, title, onCancel, extra, width, ...otherProps } =
    props;

  // 如果没有传入width，使用默认宽度样式
  const drawerClassName = classNames(
    styles['os-drawer'],
    { [styles['os-drawer-default-width']]: !width },
    className
  );

  const { hasPermission } = usePermission();

  return (
    <Drawer
      {...otherProps}
      width={width}
      closeIcon={null}
      mask={false}
      // maskStyle={{ background: 'transparent', cursor: 'not-allowed' }}
      className={drawerClassName}
      title={
        <div className={'flex items-center justify-between gap-4'}>
          <div
            className={`os-drawer-title flex flex-1 items-center justify-between`}
          >
            <div
              className={
                'font-PingFangSc text-[16px] font-medium leading-6 text-[#0F131F]'
              }
            >
              {title}
            </div>
            {extra && <div className="ml-4">{extra}</div>}
            {onEdit && (
              <PermissionWrapper permission={ONTOLOGY_PERMISSIONS.MODIFY}>
                <ProButton type={'outline'} size={'small'} onClick={onEdit}>
                  编辑
                </ProButton>
              </PermissionWrapper>
            )}
          </div>
          <div className={'flex gap-4'}>
            {onEdit && <div className={'h-[16px] w-[1px] bg-[#CBD5E1]'} />}
            <IconClose
              onClick={onCancel}
              className={'text-[16px] text-[#23293B] hover:cursor-pointer'}
            />
          </div>
        </div>
      }
    />
  );
};
