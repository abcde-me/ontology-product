import React from 'react';

/**
 * 介绍组件 - 根据 Figma 设计实现
 * 背景色: #f5f7fc
 * padding: px-[16px] py-[10px]
 * border-radius: 4px
 */
const Introduction: React.FC = () => {
  return (
    <div className="w-full rounded-[4px] bg-[#f5f7fc] px-[16px] py-[10px]">
      <p className="text-[14px] font-normal leading-[22px] text-[#0f131f]">
        你好！我是专为你搭建的智能体知识问答智能助手，已加载完整知识库，可快速、准确地为你解答各类问题。
      </p>
    </div>
  );
};

export default Introduction;
