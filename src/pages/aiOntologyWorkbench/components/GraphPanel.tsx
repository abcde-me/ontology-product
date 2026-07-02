import React, { Suspense } from 'react';
import { Spin } from '@arco-design/web-react';
import { useAIWorkbenchStore } from '../store';

const AIWorkbenchGraph = React.lazy(() => import('./AIWorkbenchGraph'));

const GraphLoading: React.FC = () => (
  <div className="flex h-full w-full items-center justify-center bg-[#f8f9fc]">
    <Spin />
  </div>
);

/**
 * 右侧图谱面板
 */
const GraphPanel: React.FC = () => {
  const { currentOntology } = useAIWorkbenchStore();
  const [graphKey, setGraphKey] = React.useState(0);

  React.useEffect(() => {
    if (currentOntology?.id) {
      setGraphKey((prev) => prev + 1);
    }
  }, [currentOntology?.id]);

  if (!currentOntology) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <div className="mb-2 text-[14px] text-[var(--color-text-3)]">
            请先选择一个本体
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#f8f9fc]">
      <Suspense fallback={<GraphLoading />}>
        <AIWorkbenchGraph key={`graph-${currentOntology.id}-${graphKey}`} />
      </Suspense>
    </div>
  );
};

export default GraphPanel;
