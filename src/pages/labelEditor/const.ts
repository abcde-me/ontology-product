import { InstanceofPlugin, EventTargetPlugin } from 'wujie-polyfill';

export const TEXT_DATA = {
  TEXT_ENTITY: 'entity-relation',
  TEXT_CLASSIFICATION: 'classification',
  TEXT_QA: 'qa',
  TEXT_SORT: 'ranking'
};

export const LabelTypeMap = {
  '1': 'text',
  '2': 'image'
};

export const WujiePlugins = navigator.userAgent.includes('Firefox')
  ? [
      InstanceofPlugin(),
      EventTargetPlugin(),
      {
        patchElementHook(element: any, iframeWindow: any) {
          // 解决firefox下拉框无法对齐
          try {
            Object.defineProperties(element, {
              getRootNode: {
                configurable: true,
                get: () => iframeWindow.Node.prototype.getRootNode
              }
            });
          } catch (error) {
            console.warn(error);
          }
        }
      }
    ]
  : [InstanceofPlugin(), EventTargetPlugin()];
