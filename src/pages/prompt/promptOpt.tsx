import { Button, Input, Space, Alert } from '@arco-design/web-react';
import React, { useState, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IconCheckCircle,
  IconClockCircle,
  IconCloseCircle,
  IconLoading
} from '@arco-design/web-react/icon';

function PromptOpt(props) {
  const history = useHistory();
  const [preText, setPreText] = useState('')
  const [postText, setPostText] = useState('')

  return (
    <div className="prompt-opt-part">
      <Alert content='根据填写的Prompt内容，系统可自动进行优化' />
      <div className='mt-[16px] flex gap-x-[20px] w-full'>
        <div className='pre-prompt'>
          <div className='prompt-header'>
            <span className='txt'>原始Prompt</span>
            <Button disabled={!preText}>优化</Button>
          </div>
          <Input.TextArea
            placeholder='请输入Prompt'
            maxLength={8000}
            showWordLimit
            style={{ height: 468, width: '100%' }}
            value={preText}
            onChange={(val) => setPreText(val)}
          />
        </div>
        <div className='post-prompt'>
          <div className='prompt-header'>
            <span className='txt'>优化后Prompt</span>
            <span>
              <Button disabled={!postText} className="mr-[8px]">优化</Button>
              <Button disabled={!postText}>保存为模板</Button>
            </span>
          </div>
          <Input.TextArea
            maxLength={8000}
            showWordLimit
            value={postText}
            style={{ height: 468, width: '100%' }}
          />
        </div>
      </div>
    </div>
  )
}

export default PromptOpt;
