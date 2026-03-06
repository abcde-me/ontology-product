import React, { useState } from 'react';
import { Tooltip } from '@arco-design/web-react';
import { OBJECT_TYPE_ICON_OPTIONS } from '@/pages/ontologyScene/common/constants';
import { BehaviorItem } from '../../types';
import EllipsisTextWithTooltip from '@/pages/ontologyScene/modules/behaviorLog/components/EllipsisTextWithTooltip';

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
  const [isHovered, setIsHovered] = useState(false);
  const [isDetailHovered, setIsDetailHovered] = useState(false);
  const nameRef = React.useRef<HTMLDivElement>(null);
  const [showNameTooltip, setShowNameTooltip] = useState(false);

  // 检测名称文本是否被截断
  React.useEffect(() => {
    if (nameRef.current) {
      setShowNameTooltip(
        nameRef.current.scrollWidth > nameRef.current.clientWidth
      );
    }
  }, [behavior.name]);

  const handleClick = () => {
    onClick(behavior);
  };

  const handleDetailClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetail(behavior);
  };

  // 根据 icon 字段匹配对应的图标
  const objectTypeIcon =
    behavior.ontologyObjectTypeIcon || behavior.objectTypeIcon;
  const iconOption = objectTypeIcon
    ? OBJECT_TYPE_ICON_OPTIONS.find((option) => option.value === objectTypeIcon)
    : null;
  const IconComponent = iconOption?.icon ?? OBJECT_TYPE_ICON_OPTIONS[0].icon;

  // 截断行为名称到50个字符
  const truncatedName =
    behavior.name && behavior.name.length > 50
      ? behavior.name.substring(0, 50) + '...'
      : behavior.name;

  return (
    <div
      className="relative flex cursor-pointer overflow-hidden rounded-lg border border-[#DFE2EB] bg-[#FAFBFF] px-4 py-3 transition-all duration-200 hover:border-[#d4d8dd]"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 卡片内容 */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* 行为名称 + 详情图标 */}
        <div className="flex items-center gap-1">
          <Tooltip
            content={
              <div className="max-w-[400px] break-words">{behavior.name}</div>
            }
            disabled={!showNameTooltip}
          >
            <div
              ref={nameRef}
              className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold text-[#0F172A]"
            >
              {truncatedName}
            </div>
          </Tooltip>
          {isHovered && (
            <Tooltip content="详情">
              <div
                className="flex-shrink-0"
                onClick={handleDetailClick}
                onMouseEnter={() => setIsDetailHovered(true)}
                onMouseLeave={() => setIsDetailHovered(false)}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 cursor-pointer transition-all duration-200"
                >
                  <path
                    d="M12.667 1.33398C13.4031 1.33416 13.9998 1.93087 14 2.66699V13.334C14 14.0703 13.4032 14.6668 12.667 14.667H3.33301C2.59678 14.6668 2 14.0703 2 13.334V2.66699C2.00018 1.93087 2.59689 1.33416 3.33301 1.33398H12.667ZM3.33301 13.334H12.667V2.66699H3.33301V13.334ZM10.333 10.001V11.334H5.33301V10.001H10.333ZM9 8.66699H5.33301V7.33398H9V8.66699ZM10.333 6.00098H5.33301V4.66699H10.333V6.00098Z"
                    fill={isDetailHovered ? '#165DFF' : '#23293B'}
                    className="transition-colors duration-200"
                  />
                </svg>
              </div>
            </Tooltip>
          )}
        </div>

        {/* 描述说明 */}
        <div className="mt-2 flex items-center gap-2">
          <span className="flex-shrink-0 text-[12px] font-normal text-[#86909c]">
            描述说明：
          </span>
          {behavior.description ? (
            <div className="min-w-0 flex-1">
              <EllipsisTextWithTooltip
                className="text-[13px] font-normal leading-relaxed text-[#0F131F]"
                value={behavior.description}
              />
            </div>
          ) : (
            <span className="text-[13px] font-normal text-[#86909c]">--</span>
          )}
        </div>

        {/* 对象类型 */}
        <div className="mt-1 flex items-center gap-2">
          <span className="flex-shrink-0 text-[12px] font-normal text-[#86909c]">
            对象类型：
          </span>
          {behavior.ontologyObjectTypeName ||
          behavior.objectTypeName ||
          behavior.objectType ? (
            <div className="flex flex-1 items-center gap-1 overflow-hidden">
              <div className="flex h-[12px] w-[12px] flex-shrink-0 items-center justify-center">
                <IconComponent className="h-full w-full text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <EllipsisTextWithTooltip
                  className="text-[13px] font-normal text-[#0F131F]"
                  value={
                    behavior.ontologyObjectTypeName ||
                    behavior.objectTypeName ||
                    behavior.objectType ||
                    ''
                  }
                />
              </div>
            </div>
          ) : (
            <span className="text-[13px] font-normal text-[#86909c]">--</span>
          )}
        </div>
      </div>
    </div>
  );
};
