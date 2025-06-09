import React, { useEffect, useState } from 'react';
import { Button, Drawer, Form, Input, Message, Radio, TreeSelect, Select, Space } from '@arco-design/web-react';
import {
  IconDelete,
  IconSettings,
  IconCopy
} from '@arco-design/web-react/icon';
import OptimizationIcon from '@/assets/optimization.svg';

export default function CreateByCrispe(props) {
  const [crispeType, setCrispeType] = useState('struct')
  return (
    <div className='crispe-prompt-content'>
      <div className="tip-text">Capacity and Role（角色）：明确AI在交互中应扮演的角色，如教育者、翻译者或顾问。 Insight（背景）：提供角色扮演的背景信息，帮助AI理解其在特定情境下的作用。 Statement（任务）：直接说明AI需要执行的任务，确保其理解并执行用户的请求。Personality（格式）：设定AI回复的风格和格式，使其更符合用户的期望和场景需求。 Experiment（实验）：如果需要，可以要求AI提供多个示例，以供用户选择最佳回复。</div>
      <div className='content-header'>
        <div className='prefix-text'>
          <div className={`crispe-type ${crispeType === 'struct' ? 'active' : ''}`} onClick={() => setCrispeType('struct')}>结构化Prompt</div>
          <div className={`crispe-type ${crispeType === 'full' ? 'active' : ''}`} onClick={() => setCrispeType('full')}>完整Prompt内容</div>
        </div>
        <div className='prompt-content-suffix-actions'>
          <div className='copy-action'><IconCopy className='text-[#007DFA] size-[16px] mr-[4]px'/><span>复制完整Prompt</span></div>
          <div className='opt-action'><OptimizationIcon className='size-[16px] mr-[4]px'/><span>优化Prompt</span></div>
        </div>
      </div>
      { crispeType === 'struct' &&
        <>
          <Form.Item field="role" label="角色与能力 (Capacity and Role)">
            <Input.TextArea
              maxLength={8000}
              showWordLimit
              placeholder='明确AI在交互中应扮演的角色，如教育者、翻译者或顾问。示例：“你是一位专业的谈判顾问，帮助公司在不超出预算的情况下吸引候选人。'
              style={{ height: 100, width: '100%' }}
            />
          </Form.Item>
          <Form.Item field="insight" label="背景信息 (Insight)    ">
            <Input.TextArea
              maxLength={8000}
              showWordLimit
              placeholder='提供角色扮演的背景信息，帮助AI理解其在特定情境下的作用。示例： “候选人目前有其他工作机会，他们期望获得更高的薪资。然而，我们公司有固定的薪资预算，但可以提供其他福利，如灵活的工作时间、股票期权和职业发展机会。'
              style={{ height: 100, width: '100%' }}
            />
          </Form.Item>
          <Form.Item field="statement" required label="指令 (Statement)">
            <Input.TextArea
              maxLength={8000}
              showWordLimit
              placeholder='直接说明AI需要执行的任务，确保其理解并执行用户的请求。示例：“你需要模拟一次谈判对话，候选人试图争取更高的薪资，而你则需要展示公司提供的其他福利来吸引他们。'
              style={{ height: 100, width: '100%' }}
            />
          </Form.Item>
          <Form.Item field="personality" label="输出风格 (Personality)">
            <Input.TextArea
              maxLength={8000}
              showWordLimit
              placeholder='设定AI回复的风格和格式，使其更符合用户的期望和场景需求。示例：“在谈判中，你应该表现出专业和坚定的态度，同时也要展现出理解和体贴，以便更好地与候选人沟通。'
              style={{ height: 100, width: '100%' }}
            />
          </Form.Item>
          <Form.Item field="experiment" label="输出范围 (Experiment)">
            <Input.TextArea
              maxLength={8000}
              showWordLimit
              placeholder='如果需要，可以要求AI提供多个示例，以供用户选择最佳回复。示例：“生成两种不同版本的谈判对话，一种是更注重理性分析和数据支持的版本，另一种则是更注重情感联系和个人发展的版本。'
              style={{ height: 100, width: '100%' }}
            />
          </Form.Item>
        </>
      }
      { crispeType === 'full' &&
        <>
          <Form.Item field="full" label="">
            <Input.TextArea
              maxLength={8000}
              showWordLimit
              placeholder={`角色与能力:
背景信息:
指令:
输出风格:
输出范围:`}
              style={{ height: 260, width: '100%' }}
            />
          </Form.Item>
        </>
      }

    </div>
  )
}
