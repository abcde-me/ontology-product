import React from 'react';
import { CanvasHeader } from '../CanvasHeader';
import { OrchestrationCanvas } from '../OrchestrationCanvas';

export const MiddlePanel: React.FC = () => {
  return (
    <div className="flex h-full w-full flex-col">
      <CanvasHeader />
      <div className="scrollbar-hide flex-1 overflow-y-auto overflow-x-hidden bg-[#F8F9FC] p-5">
        <OrchestrationCanvas />
      </div>
    </div>
  );
};
