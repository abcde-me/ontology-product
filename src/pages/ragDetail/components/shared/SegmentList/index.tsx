import React, { useMemo, useEffect, useRef, useCallback } from 'react';
import { Empty } from '@arco-design/web-react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
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

  // Virtuoso 的 ref
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  // 待滚动的 segmentId（当 virtuosoRef 还没准备好时暂存）
  const pendingScrollId = useRef<string | null>(null);
  // 标记是否已经处理过初始滚动
  const initialScrollDone = useRef(false);

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

  // 执行滚动的函数
  const doScrollToSegment = useCallback(
    (segmentId: string, immediate = false) => {
      const index = filteredSegments.findIndex((seg) => seg.id === segmentId);
      if (index !== -1 && virtuosoRef.current) {
        virtuosoRef.current.scrollToIndex({
          index,
          align: 'start',
          behavior: immediate ? 'auto' : 'smooth'
        });
        return true;
      }
      return false;
    },
    [filteredSegments]
  );

  // 监听目录树触发的滚动事件
  useEffect(() => {
    const handleScrollToSegment = (event: CustomEvent) => {
      const { segmentId } = event.detail;
      if (segmentId) {
        // 点击目录树时直接滚动
        doScrollToSegment(segmentId);
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
  }, [doScrollToSegment]);

  // URL 初始化时的滚动处理
  useEffect(() => {
    if (selectedSegmentId && !initialScrollDone.current) {
      pendingScrollId.current = selectedSegmentId;
    }
  }, [selectedSegmentId]);

  // 处理点击分段 - 使用 useCallback 缓存
  // 注意：点击切片列表时不触发滚动，只设置选中状态
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

  // 渲染单个分段卡片
  const renderSegmentCard = useCallback(
    (_index: number, segment: Segment) => {
      if (renderMode === 'image-text') {
        return (
          <div
            onClick={() => handleSegmentClick(segment.id)}
            style={{ cursor: 'pointer', paddingBottom: '12px' }}
          >
            <ImageTextSegmentCard
              segment={segment as ImageTextSegment}
              isSelected={selectedSegmentId === segment.id}
              totalSegments={segments.length}
            />
          </div>
        );
      }

      return (
        <div
          onClick={() => handleSegmentClick(segment.id)}
          style={{ cursor: 'pointer', paddingBottom: '12px' }}
        >
          <SegmentCard
            segment={segment}
            isSelected={selectedSegmentId === segment.id}
            totalSegments={segments.length}
          />
        </div>
      );
    },
    [renderMode, selectedSegmentId, segments.length, handleSegmentClick]
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
        className={`flex-1 ${styles.scrollContainer}`}
        style={{ minHeight: 0, overflow: 'hidden' }}
      >
        <Virtuoso
          ref={virtuosoRef}
          data={filteredSegments}
          itemContent={renderSegmentCard}
          overscan={200}
          style={{ height: '100%' }}
          // 当列表渲染完成后，检查是否有待滚动的项（仅用于 URL 初始化）
          totalListHeightChanged={() => {
            // 只处理一次初始滚动
            if (
              pendingScrollId.current &&
              !initialScrollDone.current &&
              virtuosoRef.current
            ) {
              const segmentId = pendingScrollId.current;
              pendingScrollId.current = null;
              initialScrollDone.current = true;
              // 使用 setTimeout 确保 Virtuoso 完全准备好
              setTimeout(() => {
                doScrollToSegment(segmentId, true); // 使用即时滚动
              }, 50);
            }
          }}
        />
      </div>
    </div>
  );
};

export default SegmentList;
