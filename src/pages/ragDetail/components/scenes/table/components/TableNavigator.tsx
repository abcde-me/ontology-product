/**
 * Table Navigator Component
 * 表格导航组件
 */

import React from 'react';

interface TableNavigatorProps {
  currentIndex: number;
  total: number;
  currentName: string;
  onPrevious: () => void;
  onNext: () => void;
}

const TableNavigator: React.FC<TableNavigatorProps> = ({
  currentIndex,
  total,
  currentName,
  onPrevious,
  onNext
}) => {
  if (total <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
      <button
        onClick={onPrevious}
        disabled={currentIndex === 0}
        className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        ← 上一个
      </button>

      <div className="text-sm text-gray-600">{currentName}</div>

      <button
        onClick={onNext}
        disabled={currentIndex === total - 1}
        className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        下一个 →
      </button>
    </div>
  );
};

export default TableNavigator;
