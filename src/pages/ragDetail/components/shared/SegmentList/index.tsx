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
import { doScrollToSegment as doScrollToSegmentUtil } from './doScrollToSegment';
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
    segmentSearchText,
    scrollToSegmentId,
    scrollToSegmentTimestamp,
    clearScrollToSegment
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

  // 执行滚动的函数 - 使用独立的工具函数
  const doScrollToSegment = useCallback(
    (segmentId: string, immediate = false) => {
      return doScrollToSegmentUtil(
        segmentId,
        filteredSegments,
        virtuosoRef,
        immediate
      );
    },
    [filteredSegments]
  );

  // 使用 store 状态监听滚动触发 - 代替 CustomEvent
  useEffect(() => {
    console.log('👂 ========== SegmentList useEffect 触发 ==========');
    console.log('📊 当前状态:', {
      scrollToSegmentId,
      scrollToSegmentTimestamp,
      hasScrollToSegmentId: !!scrollToSegmentId,
      timestampValid: scrollToSegmentTimestamp > 0
    });

    if (scrollToSegmentId && scrollToSegmentTimestamp > 0) {
      console.log('🎯 检测到滚动请求!');
      console.log('   目标 segmentId:', scrollToSegmentId);
      console.log('   时间戳:', scrollToSegmentTimestamp);
      console.log(
        '   时间:',
        new Date(scrollToSegmentTimestamp).toLocaleTimeString()
      );

      console.log('📋 当前 filteredSegments 信息:', {
        总数: filteredSegments.length,
        前5个ID: filteredSegments.slice(0, 5).map((s) => s.id)
      });

      console.log('🔍 检查 virtuosoRef:', {
        存在: !!virtuosoRef.current,
        类型: virtuosoRef.current ? typeof virtuosoRef.current : 'undefined'
      });

      console.log('🚀 开始执行滚动...');

      // 执行滚动
      const success = doScrollToSegment(scrollToSegmentId);

      if (success) {
        console.log('✅ 滚动成功！');
        console.log('🧹 清除滚动状态...');
        // 清除滚动状态，避免重复触发
        clearScrollToSegment();
        console.log('✅ 滚动状态已清除');
      } else {
        console.log('⏰ 滚动失败，将在 100ms 后重试...');
        console.log('   失败可能原因:');
        console.log('   1. virtuosoRef.current 为 null');
        console.log('   2. 目标切片不在 filteredSegments 中');
        console.log('   3. 虚拟列表还没完全初始化');

        // 如果失败（可能是 virtuosoRef 还没准备好），延迟重试
        setTimeout(() => {
          console.log('🔄 ========== 开始重试滚动 ==========');
          console.log('📍 重试目标:', scrollToSegmentId);
          console.log('🔍 重试时 virtuosoRef 状态:', !!virtuosoRef.current);

          const retrySuccess = doScrollToSegment(scrollToSegmentId);

          if (retrySuccess) {
            console.log('✅ 重试滚动成功！');
          } else {
            console.error('❌ 重试滚动仍然失败');
            console.log('   请检查:');
            console.log('   1. 目标切片是否在列表中');
            console.log('   2. 搜索框是否有内容（可能过滤了切片）');
            console.log('   3. virtuosoRef 是否正确绑定');
          }

          console.log('🧹 清除滚动状态...');
          clearScrollToSegment();
          console.log('================================================\n');
        }, 100);
      }
    } else {
      if (scrollToSegmentId) {
        console.log('⚠️ scrollToSegmentId 存在但 timestamp 无效');
      }
      if (scrollToSegmentTimestamp > 0) {
        console.log('⚠️ timestamp 有效但 scrollToSegmentId 为空');
      }
    }

    console.log('================================================\n');
  }, [
    scrollToSegmentId,
    scrollToSegmentTimestamp,
    doScrollToSegment,
    clearScrollToSegment
  ]);

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
            data-segment-id={segment.id}
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
          data-segment-id={segment.id}
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
        data-virtuoso-container="segment-list"
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
              // 延迟 300ms 确保虚拟列表布局完全稳定，避免滚动位置被遮挡
              setTimeout(() => {
                doScrollToSegment(segmentId, true); // 使用即时滚动
              }, 300);
            }
          }}
        />
      </div>
    </div>
  );
};

export default SegmentList;
