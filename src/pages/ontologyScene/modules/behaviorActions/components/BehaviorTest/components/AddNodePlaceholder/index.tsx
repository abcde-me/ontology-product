import React from 'react';
import BehaviorMainSvg from '@/assets/benti/behaviorMain.svg';

export const AddNodePlaceholder: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <BehaviorMainSvg />
      <span className="text-[#23293B]">点击左侧列表添加节点</span>
    </div>
  );
};
