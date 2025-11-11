import React, { useMemo, useEffect, useRef } from 'react';
import { Empty } from '@arco-design/web-react';
import {
  useRagDetailStore,
  type Segment,
  type ImageTextSegment
} from '../../store/ragDetailStore';
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

  // 搜索过滤逻辑
  const filteredSegments = useMemo(() => {
    if (!segmentSearchText.trim()) {
      return segments;
    }

    const searchLower = segmentSearchText.toLowerCase().trim();
    return segments.filter((segment) => {
      const titleMatch = segment.title?.toLowerCase().includes(searchLower);
      const contentMatch = segment.content.toLowerCase().includes(searchLower);
      return titleMatch || contentMatch;
    });
  }, [segments, segmentSearchText]);

  // 按 title 分组
  const groupedSegments = useMemo(() => {
    const groups: { title: string; segments: Segment[] }[] = [];
    const titleMap = new Map<string, Segment[]>();

    filteredSegments.forEach((segment) => {
      const title = segment.title || '未分类';
      if (!titleMap.has(title)) {
        titleMap.set(title, []);
      }
      titleMap.get(title)!.push(segment);
    });

    titleMap.forEach((segs, title) => {
      groups.push({ title, segments: segs });
    });

    return groups;
  }, [filteredSegments]);

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

  // 渲染分组的分段列表
  const segmentItems = useMemo(() => {
    if (groupedSegments.length === 0) {
      return (
        <div className="flex h-full items-center justify-center">
          <Empty description="未找到匹配的分段" />
        </div>
      );
    }

    return groupedSegments.map((group, groupIndex) => (
      <div key={group.title} className={groupIndex < 0 ? 'mt-6' : ''}>
        {/* 标题分组头部 */}
        <div className="rounded-md py-3">
          <div className="text-sm font-medium text-[#0F172A]">
            {group.title}
          </div>
        </div>

        {/* 该标题下的分段列表 */}
        <div className="space-y-3">
          {group.segments.map((segment) => {
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
          })}
        </div>
      </div>
    ));
  }, [groupedSegments, selectedSegmentId, renderMode]);

  return (
    <div className="flex h-full flex-col bg-white px-4">
      {!hideHeader && (
        <SegmentListHeader
          totalCount={segments.length}
          filteredCount={filteredSegments.length}
        />
      )}
      <div
        className={`flex-1 overflow-y-auto pb-4 ${styles.scrollContainer}`}
        style={{ minHeight: 0 }}
      >
        {segmentItems}
      </div>
    </div>
  );
};

export default SegmentList;
