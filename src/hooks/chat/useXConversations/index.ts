/**
 * useXConversations - 会话管理 Hook（通用版本）
 *
 * 通过依赖注入实现通用化，可以抽离到 hooks 库
 */

import { useState, useCallback } from 'react';
import {
  Conversation,
  UseConversationsConfig,
  UseConversationsReturn
} from '../types';
import { generateId } from '../utils';

export const useXConversations = (
  config: UseConversationsConfig
): UseConversationsReturn => {
  const {
    defaultConversations = [],
    defaultActiveConversationId,
    apiConfig,
    showMessage
  } = config;

  // ==================== State ====================
  const [conversations, setConversations] =
    useState<Conversation[]>(defaultConversations);
  const [activeConversationId, setActiveConversationId] = useState<
    string | undefined | null
  >(defaultActiveConversationId ?? null); // null = 未初始化, undefined = 新建会话, string = 已有会话
  const [loading, setLoading] = useState(false);

  // ==================== 加载会话列表 ====================
  const loadConversations = useCallback(
    async (appId: string, projectId?: string) => {
      setLoading(true);
      try {
        const response = await apiConfig.getConversationList({
          appId,
          projectId,
          pageNo: 1,
          pageSize: 100 // 加载更多会话
        });

        console.log('[useXConversations] 会话列表响应:', response);

        if (response?.data?.result) {
          const list = response.data.result.map((item: any) => ({
            id: item.id,
            title: item.name || '未命名会话',
            createdAt: new Date(item.createdAt).getTime(),
            updatedAt: new Date(item.updatedAt).getTime(),
            messageCount: 0, // 接口没有返回消息数量
            lastMessage: item.description
          }));
          setConversations(list);
          console.log('[useXConversations] 解析后的会话列表:', list);
        }
      } catch (error: any) {
        console.error('[useXConversations] 加载会话列表失败:', error);
        showMessage?.error(error.message || '加载会话列表失败');
      } finally {
        setLoading(false);
      }
    },
    [apiConfig, showMessage]
  );

  // ==================== 设置活跃会话 ====================
  const setActiveConversation = useCallback((id: string | undefined | null) => {
    setActiveConversationId(id);
  }, []);

  // ==================== 创建会话 ====================
  const createConversation = useCallback(
    (title?: string): Conversation => {
      const newConversation: Conversation = {
        id: generateId(),
        title: title || `新会话 ${conversations.length + 1}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messageCount: 0
      };

      setConversations((prev) => [newConversation, ...prev]);
      setActiveConversationId(newConversation.id);

      return newConversation;
    },
    [conversations.length]
  );

  // ==================== 删除会话 ====================
  const deleteConversation = useCallback(
    async (id: string, _projectId?: string) => {
      try {
        // 调用删除 API
        await apiConfig.deleteConversation({ id });

        const isCurrentConversation = activeConversationId === id;

        setConversations((prev) => {
          const filtered = prev.filter((conv) => conv.id !== id);

          // 如果删除的是当前活跃会话，清空活跃会话 ID
          if (isCurrentConversation) {
            setActiveConversationId(undefined); // undefined 表示新建会话
          } else if (filtered.length === 0) {
            setActiveConversationId(undefined);
          }

          return filtered;
        });

        showMessage?.success('删除成功');

        // 返回是否删除的是当前会话
        return isCurrentConversation;
      } catch (error: any) {
        console.error('[useXConversations] 删除会话失败:', error);
        showMessage?.error(error.message || '删除失败');
        return false;
      }
    },
    [activeConversationId, apiConfig, showMessage]
  );

  // ==================== 更新会话 ====================
  const updateConversation = useCallback(
    async (id: string, updates: Partial<Conversation>, _projectId?: string) => {
      try {
        // 如果更新标题，调用重命名 API
        if (updates.title) {
          await apiConfig.renameConversation({
            id,
            name: updates.title
          });
        }

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === id
              ? { ...conv, ...updates, updatedAt: Date.now() }
              : conv
          )
        );

        if (updates.title) {
          showMessage?.success('重命名成功');
        }
      } catch (error: any) {
        console.error('[useXConversations] 更新会话失败:', error);
        showMessage?.error(error.message || '更新失败');
      }
    },
    [apiConfig, showMessage]
  );

  // ==================== 获取会话 ====================
  const getConversation = useCallback(
    (id: string): Conversation | undefined => {
      return conversations.find((conv) => conv.id === id);
    },
    [conversations]
  );

  return {
    conversations,
    activeConversationId,
    loading,
    setActiveConversation,
    createConversation,
    deleteConversation,
    updateConversation,
    getConversation,
    loadConversations
  };
};
