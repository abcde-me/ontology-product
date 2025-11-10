import React from 'react';
import { Breadcrumb } from '@arco-design/web-react';
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
    <div className={`flex items-center ${className}`}>
      {/* 左箭头 */}
      {showArrow && (
        <LeftArrow
          className="mr-[21px] cursor-pointer text-base"
          onClick={onArrowClick}
        />
      )}

      {/* 面包屑部分 */}
      <div className="shrink-0">
        <Breadcrumb
          separator={<Separator />}
          className="flex h-full items-center text-xl"
          {...breadcrumbProps}
        >
          {list.map((item, index: number) => {
            return (
              <Breadcrumb.Item
                key={index}
                className={
                  item.href
                    ? 'cursor-pointer hover:text-[#438DFB] active:text-[#2563EB]'
                    : ''
                }
                onClick={() => {
                  if (item.href) history.push(item.href);
                }}
              >
                {item.name}
              </Breadcrumb.Item>
            );
          })}
        </Breadcrumb>
      </div>

      {/* 额外内容 */}
      {extra}
    </div>
  );
};

export default BreadCrumbHeader;
