import React from 'react';
import { useAIWorkbenchStore } from '../store';
import AIWorkbenchGraph from './AIWorkbenchGraph';

/**
 * 右侧图谱面板
 */
const GraphPanel: React.FC = () => {
  const { currentOntology } = useAIWorkbenchStore();
  const [graphKey, setGraphKey] = React.useState(0);

  // 监听本体变化，强制重新挂载图谱组件
  React.useEffect(() => {
    if (currentOntology?.id) {
      console.log(
        '[GraphPanel] 本体切换，强制重新挂载图谱组件，本体ID:',
        currentOntology.id
      );
      setGraphKey((prev) => prev + 1);
    }
  }, [currentOntology?.id]);

  /**
   * 渲染内容区域
   */
  const renderContent = () => {
    // 如果没有选中本体，显示提示
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

    return <AIWorkbenchGraph key={`graph-${currentOntology.id}-${graphKey}`} />;
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* 顶部标题栏 */}
      <div className="flex h-[48px] flex-shrink-0 items-center bg-white pl-[24px]">
        <span className="text-[16px] font-[500] leading-[24px] text-[var(--color-text-1)]">
          本体图谱
        </span>
      </div>

      {/* 图谱内容区域 */}
      <div className="flex-1 overflow-hidden bg-[#f8f9fc]">
        {renderContent()}
      </div>
    </div>
  );
};

export default GraphPanel;
