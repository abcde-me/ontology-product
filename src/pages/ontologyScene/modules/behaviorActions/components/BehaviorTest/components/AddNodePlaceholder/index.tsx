import React from 'react';
import { IconPlus } from '@arco-design/web-react/icon';

export const AddNodePlaceholder: React.FC = () => {
  return (
    <div className="mt-4 flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-[#e5e6eb] bg-[#f7f8fa] px-6 py-12">
      <IconPlus className="text-[32px] text-[#c9cdd4]" />
      <span className="text-sm text-[#86909c]">点击左侧列表添加节点</span>
    </div>
  );
};
