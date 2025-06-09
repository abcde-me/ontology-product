import { Button, Spin, Steps } from '@arco-design/web-react';
import { IconArrowLeft } from '@arco-design/web-react/icon';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import StepInfo from './StepInfo';
import StepInputParams from './StepInputParams';
import StepOutputParams from './StepOutputParams';
import './index.css';
import { toolCreateStore } from './model';
import { useParams } from '@/utils/url';
import StepDebug from './StepDebug';

const Step = Steps.Step;
function ToolCreate() {
  const curStep = toolCreateStore.curStep;
  const history = useHistory();
  const stepRef = useRef<{ validate: () => Promise<any> }>(null);
  const provider = useParams('provider');
  const toolPath = useParams('toolPath');
  const toolMethod = useParams('toolMethod');
  const step = useParams('step');
  useEffect(() => {
    toolCreateStore.getCollectionDetail(provider);
  }, [provider]);

  const initRef = React.useRef(false);
  if (!initRef.current) {
    initRef.current = true;
    toolCreateStore.reset();
  }

  useEffect(() => {
    toolCreateStore.setTool(toolPath || '', toolMethod || '');
  }, [toolMethod, toolPath]);

  useEffect(() => {
    toolCreateStore.setStep(isNaN(+step) || !step ? 1 : +step);
  }, [step]);

  const goDetail = () =>
    history.push(
      `/tenant/compute/appforge/toolDetail?name=${provider}&type=api`
    );
  return (
    <div className="relative flex h-full flex-col overflow-auto py-[20px] pr-[20px]">
      <div className="flex h-full  flex-auto flex-col overflow-auto rounded-tl-[8px] rounded-tr-[8px] bg-white pb-[20px]">
        <div className="flex items-center p-[20px]">
          <div
            className="flex size-[24px] cursor-pointer items-center justify-center rounded-full bg-white shadow-[0px_2px_8px_0px_rgba(0,0,0,0.1)] "
            onClick={() => goDetail()}
          >
            <IconArrowLeft className="text-[16px]" />
          </div>

          <span className="ml-[16px] text-[20px] leading-[32px] text-[var(--color-text-1)]">
            {toolCreateStore.toolName}
          </span>
        </div>
        <Steps
          labelPlacement="vertical"
          current={curStep}
          size="small"
          className="mb-[10px] ml-auto mr-auto w-[67%]"
        >
          <Step title="基本信息" />
          <Step title="配置输入参数" />
          <Step title="配置输出参数" />
          <Step title="调试与校验" />
        </Steps>
        {curStep === 1 ? <StepInfo ref={stepRef} /> : null}
        {curStep === 2 ? <StepInputParams ref={stepRef} /> : null}
        {curStep === 3 ? <StepOutputParams ref={stepRef} /> : null}
        {curStep === 4 ? <StepDebug ref={stepRef} /> : null}
      </div>
      <div className="flex-none rounded-bl-[8px] rounded-br-[8px] border border-transparent border-t-[var(--color-border-2)]  bg-white py-[17px]">
        <Button
          className="ml-[100px]"
          type="outline"
          onClick={() => {
            if (toolCreateStore.curStep === 1) goDetail();
            else toolCreateStore.prev(history);
          }}
        >
          {toolCreateStore.curStep === 1 ? '取消' : '上一步'}
        </Button>
        <Button
          type="primary"
          className="ml-[8px]"
          onClick={async () => {
            try {
              if (toolCreateStore.curStep === 4) {
                goDetail();
                return;
              }
              if (stepRef.current) await stepRef.current.validate();
              toolCreateStore.next(history);
            } catch (err) {}
          }}
          loading={toolCreateStore.saving}
        >
          {toolCreateStore.curStep === 4 ? '完成' : '保存并下一步'}
        </Button>
      </div>
      {toolCreateStore.loading ? (
        <Spin className="absolute inset-0" block loading>
          <div className="absolute inset-0"></div>
        </Spin>
      ) : null}
    </div>
  );
}

export default observer(ToolCreate);
