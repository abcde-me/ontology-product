import React, { useState, useMemo, useRef } from 'react';
import { Input, Spin, Empty, Tooltip, Modal } from '@arco-design/web-react';
import { IconSearch, IconEdit, IconDelete } from '@arco-design/web-react/icon';
import { useVirtualList } from 'ahooks';
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

// 虚拟列表项类型
interface VirtualListItem {
  type: 'group-title' | 'conversation';
  key: string;
  data?: Conversation;
  title?: string;
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
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 分组会话：最近7天 + 按月份，并转换为虚拟列表数据
  const virtualListData = useMemo((): VirtualListItem[] => {
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
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
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

    // 转换为虚拟列表数据
    const items: VirtualListItem[] = [];

    // 添加最近7天
    if (recent.length > 0) {
      items.push({
        type: 'group-title',
        key: 'recent-title',
        title: '最近'
      });
      recent.forEach((conv) => {
        items.push({
          type: 'conversation',
          key: conv.id,
          data: conv
        });
      });
    }

    // 添加按月份分组
    Object.keys(byMonth)
      .sort()
      .reverse()
      .forEach((monthKey) => {
        items.push({
          type: 'group-title',
          key: `month-${monthKey}`,
          title: monthKey
        });
        byMonth[monthKey].forEach((conv) => {
          items.push({
            type: 'conversation',
            key: conv.id,
            data: conv
          });
        });
      });

    return items;
  }, [conversations, searchText]);

  // 调试：打印虚拟列表数据
  console.log('虚拟列表数据:', virtualListData);

  // 使用虚拟列表
  const [list] = useVirtualList(virtualListData, {
    containerTarget: containerRef,
    wrapperTarget: wrapperRef,
    itemHeight: (index) => {
      // 根据项类型返回不同的高度
      const item = virtualListData[index];
      if (item.type === 'group-title') {
        return 30; // 分组标题高度
      }
      return 40; // 会话项高度
    },
    overscan: 5
  });

  // 调试：打印虚拟列表渲染项
  console.log('虚拟列表渲染项:', list);

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

  const isEmpty = conversations.length === 0;
  const isSearchEmpty = searchText && virtualListData.length === 0;

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
      <div className={styles.content} ref={containerRef}>
        {loading ? (
          <div className={styles.loading}>
            <Spin />
          </div>
        ) : isEmpty || isSearchEmpty ? (
          <div className={styles.empty}>
            <Empty description="暂无数据" />
          </div>
        ) : (
          <div ref={wrapperRef} className={styles.virtualWrapper}>
            {list.map((item) => {
              const virtualItem = item.data;

              if (virtualItem.type === 'group-title') {
                return (
                  <div key={virtualItem.key} className={styles.groupTitle}>
                    {virtualItem.title}
                  </div>
                );
              }

              // 渲染会话项
              const conv = virtualItem.data!;
              const isEditing = editingId === conv.id;
              const isHovered = hoveredId === conv.id;
              const isActive = activeConversationId === conv.id;

              return (
                <div
                  key={virtualItem.key}
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
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
