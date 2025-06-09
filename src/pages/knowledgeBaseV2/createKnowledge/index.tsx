import React, { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import DemoForm from '../components/From/index';
import { Button } from '@arco-design/web-react';
import { useLocation } from 'react-router-dom';
function CreateKnowledge() {
  const location = useLocation();
  const childRef: any = useRef();

  const submitFromOnc = () => {
    childRef.current.submitFromOnc();
  };
  const clearFromOnc = () => {
    childRef.current.clearFromOnc();
  };
  return (
    <div className="knowledgeList h-full py-[20px] pr-[20px]">
      <div className="h-full max-h-[calc(100vh-90px)] overflow-auto rounded-[12px] bg-white px-[24px] py-[20px]">
        <div className="mb-[20px] flex items-center justify-between">
          <div className="text-[18px] font-[500] leading-[28px] text-[var(--color-text-1)]">
            创建知识库
          </div>
        </div>
        <div>
          <DemoForm ref={childRef} typemodel={'createPolicy'}></DemoForm>
          {/* <Form.Item label={null} style={{ marginLeft: 100 }}> */}
          <Button
            type="primary"
            htmlType="submit"
            onClick={() => submitFromOnc()}
            style={{ marginLeft: 100 }}
          >
            确定
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => clearFromOnc()}>
            取消
          </Button>
        </div>
      </div>
    </div>
  );
}
export default observer(CreateKnowledge);
