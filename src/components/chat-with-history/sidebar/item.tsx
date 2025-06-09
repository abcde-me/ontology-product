import React from 'react';
import type { FC } from 'react';
import { memo, useRef } from 'react';
import { useHover } from 'ahooks';
import type { ConversationItem } from '@/utils/type';
import { IconDelete, IconEdit } from '@arco-design/web-react/icon';
import { Tooltip } from '@arco-design/web-react';

type ItemProps = {
  isPin?: boolean;
  item: ConversationItem;
  onOperate: (type: string, item: ConversationItem) => void;
  onChangeConversation: (conversationId: string) => void;
  currentConversationId: string;
};
const Item: FC<ItemProps> = ({
  isPin,
  item,
  onOperate,
  onChangeConversation,
  currentConversationId
}) => {
  const ref = useRef(null);
  const isHovering = useHover(ref);

  return (
    <div
      ref={ref}
      key={item.id}
      className={`
       b  mt-[8px] flex h-[32px] cursor-pointer items-center rounded-[4px] border  border-[var(--color-border-1)] px-[16px]  hover:border-[rgb(var(--primary-4))]
        ${currentConversationId == item.id ? 'border-[rgb(var(--primary-4))] bg-[rgb(var(--primary-2))]' : ''}
      `}
      onClick={() => onChangeConversation(item.id)}
    >
      <div
        className="mr-auto overflow-hidden text-ellipsis whitespace-nowrap font-[600] text-[var(--color-text-2)]"
        title={item.name}
      >
        {item.name}
      </div>
      {item.id ? (
        <Tooltip content="重命名">
          <IconEdit
            onClick={(evt) => {
              evt.stopPropagation();
              onOperate('rename', item);
            }}
            className="mr-[8px] cursor-pointer text-[16px] text-[var(--color-text-3)] hover:text-[rgb(var(--link-6))]"
          />
        </Tooltip>
      ) : null}
      {item.id ? (
        <Tooltip content="删除">
          <IconDelete
            onClick={(evt) => {
              evt.stopPropagation();
              onOperate('delete', item);
            }}
            className="cursor-pointer text-[16px] text-[var(--text-3)] hover:text-[rgb(var(--link-6))]"
          />
        </Tooltip>
      ) : null}
    </div>
  );
};

export default memo(Item);
