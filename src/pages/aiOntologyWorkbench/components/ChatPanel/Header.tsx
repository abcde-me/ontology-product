import React, { useState } from 'react';
import { Tooltip, Dropdown } from '@arco-design/web-react';
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
}

const Header: React.FC<HeaderProps> = ({
  conversations = [],
  activeConversationId,
  conversationsLoading = false,
  onNewSession,
  onSelectConversation,
  onDeleteConversation,
  onRenameConversation
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

  return (
    <div className="flex items-center justify-between px-[20px] py-[12px]">
      <h3 className="text-[16px] font-medium leading-[24px] text-[#0f172a]">
        本体智能助手
      </h3>
      <div className="flex items-center gap-[16px]">
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
