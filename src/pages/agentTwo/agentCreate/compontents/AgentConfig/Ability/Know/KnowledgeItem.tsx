import React, { useState } from 'react';
import { Tooltip } from '@arco-design/web-react';
import KnowIcon from '@/assets/know.svg';
import SuccessIcon from '@/assets/success.svg';
import RemoveIcon from '@/assets/remove.svg';

interface KnowledgeItemProps {
  text: string;
  onRemove?: () => void;
  onClickConfig?: () => void;
}

const KnowledgeItem: React.FC<KnowledgeItemProps> = ({
  text,
  onRemove,
  onClickConfig
}) => {
  const [hover, setHover] = useState(false);

  return (
    <div
      className={`mb-1 flex w-full items-center rounded-2xl border border-gray-200 p-1 transition-colors ${
        hover ? 'bg-gray-50' : 'bg-white'
      }`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* 左侧图标 */}
      <div className="ml-2 mr-2 flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100">
        <KnowIcon />
      </div>
      {/* 文字 */}
      <span className="flex-1 text-gray-800">{text}</span>
      {/* 右侧icon */}
      <div className="relative ml-2 mr-2 flex items-center">
        {!hover ? (
          <SuccessIcon />
        ) : (
          <>
           
            <Tooltip content="移除">
              <div
                className="cursor-pointer items-center justify-center transition hover:text-blue-700 "
                onClick={onRemove}
              >
                <RemoveIcon />
              </div>
            </Tooltip>
          </>
        )}
      </div>
    </div>
  );
};

export default KnowledgeItem;
