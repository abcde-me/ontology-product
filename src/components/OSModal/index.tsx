import React, { useEffect, ComponentProps } from 'react';
import { Modal } from '@arco-design/web-react';
import { ConfirmProps } from '@arco-design/web-react/lib/Modal/confirm';

const isFirefoxBrowser = () =>
  typeof navigator !== 'undefined' && /firefox/i.test(navigator.userAgent);

const getLatestModalMask = (container: Element) => {
  const masks = container.querySelectorAll('.arco-modal-mask');
  return masks[masks.length - 1] as HTMLElement | undefined;
};

const removeModalMaskDisplay = (container: Element) => {
  const masks = container.querySelectorAll('.arco-modal-mask');
  masks.forEach((mask) => {
    (mask as HTMLElement).style.removeProperty('display');
  });
};

const removeAllModalMaskDisplay = () => {
  removeModalMaskDisplay(document);
};

type OsModalComponent = React.FC<ComponentProps<typeof Modal>> & {
  confirm: (props: ConfirmProps) => ReturnType<typeof Modal.confirm>;
};

/**
 * 兼容火狐浏览器遮罩
 * @param props
 * @constructor
 */
export const OntoModal: OsModalComponent = (props) => {
  const { getPopupContainer, visible, mask = true } = props;
  const isFirefox = isFirefoxBrowser();

  useEffect(() => {
    if (!isFirefox || !mask) return;

    let frameId = 0;
    const syncMaskDisplay = () => {
      const container = getPopupContainer?.() || document.body;
      const currentMask = getLatestModalMask(container);
      if (!currentMask) return;
      currentMask.style.setProperty(
        'display',
        visible ? 'block' : 'none',
        'important'
      );
    };

    frameId = window.requestAnimationFrame(syncMaskDisplay);
    return () => window.cancelAnimationFrame(frameId);
  }, [visible, mask]);

  return <Modal {...props} />;
};

OntoModal.confirm = (props: ConfirmProps) => {
  const { afterOpen, afterClose } = props;
  let frameId = 0;

  const getContainer = () => props.getPopupContainer?.() || document.body;
  const showMaskInFirefox = () => {
    if (!isFirefoxBrowser() || props.mask === false) return;

    const currentMask = getLatestModalMask(getContainer());
    currentMask?.style.setProperty('display', 'block', 'important');
  };

  const removeMaskDisplay = () => {
    window.cancelAnimationFrame(frameId);
    if (!isFirefoxBrowser() || props.mask === false) return;

    removeAllModalMaskDisplay();
    frameId = window.requestAnimationFrame(() => {
      removeAllModalMaskDisplay();
    });
  };

  const modal = Modal.confirm({
    ...props,
    afterOpen: () => {
      showMaskInFirefox();
      afterOpen?.();
    },
    wrapClassName: `${props.wrapClassName} arco-modal-firefox-mask`,
    afterClose: () => {
      removeMaskDisplay();
      afterClose?.();
    }
  });

  frameId = window.requestAnimationFrame(showMaskInFirefox);

  return modal;
};
