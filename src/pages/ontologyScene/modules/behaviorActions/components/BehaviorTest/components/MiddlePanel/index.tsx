import React from 'react';
import { CanvasHeader } from '../CanvasHeader';
import { OrchestrationCanvas } from '../OrchestrationCanvas';
import { TestFunctionInfo } from '@/pages/ontologyScene/hooks/useTestFunction';

interface MiddlePanelProps {
  testFunctionHook: TestFunctionInfo;
}

export const MiddlePanel: React.FC<MiddlePanelProps> = React.memo(
  ({ testFunctionHook }) => {
    return (
      <div className="flex h-full w-full flex-col">
        <CanvasHeader testFunctionHook={testFunctionHook} />
        <div className="scrollbar-hide flex-1 overflow-y-auto overflow-x-hidden bg-[#F8F9FC] p-5">
          <OrchestrationCanvas />
        </div>
      </div>
    );
  }
);
