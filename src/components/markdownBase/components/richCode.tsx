import { memo } from 'react';
import { useRichCode } from '../hooks/useRichCode';

const RichCode = ({ inline, className, children, ...props }: any) => {
  const { codeComponent } = useRichCode(children, className, props);

  // 如果没有有效的代码组件，返回null
  if (!codeComponent) return null;

  // 直接返回codeComponent，它已经是一个JSX元素
  return codeComponent;
};

RichCode.displayName = 'RichCode';

export default RichCode;
