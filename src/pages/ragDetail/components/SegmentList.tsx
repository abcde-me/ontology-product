import React, { useMemo, useEffect, useRef } from 'react';
import {
  useRagDetailStore,
  type Segment,
  type ImageTextSegment
} from '../store/ragDetailStore';
import SegmentCard from './SegmentCard';
import ImageTextSegmentCard from './ImageTextSegmentCard';
import SegmentListHeader from './SegmentListHeader';

interface SegmentListProps {
  segments?: Segment[];
  selectedSegmentId?: string | null;
  renderMode?: 'text' | 'image-text'; // 渲染模式
  hideHeader?: boolean; // 是否隐藏头部
}

const SegmentList: React.FC<SegmentListProps> = ({
  segments: propSegments,
  selectedSegmentId: propSelectedSegmentId,
  renderMode = 'text',
  hideHeader = false
}) => {
  const {
    segments: storeSegments,
    selectedSegmentId: storeSelectedSegmentId,
    setSelectedSegmentId,
    highlightPdfCoordinates,
    clearPdfHighlight
  } = useRagDetailStore();
  const segmentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // 优先使用props，如果没有则使用store中的数据
  const segments = propSegments || storeSegments;
  const selectedSegmentId =
    propSelectedSegmentId !== undefined
      ? propSelectedSegmentId
      : storeSelectedSegmentId;

  // 当选中的分段变化时，自动滚动到该分段
  useEffect(() => {
    if (selectedSegmentId && segmentRefs.current[selectedSegmentId]) {
      segmentRefs.current[selectedSegmentId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [selectedSegmentId]);

  // 监听目录树触发的滚动事件
  useEffect(() => {
    const handleScrollToSegment = (event: CustomEvent) => {
      const { segmentId } = event.detail;
      if (segmentId && segmentRefs.current[segmentId]) {
        segmentRefs.current[segmentId]?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    };

    window.addEventListener(
      'scrollToSegment',
      handleScrollToSegment as EventListener
    );
    return () => {
      window.removeEventListener(
        'scrollToSegment',
        handleScrollToSegment as EventListener
      );
    };
  }, []);

  // 处理点击分段
  const handleSegmentClick = (segmentId: string) => {
    // 设置选中的分段ID，这会触发目录树的高亮
    setSelectedSegmentId(segmentId);

    // 查找对应的segment，获取PDF坐标并高亮
    const segment = segments.find((s) => s.id === segmentId);
    if (
      segment &&
      segment.pdfCoordinates &&
      segment.pdfCoordinates.length > 0
    ) {
      highlightPdfCoordinates(segment.pdfCoordinates);
    } else {
      clearPdfHighlight();
    }
  };

  const segmentItems = useMemo(() => {
    return segments.map((segment) => {
      // 根据renderMode渲染不同的卡片
      if (renderMode === 'image-text') {
        return (
          <div
            key={segment.id}
            ref={(el) => (segmentRefs.current[segment.id] = el)}
            onClick={() => handleSegmentClick(segment.id)}
            style={{ cursor: 'pointer' }}
          >
            <ImageTextSegmentCard
              segment={segment as ImageTextSegment}
              isSelected={selectedSegmentId === segment.id}
            />
          </div>
        );
      }

      return (
        <div
          key={segment.id}
          ref={(el) => (segmentRefs.current[segment.id] = el)}
          onClick={() => handleSegmentClick(segment.id)}
          style={{ cursor: 'pointer' }}
        >
          <SegmentCard
            segment={segment}
            isSelected={selectedSegmentId === segment.id}
          />
        </div>
      );
    });
  }, [segments, selectedSegmentId, renderMode]);

  return (
    <div className="flex h-full flex-col bg-white px-4">
      {!hideHeader && <SegmentListHeader />}
      <div className="flex-1 overflow-y-auto pb-4">
        <div className="flex flex-col gap-3">{segmentItems}</div>
      </div>
    </div>
  );
};

export default SegmentList;
