import React, { useState } from 'react';
import { Tooltip, Dropdown, Menu } from '@arco-design/web-react';
import { GlobalTooltip } from '@ceai-front/arco-material';
import { IconSettings } from '@arco-design/web-react/icon';
import PlusIcon from '../../assets/plus.svg';
import ConversationsIcon from '../../assets/conversations.svg';
import ConversationList from './ConversationList';
import { Conversation } from '@/hooks/chat/types';

interface HeaderProps {
  conversations?: Conversation[];
  activeConversationId?: string | null; // null = 未初始化, undefined = 新建会话, string = 已有会话
  conversationsLoading?: boolean;
  onNewSession?: () => void;
  onSelectConversation?: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
  onRenameConversation?: (id: string, newTitle: string) => void;
  onOpenSystemPromptSettings?: () => void;
  onOpenPluginSettings?: () => void;
  onOpenSecuritySettings?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  conversations = [],
  activeConversationId,
  conversationsLoading = false,
  onNewSession,
  onSelectConversation,
  onDeleteConversation,
  onRenameConversation,
  onOpenSystemPromptSettings,
  onOpenPluginSettings,
  onOpenSecuritySettings
}) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const handleSelectConversation = (id: string) => {
    onSelectConversation?.(id);
    setDropdownVisible(false);
  };

  const droplist = (
    <ConversationList
      conversations={conversations}
      activeConversationId={activeConversationId}
      loading={conversationsLoading}
      onSelect={handleSelectConversation}
      onDelete={(id) => onDeleteConversation?.(id)}
      onRename={(id, title) => onRenameConversation?.(id, title)}
    />
  );

  const settingsMenu = (
    <Menu
      onClickMenuItem={(key) => {
        if (key === 'systemPrompt') {
          onOpenSystemPromptSettings?.();
        }
        if (key === 'plugin') {
          onOpenPluginSettings?.();
        }
        if (key === 'security') {
          onOpenSecuritySettings?.();
        }
      }}
    >
      <Menu.Item key="systemPrompt">系统提示词设置</Menu.Item>
      <Menu.Item key="plugin">插件配置</Menu.Item>
      <Menu.Item key="security">安全防护设置</Menu.Item>
    </Menu>
  );

  return (
    <div className="flex items-center justify-between px-[20px] py-[12px]">
      <div className="min-w-0 flex-1 pr-[12px]">
        <GlobalTooltip.Ellipsis text="本体智能助手">
          <h3 className="text-[16px] font-medium leading-[24px] text-[#0f172a]">
            本体智能助手
          </h3>
        </GlobalTooltip.Ellipsis>
      </div>
      <div className="flex flex-shrink-0 items-center gap-[16px]">
        <Dropdown droplist={settingsMenu} trigger="click" position="br">
          <Tooltip content="助手配置">
            <div className="flex size-[16px] cursor-pointer items-center justify-center text-[#64748b] hover:text-[#184ff2]">
              <IconSettings className="size-[16px]" />
            </div>
          </Tooltip>
        </Dropdown>
        <Tooltip content="新建会话">
          <div
            className="flex size-[16px] cursor-pointer items-center justify-center"
            onClick={onNewSession}
          >
            <PlusIcon className="size-[16px]" />
          </div>
        </Tooltip>
        <Dropdown
          droplist={droplist}
          trigger="click"
          position="br"
          popupVisible={dropdownVisible}
          onVisibleChange={setDropdownVisible}
        >
          <Tooltip content="历史会话">
            <div className="flex size-[16px] cursor-pointer items-center justify-center">
              <ConversationsIcon className="size-[16px]" />
            </div>
          </Tooltip>
        </Dropdown>
      </div>
    </div>
  );
};

export default Header;
