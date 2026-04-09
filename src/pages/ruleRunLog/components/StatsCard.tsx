import React from 'react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: string | React.ComponentType<React.SVGAttributes<SVGElement>>;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon }) => {
  return (
    <div className="flex items-center gap-[12px] rounded-[8px] border border-[#EBEEF5] bg-[#F7F9FF] p-[20px]">
      <div className="flex h-[48px] w-[48px] items-center justify-center">
        {typeof icon === 'string' ? (
          <img
            src={icon}
            alt={title}
            className="h-[48px] w-[48px] object-contain"
          />
        ) : (
          React.createElement(icon, { className: 'h-[48px] w-[48px]' })
        )}
      </div>
      <div className="flex flex-col">
        <div className="text-[14px] leading-[22px] text-[var(--color-text-2)]">
          {title}
        </div>
        <div className="font-DINAlternate text-[24px] font-[700] leading-[28px] text-[var(--color-text-2)]">
          {value}
        </div>
      </div>
    </div>
  );
};
