import { Message, Popover } from '@arco-design/web-react';
import { IconCopy } from '@arco-design/web-react/icon';
import { EllipsisPopover } from '@ceai-front/arco-material';
import copy from 'copy-to-clipboard';
import React, { useState } from 'react';
import { OBJECT_TYPE_ICON_OPTIONS } from '@/pages/ontologyScene/common/constants';
import IconLink from '../../../../assets/graph-link-icon.svg';
import { Button } from '@arco-design/web-react';
import { useHistory, useParams } from 'react-router-dom';

const Node = ({ id, data }) => {
  const [isHovered, setIsHovered] = useState(false);
  const history = useHistory();
  const { id: OSId } = useParams<{ id: string }>();

  // 如果是空态节点，渲染空态样式
  if (data?.isEmptyState) {
    if (data?.isLinkNode) {
      // 链接节点样式
      return (
        <div className="px-[16px] pb-[16px]">
          <div className="flex items-center gap-[8px] rounded-lg border border-[#E5E7EB] bg-[#F5F3FF] px-[12px] py-[8px] shadow-sm">
            <svg
              className="h-[24px] w-[24px] flex-shrink-0 text-[#A78BFA]"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.06 10.94a2.5 2.5 0 0 1 0 3.54l-3.54 3.54a2.5 2.5 0 0 1-3.54 0 2.5 2.5 0 0 1 0-3.54l.71-.71a1 1 0 0 0-1.41-1.41l-.71.71a4.5 4.5 0 0 0 6.36 6.36l3.54-3.54a4.5 4.5 0 0 0 0-6.36l-.71-.71a1 1 0 0 0-1.41 1.41l.71.71zM10.94 13.06a2.5 2.5 0 0 1 0-3.54l3.54-3.54a2.5 2.5 0 0 1 3.54 0 2.5 2.5 0 0 1 0 3.54l-.71.71a1 1 0 1 0 1.41 1.41l.71-.71a4.5 4.5 0 0 0-6.36-6.36l-3.54 3.54a4.5 4.5 0 0 0 0 6.36l.71.71a1 1 0 0 0 1.41-1.41l-.71-.71z"
                fill="currentColor"
              />
            </svg>
            <span className="text-[14px] font-medium text-[#23293B]">
              链接示意
            </span>
          </div>
        </div>
      );
    } else {
      // 对象节点样式
      const iconItem =
        OBJECT_TYPE_ICON_OPTIONS.find((option) => option.value === data.icon) ||
        OBJECT_TYPE_ICON_OPTIONS[0];
      const IconComponent = iconItem?.icon;

      return (
        <div
          className="px-[16px] pb-[16px]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative">
            <div className="flex items-center gap-[8px] rounded-lg border border-[#E5E7EB] bg-[#F0F4FF] px-[12px] py-[8px] shadow-sm transition-shadow hover:shadow-md">
              <IconComponent className="h-[24px] w-[24px] flex-shrink-0" />
              <span className="text-[14px] font-medium text-[#23293B]">
                对象示意
              </span>
              <div className="ml-auto">
                <IconLink className="h-[16px] w-[16px] flex-shrink-0 text-[#94A3B8]" />
              </div>
            </div>

            {/* Hover 时显示的对象类型定义框 */}
            {isHovered && (
              <div className="absolute left-0 top-0 z-50 w-[280px] -translate-x-[20px] -translate-y-full rounded-lg border border-[#E5E7EB] bg-white p-[16px] shadow-lg">
                <div className="mb-[8px] text-[16px] font-semibold text-[#23293B]">
                  对象类型
                </div>
                <div className="mb-[12px] text-[12px] leading-[20px] text-[#86909C]">
                  核心数据模型的原子单位, 描述系统中可独立存在的实体。
                </div>
                <Button
                  type="primary"
                  size="small"
                  className="w-full"
                  onClick={() => {
                    if (OSId) {
                      history.push(
                        `/tenant/compute/modaforge/ontologyScene/detail/${OSId}/objectType/create`
                      );
                    }
                  }}
                >
                  去创建
                </Button>
              </div>
            )}
          </div>
        </div>
      );
    }
  }

  // 原有的节点渲染逻辑
  // 获取属性列表，如果data中有attributes则使用，否则根据propertyCount生成mock数据
  const attributes = data.attributes || [];

  // 默认显示前2个属性
  const visibleAttributes = attributes.slice(0, 2);
  const remainingCount = attributes.length - 2;
  const remainingAttributes = attributes.slice(2);

  const handleCopy = (value: string) => {
    const isCopySuccess = copy(value);

    if (isCopySuccess) {
      Message.success('复制成功');
    } else {
      Message.error('复制失败');
    }
  };

  return (
    <div className="px-[16px] pb-[16px]">
      <div className="flex flex-col gap-[8px]">
        <div className="flex items-center gap-[6px]">
          <span className="w-[30px] text-[12px] leading-[22px] text-[var(--color-text-4)]">
            id:
          </span>
          <EllipsisPopover
            value={data.code}
            wrapperClassName="min-w-0"
            className="text-[14px] leading-[22px] text-[var(--color-text-1)]"
          ></EllipsisPopover>
          <Popover content="复制">
            <IconCopy
              fontSize={14}
              className="hidden flex-shrink-0 cursor-pointer hover:text-[#184FF2] group-hover:block"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleCopy(data.code);
              }}
            />
          </Popover>
        </div>
        <div className="flex items-center gap-[6px]">
          <span className="w-[30px] text-[12px] leading-[22px] text-[var(--color-text-4)]">
            属性:
          </span>
          <div className="flex flex-wrap items-center gap-[4px]">
            {visibleAttributes.map((attr, index) => (
              <span
                key={attr.id}
                className="rounded-[4px] border border-[var(--color-border-2)] px-[4px] text-[12px] text-[var(--color-text-1)]"
              >
                {attr.name}
              </span>
            ))}
            {remainingCount > 0 && (
              <Popover
                content={
                  <div className="flex flex-nowrap items-center gap-[8px]">
                    {remainingAttributes.map((attr, index) => (
                      <span
                        key={attr.id}
                        className="rounded-[4px] border border-[var(--color-border-2)] px-[4px] text-[12px] text-[var(--color-text-1)]"
                      >
                        {attr.name}
                      </span>
                    ))}
                  </div>
                }
                position="top"
              >
                <span className="cursor-pointer rounded-[4px] border border-[var(--color-border-2)] px-[4px] text-[12px] text-[var(--color-text-1)]">
                  +{remainingCount}
                </span>
              </Popover>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Node);
