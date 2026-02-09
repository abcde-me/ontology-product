import React from 'react';
import { Button, Drawer, DrawerProps } from '@arco-design/web-react';
import styles from './index.module.scss';
import { IconClose } from '@arco-design/web-react/icon';
import classNames from 'classnames';
import { ProButton } from '@ceai-front/arco-material';

interface IProps extends DrawerProps {
  onEdit?: () => void;
}

export const OsDrawer = (props: IProps) => {
  const { className, onEdit, title, onCancel, ...otherProps } = props;
  return (
    <Drawer
      {...otherProps}
      closeIcon={null}
      mask={false}
      className={classNames(styles['os-drawer'], className)}
      title={
        <div className={'flex items-center justify-between gap-4'}>
          <div className={`os-drawer-title flex flex-1 justify-between`}>
            <div
              className={
                'font-PingFangSc text-[16px] font-medium leading-6 text-[#0F131F]'
              }
            >
              {title}
            </div>
            {onEdit && (
              <ProButton type={'outline'} size={'small'} onClick={onEdit}>
                编辑
              </ProButton>
            )}
          </div>
          <div className={'flex gap-4'}>
            <div className={'h-[16px] w-[1px] bg-[#CBD5E1]'} />
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
