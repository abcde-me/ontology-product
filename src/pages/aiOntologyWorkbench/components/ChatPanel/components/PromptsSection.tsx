import React from 'react';
import Prompts from './Prompts';
import { PromptItem } from '../types';

interface PromptsSectionProps {
  prompts: PromptItem[];
  onSelect: (params: { id: string; text: string }) => void;
}

/**
 * 推荐问题区域组件
 * 根据 Figma 设计：gap-[8px] between items
 * 如果没有推荐问题，则不显示整个组件
 */
const PromptsSection: React.FC<PromptsSectionProps> = ({
  prompts,
  onSelect
}) => {
  // 如果没有推荐问题，不渲染任何内容
  if (!prompts || prompts.length === 0) {
    return null;
  }

  return (
    <div className="flex w-full flex-col items-start gap-2">
      <div className="flex w-full items-center justify-between">
        <p className="text-[14px] font-normal leading-[22px] text-[#1e293b]">
          我可以帮您
        </p>
      </div>
      <div className="w-full">
        <Prompts list={prompts} onSelect={onSelect} />
      </div>
    </div>
  );
};

export default PromptsSection;
