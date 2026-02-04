import { Message, Popover } from '@arco-design/web-react';
import { IconCopy } from '@arco-design/web-react/icon';
import copy from 'copy-to-clipboard';
import React from 'react';

const Node = ({ id, data }) => {
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
          <span className="text-[14px] leading-[22px] text-[var(--color-text-1)]">
            {id}
          </span>
          <Popover content="复制">
            <IconCopy
              fontSize={14}
              className="hidden cursor-pointer hover:text-[#184FF2] group-hover:block"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleCopy(id);
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
