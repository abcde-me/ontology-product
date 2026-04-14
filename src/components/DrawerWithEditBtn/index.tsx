import React from 'react';
import { Button, Drawer, DrawerProps } from '@arco-design/web-react';
import styles from './index.module.scss';
import { IconClose } from '@arco-design/web-react/icon';
import classNames from 'classnames';
import { GlobalTooltip, ProButton } from '@ceai-front/arco-material';
import { PermissionWrapper } from '@/components/PermissionGuard';

export interface DrawerWithEditBtnProps extends DrawerProps {
  onEdit?: () => void;
  extra?: React.ReactNode;
  permission?: string | string[];
}

export const DrawerWithEditBtn: React.FC<DrawerWithEditBtnProps> = (
  props: DrawerWithEditBtnProps
) => {
  const {
    className,
    onEdit,
    title,
    onCancel,
    extra,
    width,
    permission,
    ...otherProps
  } = props;

  // 如果没有传入width，使用默认宽度样式
  const drawerClassName = classNames(
    styles['os-drawer'],
    { [styles['os-drawer-default-width']]: !width },
    className
  );

  return (
    <Drawer
      {...otherProps}
      getChildrenPopupContainer={(node) => {
        return document.querySelector('#ontologySceneContent') || document.body;
      }}
      getPopupContainer={() => {
        return document.querySelector('#ontologySceneContent') || document.body;
      }}
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
              {/*@ts-ignore*/}
              <GlobalTooltip.Ellipsis text={title || '-'} />
            </div>
            {extra && <div className="ml-4">{extra}</div>}
            {onEdit && (
              <PermissionWrapper permission={permission}>
                <Button type={'default'} size={'small'} onClick={onEdit}>
                  编辑
                </Button>
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
