import React from 'react';
import type { FC } from 'react';
import { memo } from 'react';
import type { ChatItem } from '@/utils/type';
import { formatNumber } from '@/utils/format';

type MoreProps = {
  more: ChatItem['more'];
};
const More: FC<MoreProps> = ({ more }) => {
  return (
    <div className="mt-1 flex h-[18px] items-center text-xs text-gray-400 opacity-0 group-hover:opacity-100">
      {more && (
        <>
          <div
            className="max-w-[33.3%] shrink-0 truncate"
            title={`Token数量 ${formatNumber(more.tokens)}`}
          >
            {`Token数量 ${formatNumber(more.tokens)}`}
          </div>
          <div className="mx-2 shrink-0">·</div>
          <div
            className="mr-2 max-w-[33.3%] shrink-0 truncate"
            title={`耗时 ${more.latency} 秒`}
          >
            {`耗时 ${more.latency} 秒`}
          </div>
          <div className="mx-2 shrink-0">·</div>
          <div className="max-w-[33.3%] shrink-0 truncate" title={more.time}>
            {more.time}
          </div>
        </>
      )}
    </div>
  );
};

export default memo(More);
