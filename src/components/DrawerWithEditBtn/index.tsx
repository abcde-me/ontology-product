import React, { ComponentProps, DetailedHTMLProps } from 'react';
import { Button, Drawer, DrawerProps, ResizeBox } from '@arco-design/web-react';
import styles from './index.module.scss';
import { IconClose } from '@arco-design/web-react/icon';
import classNames from 'classnames';
import { GlobalTooltip } from '@ceai-front/arco-material';
import { PermissionWrapper } from '@/components/PermissionGuard';
import { ONTOLOGY_PERMISSIONS } from '@/config/permissions';

export interface DrawerWithEditBtnProps extends DrawerProps {
  onEdit?: () => void;
  extra?: React.ReactNode;
  /**
   * 权限点
   */
  permission?: string | string[];
  /**
   * 是否可以调整抽屉的宽度，默认开启
   */
  resize?: boolean;
  /**
   * 最小宽度 默认900，开启宽度调整功能后生效
   */
  minWidth?: number;
  /**
   * 最大宽度 默认视口宽度的90%，开启宽度调整功能后生效
   */
  maxWidth?: number;
}

const ResizeContainer = (props: ComponentProps<typeof ResizeBox>) => {
  return (
    <ResizeBox
      {...props}
      resizeTriggers={{
        left: (
          <div
            className={classNames([styles['resize-trigger'], 'resize-trigger'])}
          >
            <div />
          </div>
        )
      }}
    />
  );
};
const CommonContainer = (props: DetailedHTMLProps<any, any>) => (
  <div {...props} />
);

export const DrawerWithEditBtn = (props: DrawerWithEditBtnProps) => {
  const {
    className,
    onEdit,
    title,
    onCancel,
    extra,
    width,
    permission = ONTOLOGY_PERMISSIONS.MODIFY,
    children,
    //
    resize = true,
    // 默认最小900，最大为视口宽度的90%
    minWidth = 900,
    maxWidth = window.innerWidth * 0.9,
    ...otherProps
  } = props;
  const initialWidth = resize ? minWidth : width;

  // 如果没有传入width，使用默认宽度样式
  const drawerClassName = classNames(
    styles['os-drawer'],
    {
      [styles['resize-os-drawer']]: resize
    },
    className
  );
  const Container = resize ? ResizeContainer : CommonContainer;

  return (
    <Drawer
      {...otherProps}
      autoFocus={false}
      getChildrenPopupContainer={(node) => {
        return document.querySelector('#ontologySceneContent') || document.body;
      }}
      getPopupContainer={() => {
        return document.querySelector('#ontologySceneContent') || document.body;
      }}
      width={initialWidth}
      closeIcon={null}
      mask={false}
      // maskStyle={{ background: 'transparent', cursor: 'not-allowed' }}
      className={drawerClassName}
      style={{
        minWidth,
        maxWidth
      }}
      title={null}
    >
      <Container
        directions={['left']}
        className={classNames(
          {
            [styles['resize-box-container']]: resize
          },
          styles['os-drawer-content-container']
        )}
        style={{
          width: initialWidth,
          minWidth,
          maxWidth
        }}
      >
        <div
          className={`flex items-center justify-between gap-4 py-5 ${styles['drawer-title']}`}
        >
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
        <div className={styles['drawer-body']}>{children}</div>
      </Container>
    </Drawer>
  );
};
