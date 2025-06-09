import React from 'react';
import { Button, Space } from '@arco-design/web-react';
import { IconStar, IconShareAlt } from '@arco-design/web-react/icon';
import deepseekImage from './deepseek.png';
import elses from './组 6847.png';
function AgentSidebar(props) {
  return (
    <div
      className="h-full  w-[400px] gap-9"
      style={{ background: 'rgb(241, 246, 254)' }}
    >
      <div className="h-[136px] w-[364px] gap-4" style={{ marginLeft: '18px' }}>
        <div
          className="flex min-h-[32px] w-full max-w-[364px] flex-row items-center gap-6"
          style={{ marginTop: '14px' }}
        >
          <span className="text-center font-['PingFang_SC'] text-[24px] font-medium not-italic leading-[32px] tracking-normal">
            24K
          </span>
          <span
            className="font-[PingFang-SC] text-[14px] font-normal leading-[22px] tracking-normal"
            style={{ marginLeft: '-18px' }}
          >
            使用
          </span>
          <span className="text-center font-[PingFang-SC] text-[24px] font-medium leading-[32px] tracking-normal">
            341
          </span>
          <span
            className="font-[PingFang-SC] text-[14px] font-normal leading-[22px] tracking-normal"
            style={{ marginLeft: '-18px' }}
          >
            收藏
          </span>
        </div>

        {/* 按钮部分 */}
        <div
          className="flex min-h-[34px] w-full max-w-[364px] flex-row gap-2"
          style={{ marginTop: '16px' }}
        >
          <Button
            type="outline"
            className="flex h-[34px] w-[178px] items-center justify-center rounded border border-gray-300 px-[20px] py-[7px]"
          >
            <IconStar style={{ marginLeft: '1.02px' }} />
            &nbsp;收藏
          </Button>
          <Button
            type="outline"
            className="flex h-[34px] w-[178px] items-center justify-center rounded border border-gray-300 px-[20px] py-[7px]"
          >
            <IconShareAlt style={{ marginLeft: '1.02px' }} />
            &nbsp; 分享
          </Button>
        </div>
        <div
          className="min-h-[136px] w-full max-w-[364px] gap-1"
          style={{ marginTop: '16px' }}
        >
          <div className="font-[PingFang-SC] text-[14px] font-medium leading-[22px] tracking-normal">
            应用描述
          </div>
          <div>
            <p className="font-[PingFang-SC] text-[14px] font-normal leading-[22px] tracking-normal">
              「企业小助手」是一款基于大模型的智能对话助手，专为企业场景优化，提供高效办公支持。它能智能处理数据分析、文档生成、会议安排等任务，同时支持金融指标解读与行业趋势预测，助力决策精准化。通过自然语言交互，简化复杂流程，提升团队效率，是您的全能AI办公伙伴!
            </p>
          </div>
        </div>
        <div className="h-fit w-[364px]  gap-1" style={{ marginTop: '16px' }}>
          <div className="font-[PingFang-SC] text-[14px] font-medium leading-[22px] tracking-normal" style={{marginBottom:'3px'}}>
            开发者
          </div>
          <div>
            <p className="font-['PingFang_SC'] text-[14px] font-normal not-italic leading-[22px] tracking-normal">
              中国电子云@monkeyking
            </p>
          </div>
        </div>
        <div className="h-fit w-[364px]  gap-1" style={{ marginTop: '18px' }}>
          <div className="font-[PingFang-SC] text-[14px] font-medium leading-[22px] tracking-normal" style={{marginBottom:'3px'}}>
            最近更新
          </div>
          <div>
            <p className="font-['PingFang_SC'] text-[14px] font-normal not-italic leading-[22px] tracking-normal">
              2025/05/05 15:15:15
            </p>
          </div>
        </div>
        <div
          className="h-fit max-h-[82px] w-fit max-w-[117px]  gap-2"
          style={{ marginTop: '18px' }}
        >
          <p className="font-[PingFang-SC] text-[14px] font-medium leading-[22px] tracking-normal">
            模型
          </p>
          <div className='flex items-center gap-2' style={{marginTop:'10px'}}>
            <img src={deepseekImage} alt="123" />
            <p className="align-middle font-['PingFang_SC'] text-[14px] font-normal not-italic leading-[22px] tracking-normal">
              私有模型X5
            </p>
          </div>

          <div className='flex items-center gap-2' style={{marginTop:'10px'}}>
            <img src={deepseekImage} alt="123" />
            <p className="align-middle font-['PingFang_SC'] text-[14px] font-normal not-italic leading-[22px] tracking-normal">
              DeepSeek-R1
            </p>
          </div>
        </div>
        <div
          className="h-fit max-h-[82px] w-fit max-w-[142px]  gap-2"
          style={{ marginTop: '18px' }}
        >
          <p className="font-[PingFang-SC] text-[14px] font-medium leading-[22px] tracking-normal">
            工作流
          </p>
          <div className='flex items-center gap-2' style={{marginTop:'10px'}}>
            <img src={elses} alt="" />
            <p className="align-middle font-['PingFang_SC'] text-[14px] font-normal not-italic leading-[22px] tracking-normal">
              私有工作流
            </p>
          </div>

          <div className='flex items-center gap-2' style={{marginTop:'10px'}}>
            <img src={elses} alt="" />
            <p className="align-middle font-['PingFang_SC'] text-[14px] font-normal not-italic leading-[22px] tracking-normal">
             read_sku_camera
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default AgentSidebar;
