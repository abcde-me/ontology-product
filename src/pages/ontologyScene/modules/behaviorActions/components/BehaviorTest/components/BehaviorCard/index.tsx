import React from 'react';
import { Tooltip } from '@arco-design/web-react';
import { IconInfoCircle } from '@arco-design/web-react/icon';
import { ObjectTypeTag } from '../ObjectTypeTag';
import { BehaviorItem } from '../../types';

interface BehaviorCardProps {
  behavior: BehaviorItem;
  onClick: (behavior: BehaviorItem) => void;
  onViewDetail: (behavior: BehaviorItem) => void;
}

export const BehaviorCard: React.FC<BehaviorCardProps> = ({
  behavior,
  onClick,
  onViewDetail
}) => {
  const handleClick = () => {
    onClick(behavior);
  };

  const handleDetailClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetail(behavior);
  };

  return (
    <div
      className="relative flex cursor-pointer overflow-hidden rounded-lg border border-[#e5e6eb] bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-[#d4d8dd] hover:shadow-md active:translate-y-0"
      onClick={handleClick}
    >
      {/* 左侧彩色边框 */}
      <div
        className="w-1 flex-shrink-0"
        style={{ backgroundColor: behavior.color || '#722ED1' }}
      />

      {/* 卡片内容 */}
      <div className="flex min-w-0 flex-1 flex-col gap-2 p-3">
        {/* 头部 */}
        <div className="flex items-center justify-between gap-2">
          {/*@ts-ignore*/}
          <Tooltip content={behavior.name}>
            <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium text-[#1d2129]">
              {behavior.name}
            </div>
          </Tooltip>
          <Tooltip content="查看详情">
            <IconInfoCircle
              className="flex-shrink-0 cursor-pointer text-base text-[#86909c] transition-colors duration-200 hover:text-[#4e5969]"
              onClick={handleDetailClick}
            />
          </Tooltip>
        </div>

        {/* 描述 */}
        <Tooltip content={behavior.description}>
          <div className="line-clamp-2 text-[13px] leading-relaxed text-[#86909c]">
            {behavior.description}
          </div>
        </Tooltip>

        {/* 底部标签 */}
        <div className="flex flex-wrap items-center gap-2">
          {/*@ts-ignore*/}
          <ObjectTypeTag type={behavior.objectTypeName!} />
        </div>
      </div>
    </div>
  );
};
