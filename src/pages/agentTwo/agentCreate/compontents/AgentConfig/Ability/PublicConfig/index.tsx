import React from 'react';
import { Switch } from '@arco-design/web-react'
import { useAgentEditor } from '../../../AgentProvider/Context'



const PublicConfig = () => {
    const agent = useAgentEditor();
    const { infoStore } = agent;
    return (
        <div className='mt-2'>
            <div className='flex mb-1'>
                <div className='mr-2 font-bold '>展示执行过程</div>
                <Switch
                    checkedText="开"
                    uncheckedText="关"
                    onChange={value => {
                        infoStore.setShowThinking(value);
                    }}
                />
            </div>
            <div>
                开启时，应用使用者可查看模型思考、工具流调用及知识库使用情况等。
            </div>
        </div>
    )
}
export default PublicConfig;