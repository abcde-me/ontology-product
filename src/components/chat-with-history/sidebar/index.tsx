import type { ConversationItem } from '@/utils/type';
import {
  Button,
  Dropdown,
  Input,
  Message,
  Modal,
  Switch
} from '@arco-design/web-react';
import {
  IconBrush,
  IconDelete,
  IconMoreVertical
} from '@arco-design/web-react/icon';
import React, { useCallback, useState } from 'react';
import { useChatWithHistoryContext } from '../context';
import List from './list';
import MessageIcon from '@/assets/message.svg';

const Sidebar = () => {
  const {
    appData,
    pinnedConversationList,
    conversationList,
    handleNewConversation,
    currentConversationId,
    handleChangeConversation,
    handlePinConversation,
    handleUnpinConversation,
    conversationRenaming,
    handleRenameConversation,
    handleDeleteConversation,
    isMobile,
    debugEnabled,
    setDebugEnabled
  } = useChatWithHistoryContext();

  const handleOperate = useCallback(
    (type: string, item: ConversationItem) => {
      if (type === 'pin') handlePinConversation(item.id);

      if (type === 'unpin') handleUnpinConversation(item.id);

      if (type === 'delete') {
        Modal.confirm({
          title: '删除对话',
          content: '确定删除该对话吗？',
          onOk() {
            try {
              return handleDeleteConversation(item.id, {
                onSuccess() {}
              });
            } catch (err) {
              console.error(err?.message);
              Message.error(err?.message);
            }
          }
        });
      }

      if (type === 'rename') {
        let value = '';
        Modal.confirm({
          title: '重命名会话',
          content: <Input onChange={(val) => (value = val)} />,
          onOk() {
            if (!value) {
              Message.warning('不能为空');
              throw Promise.reject('不能为空');
            }
            handleRenameConversation(item.id, value, {
              onSuccess() {}
            });
          }
        });
      }
    },
    [
      handleDeleteConversation,
      handlePinConversation,
      handleRenameConversation,
      handleUnpinConversation
    ]
  );

  const list = (
    <div className="max-h-screen w-[272px] overflow-auto rounded-[8px] bg-white p-[16px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.1)]">
      {/* TODO: 这块没用了要删 */}
      {/* <div className="mb-[5px] flex items-center">
        <Switch
          className=" mr-[5px]"
          checked={debugEnabled}
          onChange={(val) => setDebugEnabled(val)}
        ></Switch>
        开启调试
      </div> */}
      <Button long type="primary" onClick={handleNewConversation}>
        新对话
      </Button>
      {!!pinnedConversationList.length && (
        <div className="mb-4">
          <List
            isPin
            title={'已置顶' || ''}
            list={pinnedConversationList}
            onChangeConversation={handleChangeConversation}
            onOperate={handleOperate}
            currentConversationId={currentConversationId}
          />
        </div>
      )}
      {!!conversationList.length && (
        <List
          title={(pinnedConversationList.length && '对话列表') || ''}
          list={conversationList}
          onChangeConversation={handleChangeConversation}
          onOperate={handleOperate}
          currentConversationId={currentConversationId}
        />
      )}
    </div>
  );

  const more = (
    <div className="rounded-[8px] bg-white shadow-[0px_2px_8px_0px_rgba(0,0,0,0.1)]">
      {[
        { icon: IconBrush, label: '清除上下文' },
        { icon: IconDelete, label: '删除对话记录' }
      ].map((item, index) => {
        return (
          <div
            key={index}
            className="flex h-[35px] cursor-pointer items-center border border-b-[var(--color-border-2)] px-[12px] text-[var(--color-text-2)] last-of-type:border-none hover:text-[rgb(var(--link-6))]"
          >
            <item.icon className="mr-[4px] text-[16px]" />
            <span>{item.label}</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="absolute right-[24px] top-[24px] flex flex-nowrap">
      <Dropdown droplist={list} position="br">
        <div className="group mr-[8px] flex size-[32px] cursor-pointer items-center justify-center rounded-full bg-white last-of-type:mr-0 hover:bg-[rgb(var(--primary-1))]">
          <MessageIcon className="text-[16px] text-[var(--color-text-3)] group-hover:text-[rgb(var(--primary-6))]" />
        </div>
      </Dropdown>
      {/* <Dropdown droplist={more} position="br">
        <div className="group mr-[8px] flex size-[32px] cursor-pointer items-center justify-center rounded-full bg-white last-of-type:mr-0 hover:bg-[rgb(var(--primary-1))]">
          <IconMoreVertical className="text-[16px] text-[var(--color-text-3)] group-hover:text-[rgb(var(--primary-6))]" />
        </div>
      </Dropdown> */}
    </div>
  );
};

export default Sidebar;
