import React, { memo } from 'react';
import { Popover } from '@arco-design/web-react';
import cn from '@/pages/workflowConfig/utils/classnames';

interface SupProps {
  children: React.ReactNode;
  className?: string;
  name?: string;
  id?: string;
  onChangeSup?: (content: string) => void; // 新增 props
}

const Sup = memo(({ children, className, onChangeSup, name, id }: SupProps) => {
  const content = String(children);

  const handleClick = () => {
    console.log('点击了', id, name);
    onChangeSup?.(content); // 触发回调
  };

  // 处理
  if (!name || !id) {
    return <sup className={className}>{children}</sup>;
  }

  return (
    <Popover
      content={
        <span>
          <p className="cursor-pointer hover:text-blue-700 hover:underline">
            {name}
          </p>
        </span>
      }
    >
      <span
        className={cn(
          className,
          'ml-1 cursor-pointer text-[14px] text-blue-700 hover:underline'
        )}
        onClick={handleClick} // 绑定点击事件
      >
        [{content}]
      </span>
    </Popover>
  );
});

Sup.displayName = 'Sup';

export default Sup;
