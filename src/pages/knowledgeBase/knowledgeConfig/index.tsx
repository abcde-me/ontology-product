import { Button, Space, Steps } from '@arco-design/web-react';

import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  createKnowledgeInit,
  fetchIndexingStatus,
  fetchProcessRule
} from '@/api/knowledgeBase';
import BreadcrumbCom from '@/components/BreadcrumbCom';
import './index.less';
import Step1 from './step1';
import Step2 from './step2';
import Step3 from './step3';
import Step4 from './step4';
import { get } from 'lodash';

function KnowledgeConfigPage() {
  const history = useHistory();
  const [step, setStep] = useState(1);
  const [nextStepEnabled, setNextStepEnabled] = useState({ 1: false, 2: true, 3: true })
  const [stepData, setStepData] = useState({ 1: {}, 2: {}, 3: {}, 4: {} })


  const breadcrumbList = [
    {
      name: 'AppForge'
    },
    {
      name: '个人空间'
    },
    {
      name: '知识库',
      href: '/tenant/compute/appforge/knowledgeBase'
    },
    {
      name: '创建知识库'
    }
  ];

  const handleNextClick = async () => {
    if (step === 1) {
      setStep((prev) => (prev += 1));
    }
    if (step === 2) {
      setStep((prev) => (prev += 1));
    }
    if (step === 3) {
      setStep((prev) => (prev += 1));
    }
  };

  const handleCancel = () => {
    history.push(`/tenant/compute/appforge/knowledgeBase`);
  };

  return (
    <div className="h-full pb-[20px] pr-[20px] kb-config-page">
      <BreadcrumbCom list={breadcrumbList} />
      <div className="h-full max-h-[calc(100vh-175px)] overflow-auto rounded-t-[12px] bg-white px-[24px] py-[20px]">
        <div className="mb-[20px] flex items-center justify-between">
          <div className="text-[18px] font-[500] leading-[32px] text-[var(--color-text-1)]">
            创建知识库
          </div>
        </div>

        <Steps
          labelPlacement="vertical"
          current={step}
          className="mx-auto mb-[20px] max-w-[780px]"
        >
          <Steps.Step title="选择数据" />
          <Steps.Step title="知识库设置" />
          <Steps.Step title="分段与预览" />
          <Steps.Step title="数据处理" />
        </Steps>

        <div className="">
          {step === 1 && (
            <Step1 setNextStepEnabled={setNextStepEnabled} setStepData={setStepData}/>
          )}
          {step === 2 && (
            <Step2 setNextStepEnabled={setNextStepEnabled} setStepData={setStepData} />
          )}
          {step === 3 && (
            <Step3 setNextStepEnabled={setNextStepEnabled} setStepData={setStepData} />
          )}
          {step === 4 && (
            <Step4 setNextStepEnabled={setNextStepEnabled} setStepData={setStepData} />
          )}
        </div>
      </div>
      <div className="box-border h-[65px] w-full rounded-b-[12px] border-t border-[var(--color-border-2)] bg-white pl-[76px] leading-[64px]">
        <Space>
          <Button type="secondary" onClick={() => handleCancel()}>
            取消
          </Button>
          { step > 1 &&
            <Button type="secondary" onClick={() => setStep((prev) => (prev -= 1))}>
              上一步
            </Button>
          }
          <Button
            type="primary"
            disabled={!nextStepEnabled[step]}
            onClick={handleNextClick}
          >
            {step < 4 ? '下一步' : '确定'}
          </Button>
        </Space>
      </div>
    </div>
  );
}

export default observer(KnowledgeConfigPage);
