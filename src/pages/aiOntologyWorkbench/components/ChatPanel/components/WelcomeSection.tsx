import React from 'react';
import AIIcon from '../../../assets/ai.svg';

/**
 * 欢迎区域组件 - 显示 AI 图标和标题
 * 根据 Figma 设计：gap-[16px] between icon and title
 */
const WelcomeSection: React.FC = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="h-20 w-20">
        <AIIcon className="h-full w-full rounded-[12px]" />
      </div>
      <div className="flex flex-col items-center justify-center">
        <h2 className="text-[24px] font-semibold leading-[36px] text-[#0f131f]">
          Hi, 我是本体智能助手
        </h2>
      </div>
    </div>
  );
};

export default WelcomeSection;
