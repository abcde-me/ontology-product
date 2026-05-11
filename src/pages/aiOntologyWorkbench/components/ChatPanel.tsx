import React, { useState } from 'react';
import { IconPlus, IconHistory } from '@arco-design/web-react/icon';
import { Tooltip } from '@arco-design/web-react';
import { Welcome, Prompts, Sender } from '@ceai-front/chat';

/**
 * 推荐问题列表（固定数据）
 */
const PROMPT_LIST = [
  {
    id: '1',
    value: '帮我创建一个用户对象类型'
  },
  {
    id: '2',
    value: '如何定义对象之间的关系？'
  },
  {
    id: '3',
    value: '为对象添加行为'
  }
];

interface ChatPanelProps {
  /** 新建会话回调 */
  onNewSession?: () => void;
  /** 历史会话回调 */
  onHistoryClick?: () => void;
  /** 发送消息回调 */
  onSendMessage?: (message: string) => void;
}

/**
 * 左侧对话面板
 */
const ChatPanel: React.FC<ChatPanelProps> = ({
  onNewSession,
  onHistoryClick,
  onSendMessage
}) => {
  /**
   * 处理发送消息
   */
  const handleSend = (params: { text: string }) => {
    if (!params.text.trim()) return;
    onSendMessage?.(params.text);
  };

  /**
   * 处理点击推荐问题
   */
  const handlePromptSelect = (params: { id: string; text: string }) => {
    onSendMessage?.(params.text);
  };

  return (
    <div className="flex h-full w-full flex-col bg-white">
      {/* 头部 */}
      <div className="flex h-[56px] items-center justify-between border-b border-[var(--color-border-2)] px-4">
        <h3 className="text-[16px] font-[600] text-[var(--color-text-1)]">
          本体智能助手
        </h3>
        <div className="flex items-center gap-2">
          <Tooltip content="新建会话">
            <div
              className="flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded hover:bg-[#f7f8fa]"
              onClick={onNewSession}
            >
              <IconPlus className="text-[16px] text-[var(--color-text-2)]" />
            </div>
          </Tooltip>
          <Tooltip content="历史会话">
            <div
              className="flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded hover:bg-[#f7f8fa]"
              onClick={onHistoryClick}
            >
              <IconHistory className="text-[16px] text-[var(--color-text-2)]" />
            </div>
          </Tooltip>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Welcome 组件 */}
        <div className="px-4 pt-6">
          <Welcome
            title="你好，我是本体智能助手"
            description="我可以帮助你快速构建和管理本体模型"
          />
        </div>

        {/* Prompts 组件 */}
        <div className="px-4 pt-4">
          <Prompts list={PROMPT_LIST} onSelect={handlePromptSelect} />
        </div>

        {/* 占位区域 */}
        <div className="flex-1" />

        {/* Sender 组件 */}
        <div className="border-t border-[var(--color-border-2)] p-4">
          <Sender
            placeholder="输入消息..."
            onSend={handleSend}
            showDeepThink={false}
            showFileUpload={false}
            showAudioRecord={false}
            showAITips={false}
            GetAudioText={() => Promise.resolve({ data: { content: [] } })}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
