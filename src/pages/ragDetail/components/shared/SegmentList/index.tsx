import React, { useMemo, useEffect, useRef, useCallback } from 'react';
import { Empty } from '@arco-design/web-react';
import { useVirtualList } from 'ahooks';
import {
  useRagDetailStore,
  type Segment,
  type ImageTextSegment
} from '../../../store/ragDetailStore';
import SegmentCard from '../SegmentCard';
import ImageTextSegmentCard from '../ImageTextSegmentCard';
import SegmentListHeader from '../SegmentListHeader';
import styles from './SegmentList.module.scss';

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
    clearPdfHighlight,
    segmentSearchText
  } = useRagDetailStore();
  const segmentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // 优先使用props，如果没有则使用store中的数据
  const segments = propSegments || storeSegments;
  const selectedSegmentId =
    propSelectedSegmentId !== undefined
      ? propSelectedSegmentId
      : storeSelectedSegmentId;

  // 搜索过滤逻辑 - 只根据 content 搜索
  const filteredSegments = useMemo(() => {
    if (!segmentSearchText.trim()) {
      return segments;
    }

    const searchLower = segmentSearchText.toLowerCase().trim();
    return segments.filter((segment) => {
      return segment.content.toLowerCase().includes(searchLower);
    });
  }, [segments, segmentSearchText]);

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

  // 容器和内容的ref
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 处理点击分段 - 使用 useCallback 缓存
  const handleSegmentClick = useCallback(
    (segmentId: string) => {
      // 设置选中的分段ID，这会触发目录树的高亮
      setSelectedSegmentId(segmentId);

      // 查找对应的segment，获取PDF坐标并高亮
      const segment = filteredSegments.find((s) => s.id === segmentId);
      if (
        segment &&
        segment.pdfCoordinates &&
        segment.pdfCoordinates.length > 0
      ) {
        highlightPdfCoordinates(segment.pdfCoordinates);
      } else {
        clearPdfHighlight();
      }
    },
    [
      filteredSegments,
      setSelectedSegmentId,
      highlightPdfCoordinates,
      clearPdfHighlight
    ]
  );

  // 使用虚拟滚动 - 根据renderMode调整itemHeight
  const itemHeight = renderMode === 'image-text' ? 280 : 120;
  const [virtualList] = useVirtualList(filteredSegments, {
    containerTarget: containerRef,
    wrapperTarget: wrapperRef,
    itemHeight,
    overscan: 5 // 额外渲染的项数，减少滚动时的闪烁
  });

  // 渲染单个分段卡片
  const renderSegmentCard = useCallback(
    (segment: Segment) => {
      if (renderMode === 'image-text') {
        return (
          <ImageTextSegmentCard
            segment={segment as ImageTextSegment}
            isSelected={selectedSegmentId === segment.id}
            totalSegments={segments.length}
          />
        );
      }

      return (
        <SegmentCard
          segment={segment}
          isSelected={selectedSegmentId === segment.id}
          totalSegments={segments.length}
        />
      );
    },
    [renderMode, selectedSegmentId, segments.length]
  );

  // 当filteredSegments为空时显示空状态
  if (filteredSegments.length === 0) {
    return (
      <div className="flex h-full flex-col bg-white px-4">
        {!hideHeader && (
          <SegmentListHeader totalCount={segments.length} filteredCount={0} />
        )}
        <div className="flex flex-1 items-center justify-center">
          <Empty description="暂无数据" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-white px-4">
      {!hideHeader && (
        <SegmentListHeader
          totalCount={segments.length}
          filteredCount={filteredSegments.length}
        />
      )}
      <div
        ref={containerRef}
        className={`flex-1 overflow-y-auto pb-4 ${styles.scrollContainer}`}
        style={{ minHeight: 0 }}
      >
        <div ref={wrapperRef}>
          {virtualList.map((item) => (
            <div
              key={item.data.id}
              ref={(el) => (segmentRefs.current[item.data.id] = el)}
              onClick={() => handleSegmentClick(item.data.id)}
              style={{ cursor: 'pointer', marginBottom: '12px' }}
            >
              {renderSegmentCard(item.data)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SegmentList;
