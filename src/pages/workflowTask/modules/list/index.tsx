import React, { useState, useCallback } from 'react';
import { Typography, Tabs } from '@arco-design/web-react';
import WorkflowRunList from './WorkflowRunList';
import TaskNodeRunList from './TaskNodeRunList';

const { Title } = Typography;
const { TabPane } = Tabs;

type TabType = 'workflow' | 'task';

export default function WorkflowTaskList() {
  const [activeTab, setActiveTab] = useState<TabType>('workflow');

  // 切换Tab
  const handleTabChange = useCallback((key: string) => {
    setActiveTab(key as TabType);
  }, []);

  return (
    <div className="box-sizing: border-box; h-full py-[20px] pr-[20px]">
      <div className="flex h-full flex-col rounded-[12px] bg-white p-[24px]">
        {/* 标题 */}
        <div className="text-[20px] font-[500] leading-[30px] text-[var(--color-text-1)]">
          运行记录
        </div>

        {/* Tab */}
        <div className="my-[16px]">
          <Tabs activeTab={activeTab} onChange={handleTabChange}>
            <TabPane key="workflow" title="工作流运行记录" />
            <TabPane key="task" title="任务节点运行记录" />
          </Tabs>
        </div>

        {/* 内容区域 */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          {activeTab === 'workflow' ? <WorkflowRunList /> : <TaskNodeRunList />}
        </div>
      </div>
    </div>
  );
}
