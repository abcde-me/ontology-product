import React, { memo } from 'react';
import { Popover } from '@arco-design/web-react';
import cn from '@/pages/workflowConfig/utils/classnames';

interface SupProps {
  children: React.ReactNode;
  className?: string;
  dsid?: string;
  chunkid?: string;
  fileid?: string;
  filename?: string;
  onChangeSup?: (content: string) => void; // 新增 props
}

const Sup = memo(
  ({
    children,
    className,
    onChangeSup,
    dsid,
    chunkid,
    fileid,
    filename
  }: SupProps) => {
    const content = String(children);

    const handleClick = () => {
      // onChangeSup?.(content); // 触发回调
      // window.open(
      //   `${window.location.origin}/tenant/compute/appforge/workflowConfig?id=${dsid}&fileid=${fileid}&chunkid=${chunkid}`
      // );
    };

    // 处理
    if (!chunkid || !dsid) {
      return <sup className={className}>{children}</sup>;
    }

    return (
      <Popover
        content={
          <span>
            <p className="text-blue-700" onClick={handleClick}>
              {filename}
            </p>
          </span>
        }
      >
        <span
          className={cn(
            className,
            'ml-1 cursor-pointer text-[14px] text-blue-700 hover:underline'
          )} // 绑定点击事件
        >
          [{content}]
        </span>
      </Popover>
    );
  }
);

Sup.displayName = 'Sup';

export default Sup;
