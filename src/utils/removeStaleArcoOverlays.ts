const CLEANUP_DELAYS = [0, 50, 200, 500, 1000];

const isElementDisplayed = (el: Element | null) => {
  if (!el || !el.isConnected || !(el instanceof HTMLElement)) {
    return false;
  }

  return window.getComputedStyle(el).display !== 'none';
};

/** Modal 关闭后 wrapper 会设为 display:none，仅清理这类残留节点 */
const isModalWrapperActive = (wrapper: Element) => {
  if (!isElementDisplayed(wrapper)) {
    return false;
  }

  return Boolean(wrapper.querySelector('.arco-modal'));
};

/** Drawer 关闭时带 arco-drawer-wrapper-hide；打开/入场动画期间不能按 opacity 误判为 stale */
const isDrawerWrapperActive = (wrapper: Element) => {
  if (!(wrapper instanceof HTMLElement)) {
    return false;
  }

  return !wrapper.classList.contains('arco-drawer-wrapper-hide');
};

/**
 * 清理 Arco Modal/Drawer 未正确卸载时残留的全屏遮罩与 wrapper，避免阻塞页面交互。
 * 注意：不要调用 Modal.destroyAll()，否则会误关图谱等页面中仍挂载的 Modal。
 */
export const removeStaleArcoOverlays = () => {
  document.querySelectorAll('.arco-modal-wrapper').forEach((wrapper) => {
    if (!isModalWrapperActive(wrapper)) {
      wrapper.remove();
    }
  });

  document.querySelectorAll('.arco-drawer-wrapper').forEach((wrapper) => {
    if (!isDrawerWrapperActive(wrapper)) {
      wrapper.remove();
    }
  });

  document
    .querySelectorAll('.arco-modal-mask, .arco-drawer-mask')
    .forEach((mask) => {
      const wrapper = mask.closest('.arco-modal-wrapper, .arco-drawer-wrapper');
      if (!wrapper) {
        mask.remove();
        return;
      }

      if (
        mask.classList.contains('arco-modal-mask') &&
        !isModalWrapperActive(wrapper)
      ) {
        mask.remove();
        return;
      }

      if (
        mask.classList.contains('arco-drawer-mask') &&
        !isDrawerWrapperActive(wrapper)
      ) {
        mask.remove();
      }
    });
};

let cleanupTimerIds: number[] = [];

export const scheduleOverlayCleanup = () => {
  cleanupTimerIds.forEach((id) => window.clearTimeout(id));
  cleanupTimerIds = [];

  removeStaleArcoOverlays();
  const frameId = window.requestAnimationFrame(removeStaleArcoOverlays);

  cleanupTimerIds = CLEANUP_DELAYS.map((delay) =>
    window.setTimeout(removeStaleArcoOverlays, delay)
  );

  return () => {
    window.cancelAnimationFrame(frameId);
    cleanupTimerIds.forEach((id) => window.clearTimeout(id));
    cleanupTimerIds = [];
  };
};

if (typeof window !== 'undefined') {
  window.addEventListener('pageshow', () => {
    scheduleOverlayCleanup();
  });
}
