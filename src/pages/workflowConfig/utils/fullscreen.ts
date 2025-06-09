/* eslint-disable */

const FullscreenUtil = {
  //是否允许全屏
  canFull: () => !!(document.exitFullscreen || (document as any).mozCancelFullScreen || (document as any).webkitExitFullscreen),
  canFullScreen: function () {
    return this.canFull();
  },

  exitFullscreen: async function () {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
    } else if ((document as any).mozCancelFullScreen) {
      (document as any).mozCancelFullScreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    } else {
      console.info("Current browser not support dom full screen!");
    }
  },

  requestFullscreen: async function (dom: any) {
    if (dom.requestFullscreen) {
      await dom.requestFullscreen();
    } else if (dom.mozRequestFullScreen) {
      dom.mozRequestFullScreen();
    } else if (dom.webkitRequestFullScreen) {
      dom.webkitRequestFullScreen();
    } else if (dom.msRequestFullscreen) {
      dom.msRequestFullscreen();
    } else {
      console.info("Current browser not support dom full screen!");
    }
  }
}

export default FullscreenUtil;