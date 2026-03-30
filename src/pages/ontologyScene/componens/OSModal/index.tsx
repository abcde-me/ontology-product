import React, { useEffect, ComponentProps } from 'react';
import { Modal } from '@arco-design/web-react';

export const OsModal = (props: ComponentProps<typeof Modal>) => {
  const { getPopupContainer, visible, mask = true } = props;
  const isFirefox =
    typeof navigator !== 'undefined' && /firefox/i.test(navigator.userAgent);

  useEffect(() => {
    if (!isFirefox || !mask) return;

    let frameId = 0;
    const syncMaskDisplay = () => {
      const container = getPopupContainer?.() || document.body;
      const masks = container.querySelectorAll('.arco-modal-mask');
      const currentMask = masks[masks.length - 1] as HTMLElement | undefined;
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
