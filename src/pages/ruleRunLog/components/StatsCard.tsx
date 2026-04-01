import React from 'react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon }) => {
  return (
    <div className="flex flex-col gap-[2px] rounded-[8px] bg-[#F7F8FA] p-[24px]">
      <div className="flex items-center gap-[8px] text-[#1D2129]">
        <span className="text-[20px] leading-[20px]">{icon}</span>
        <span className="text-[14px] leading-[22px] text-[#23293B]">
          {title}
        </span>
      </div>
      <div className="text-[24px] font-[500] leading-[36px] text-[#23293B]">
        {value}
      </div>
    </div>
  );
};
