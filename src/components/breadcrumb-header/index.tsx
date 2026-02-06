import React from 'react';
import { Breadcrumb, Tooltip } from '@arco-design/web-react';
import type { BreadcrumbProps } from '@arco-design/web-react';
import { LeftArrow, Separator } from '@/assets';
import { useHistory } from 'react-router-dom';

interface BreadCrumbHeaderProps {
  list: { name: string; href?: string }[];
  /**
   * 面包屑组件的 props
   */
  breadcrumbProps?: Omit<BreadcrumbProps, 'children'>;
  /**
   * 左箭头点击事件
   */
  onArrowClick?: () => void;
  /**
   * 额外内容，显示在面包屑后面
   */
  extra?: React.ReactNode;
  /**
   * 是否显示左箭头
   */
  showArrow?: boolean;
  className?: string;
}

const BreadCrumbHeader: React.FC<BreadCrumbHeaderProps> = ({
  list,
  breadcrumbProps,
  onArrowClick,
  extra,
  showArrow = true,
  className = ''
}) => {
  const history = useHistory();

  return (
    <div className={`flex items-center overflow-hidden ${className}`}>
      {/* 左箭头 - 固定不收缩 */}
      {showArrow && (
        <LeftArrow
          className="mr-[21px] flex-shrink-0 cursor-pointer text-base"
          onClick={onArrowClick}
        />
      )}

      {/* 面包屑部分 - 允许收缩但不超出容器 */}
      <div className="min-w-0 flex-1 overflow-hidden">
        <Breadcrumb
          separator={<Separator className="flex-shrink-0" />}
          className="flex h-full items-center text-xl"
          {...breadcrumbProps}
        >
          {list.map((item, index: number) => {
            const isLast = index === list.length - 1;

            return (
              <Breadcrumb.Item
                key={index}
                className={
                  item.href
                    ? 'cursor-pointer hover:text-[#438DFB] active:text-[#2563EB]'
                    : ''
                }
                style={isLast ? { minWidth: 0, flex: 1 } : undefined}
                onClick={() => {
                  if (item.href) history.push(item.href);
                }}
              >
                {isLast ? (
                  <Tooltip content={item.name} position="bottom">
                    <span
                      className="inline-block w-full overflow-hidden text-ellipsis whitespace-nowrap"
                      style={{ verticalAlign: 'bottom' }}
                    >
                      {item.name}
                    </span>
                  </Tooltip>
                ) : (
                  <span className="flex-shrink-0">{item.name}</span>
                )}
              </Breadcrumb.Item>
            );
          })}
        </Breadcrumb>
      </div>

      {/* 额外内容 */}
      {extra && <div className="ml-4 flex-shrink-0">{extra}</div>}
    </div>
  );
};

export default BreadCrumbHeader;
