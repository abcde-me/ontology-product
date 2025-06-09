import SuccessIcon from '@/assets/chat/status-success.svg';
import ArrowDownIcon from '@/assets/chat/arrow-down.svg';

// 思考类型
export const THINK_TYPE_MODEL = 'modelThink'; // 模型思考
export const THINK_TYPE_KNOWBASE = 'kownledgeBase'; // 知识库思考
export const THINK_TYPE_WORKFLOW = 'workflow'; // 工作流思考
export const THINK_TYPE_TAMPER = 'tamper'; // 干预

// 类型文本获取

const thinkMap = new Map([
  [THINK_TYPE_MODEL, '模型思考'],
  [THINK_TYPE_KNOWBASE, '调用知识库'],
  [THINK_TYPE_WORKFLOW, '调用工作流'],
  [THINK_TYPE_TAMPER, '问答干预']
]);

export const getThinkTypeText = (type: string) => {
  return thinkMap.get(type) || '';
};

// 状态
export const SUCCESS_STATE = 'success';
export const ERROR_STATE = 'error';

export const getIconByState = (state: IstepsState) => {
  switch (state) {
    case SUCCESS_STATE:
      return SuccessIcon;
    case ERROR_STATE:
      return ArrowDownIcon; // 统一返回JSX元素
    default:
      return null;
  }
};

// unit单位处理
export const THINK_UNIT = '秒';
export const THINK_TIME_TEXT = '运行时间';

// 类型定义

export type IstepsState = 'success' | 'error' | 'loading';
