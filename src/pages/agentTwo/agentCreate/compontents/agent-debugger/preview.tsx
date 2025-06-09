import React from 'react';
import SuggestedQuestions from './suggested-questions';
import AgentDefaultIcon from '@/assets/agent-icon.png';

const Preview = () => {
  const welcomeText = '你好，我是合同审查智能助手。我能帮助你审查合同内容，识别潜在风险，并提供专业建议。无论你是个人还是企业，我都能为你提供便捷、高效的合同审查服务。请告诉我你的合同相关需求，我会尽力提供帮助。';

  const item = {
    isOpeningStatement: true,
    suggestedQuestions: ['这份合同的违约条款是否严谨？', '合同中的权责是否明确？', '合同审查需要注意哪些法律风险？'],
  }

  return (
    <div className="flex flex-col items-center mt-[88px]">
      <img className="w-20 h-20" src={AgentDefaultIcon} />
      <span className="text-[20px] font-[500] leading-[28px] text-[var(--color-text-1)] mt-[16px]">我的智能体应用</span>
      <div className="text-sm text-black leading-6 font-normal bg-[#EFF4FD] rounded-xl mt-6 mx-4 mb-0 p-2 px-3">
        {welcomeText}
      </div>
      <SuggestedQuestions item={item} />
    </div>
  );
};

export default Preview;
