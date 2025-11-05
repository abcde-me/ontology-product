/**
 * PPT Viewer Component
 * PPT展示查看器
 */

import React, { useState } from 'react';
import { PptSegment } from '../types';

interface PptViewerProps {
  segments: PptSegment[];
}

const PptViewer: React.FC<PptViewerProps> = ({ segments }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  if (segments.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-100">
        <div className="text-gray-500">暂无PPT数据</div>
      </div>
    );
  }

  const currentSlide = segments[currentSlideIndex];

  const handlePrevious = () => {
    setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentSlideIndex((prev) => Math.min(segments.length - 1, prev + 1));
  };

  return (
    <div className="flex h-full flex-col bg-gray-100">
      {/* 幻灯片显示区域 */}
      <div className="flex flex-1 items-center justify-center overflow-auto p-4">
        <div className="max-h-full max-w-full rounded-lg bg-white p-8 shadow-lg">
          {/* 幻灯片标题 */}
          {currentSlide.slideTitle && (
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              {currentSlide.slideTitle}
            </h2>
          )}

          {/* 幻灯片内容 */}
          <div className="whitespace-pre-wrap text-gray-700">
            {currentSlide.slideContent || currentSlide.content}
          </div>
        </div>
      </div>

      {/* 控制条 */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
        <button
          onClick={handlePrevious}
          disabled={currentSlideIndex === 0}
          className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ← 上一页
        </button>

        <div className="text-sm text-gray-600">
          第 {currentSlideIndex + 1} / {segments.length} 页
        </div>

        <button
          onClick={handleNext}
          disabled={currentSlideIndex === segments.length - 1}
          className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          下一页 →
        </button>
      </div>
    </div>
  );
};

export default PptViewer;
