import React from 'react';

interface TestLayoutProps {
  leftPanel: React.ReactNode;
  middlePanel: React.ReactNode;
  rightPanel: React.ReactNode;
}

export const TestLayout: React.FC<TestLayoutProps> = ({
  leftPanel,
  middlePanel,
  rightPanel
}) => {
  return (
    <div className="grid h-full w-full grid-cols-[280px_1fr_400px] gap-0 overflow-hidden">
      <div className="flex flex-col overflow-hidden border-r border-[#e5e6eb] bg-white">
        {leftPanel}
      </div>
      <div className="flex flex-col overflow-hidden">{middlePanel}</div>
      <div className="flex flex-col overflow-hidden border-l border-[#e5e6eb] bg-white">
        {rightPanel}
      </div>
    </div>
  );
};
