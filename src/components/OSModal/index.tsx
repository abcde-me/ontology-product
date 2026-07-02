import React, { useEffect, ComponentProps } from 'react';
import { Modal } from '@arco-design/web-react';
import { ConfirmProps } from '@arco-design/web-react/lib/Modal/confirm';
import { scheduleOverlayCleanup } from '@/utils/removeStaleArcoOverlays';

type OsModalComponent = React.FC<ComponentProps<typeof Modal>> & {
  confirm: (props: ConfirmProps) => ReturnType<typeof Modal.confirm>;
};

/**
 * 业务弹窗封装：关闭后清理可能残留的 Arco 全屏 wrapper
 */
export const OntoModal: OsModalComponent = (props) => {
  const { visible = false, mask = true } = props;

  useEffect(() => {
    if (!visible) {
      scheduleOverlayCleanup();
    }
  }, [visible]);

  if (!visible) {
    return null;
  }

  return <Modal {...props} unmountOnExit mask={mask} />;
};

OntoModal.confirm = (props: ConfirmProps) => {
  const { afterOpen, afterClose } = props;

  const modal = Modal.confirm({
    ...props,
    unmountOnExit: true,
    afterOpen: () => {
      afterOpen?.();
    },
    afterClose: () => {
      afterClose?.();
      scheduleOverlayCleanup();
    }
  });

  return modal;
};
