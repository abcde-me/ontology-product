import React, { useEffect, useImperativeHandle, useRef } from 'react';
import ParamForm from './ParamForm';
import './index.css';
import { toolCreateStore } from './model';
import { observer } from 'mobx-react-lite';

function StepInputParams(props, ref) {
  const formRef = useRef(null);
  useImperativeHandle(
    ref,
    () => {
      return {
        async validate() {
          const values = await formRef.current.validate();
          toolCreateStore.setInputParams(values);
        }
      };
    },
    []
  );
  const inputParams = toolCreateStore.inputParams;
  useEffect(() => {
    if (inputParams) formRef.current.setData(inputParams);
  }, [inputParams]);
  return (
    <div className="ml-auto mr-auto w-[84%] rounded-[8px] bg-[var(--color-bg-3)] p-[24px]">
      <div className="mx-auto">
        <div className="mb-[8px] text-[14px] font-[600] leading-[22px] text-[var(--color-text-1)]">
          配置输入参数
        </div>
        <ParamForm ref={formRef} />
      </div>
    </div>
  );
}

export default observer(React.forwardRef(StepInputParams));
