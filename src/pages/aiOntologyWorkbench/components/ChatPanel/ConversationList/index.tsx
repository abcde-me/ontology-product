import React, { useState, useMemo } from 'react';
import { Input, Spin, Empty, Tooltip, Modal } from '@arco-design/web-react';
import { IconSearch, IconEdit, IconDelete } from '@arco-design/web-react/icon';
import { Conversation } from '@/hooks/chat/types';
import styles from './ConversationList.module.scss';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId?: string | null; // null = 未初始化, undefined = 新建会话, string = 已有会话
  loading?: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
}

interface GroupedConversations {
  recent: Conversation[];
  byMonth: Record<string, Conversation[]>;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  loading,
  onSelect,
  onDelete,
  onRename
}) => {
  const [searchText, setSearchText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // 分组会话：最近7天 + 按月份
  const groupedConversations = useMemo((): GroupedConversations => {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    const filtered = conversations.filter((conv) =>
      conv.title.toLowerCase().includes(searchText.toLowerCase())
    );

    const recent: Conversation[] = [];
    const byMonth: Record<string, Conversation[]> = {};

    filtered.forEach((conv) => {
      if (conv.updatedAt >= sevenDaysAgo) {
        recent.push(conv);
      } else {
        const date = new Date(conv.updatedAt);
        const monthKey = `${date.getFullYear()} ${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!byMonth[monthKey]) {
          byMonth[monthKey] = [];
        }
        byMonth[monthKey].push(conv);
      }
    });

    // 排序
    recent.sort((a, b) => b.updatedAt - a.updatedAt);
    Object.keys(byMonth).forEach((key) => {
      byMonth[key].sort((a, b) => b.updatedAt - a.updatedAt);
    });

    return { recent, byMonth };
  }, [conversations, searchText]);

  const handleStartEdit = (conv: Conversation) => {
    setEditingId(conv.id);
    setEditingTitle(conv.title);
  };

  const handleSaveEdit = () => {
    if (editingId && editingTitle.trim()) {
      onRename(editingId, editingTitle.trim());
    }
    setEditingId(null);
    setEditingTitle('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const handleDeleteClick = (conv: Conversation) => {
    Modal.confirm({
      title: '确定删除吗？',
      content: '删除后不可继续该会话且不可恢复，请问是否继续？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        onDelete(conv.id);
      }
    });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month}-${day} ${hours}:${minutes}`;
  };

  const renderConversationItem = (conv: Conversation) => {
    const isEditing = editingId === conv.id;
    const isHovered = hoveredId === conv.id;
    const isActive = activeConversationId === conv.id;

    return (
      <div
        key={conv.id}
        className={`${styles.conversationItem} ${isActive ? styles.active : ''}`}
        onMouseEnter={() => setHoveredId(conv.id)}
        onMouseLeave={() => setHoveredId(null)}
        onClick={() => !isEditing && onSelect(conv.id)}
      >
        {isEditing ? (
          <Input
            value={editingTitle}
            onChange={setEditingTitle}
            onPressEnter={handleSaveEdit}
            onBlur={handleSaveEdit}
            autoFocus
            className={styles.editInput}
          />
        ) : (
          <>
            <div className={styles.conversationContent}>
              <Tooltip content={conv.title}>
                <span className={styles.title}>{conv.title}</span>
              </Tooltip>
              {!isHovered && (
                <span className={styles.time}>
                  {formatTime(conv.updatedAt)}
                </span>
              )}
            </div>
            {isHovered && (
              <div className={styles.actions}>
                <IconEdit
                  className={styles.actionIcon}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartEdit(conv);
                  }}
                />
                <IconDelete
                  className={styles.actionIcon}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(conv);
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const isEmpty = conversations.length === 0;
  const isSearchEmpty =
    searchText &&
    groupedConversations.recent.length === 0 &&
    Object.keys(groupedConversations.byMonth).length === 0;

  return (
    <div className={styles.conversationList}>
      {/* 搜索框 */}
      <div className={styles.searchBox}>
        <Input
          placeholder="输入搜索对话"
          value={searchText}
          onChange={setSearchText}
          suffix={<IconSearch />}
          className={styles.searchInput}
        />
      </div>

      {/* 内容区域 */}
      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>
            <Spin />
          </div>
        ) : isEmpty || isSearchEmpty ? (
          <div className={styles.empty}>
            <Empty description="暂无数据" />
          </div>
        ) : (
          <>
            {/* 最近7天 */}
            {groupedConversations.recent.length > 0 && (
              <div className={styles.group}>
                <div className={styles.groupTitle}>最近</div>
                <div className={styles.groupContent}>
                  {groupedConversations.recent.map(renderConversationItem)}
                </div>
              </div>
            )}

            {/* 按月份分组 */}
            {Object.keys(groupedConversations.byMonth)
              .sort()
              .reverse()
              .map((monthKey) => (
                <div key={monthKey} className={styles.group}>
                  <div className={styles.groupTitle}>{monthKey}</div>
                  <div className={styles.groupContent}>
                    {groupedConversations.byMonth[monthKey].map(
                      renderConversationItem
                    )}
                  </div>
                </div>
              ))}
          </>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
