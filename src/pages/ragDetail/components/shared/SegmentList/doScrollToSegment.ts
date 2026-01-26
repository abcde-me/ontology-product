/**
 * 滚动到指定切片的函数 - 支持多种滚动方式
 * 这是一个独立的工具函数，包含详细的日志输出
 */

import { VirtuosoHandle } from 'react-virtuoso';
import { Segment } from '../../../store/ragDetailStore';

export function doScrollToSegment(
  segmentId: string,
  filteredSegments: Segment[],
  virtuosoRef: React.RefObject<VirtuosoHandle>,
  immediate = false
): boolean {
  console.log('🎬 ========== doScrollToSegment 开始执行 ==========');
  console.log('📍 参数:', {
    segmentId,
    immediate,
    filteredSegmentsCount: filteredSegments.length
  });

  const index = filteredSegments.findIndex((seg) => seg.id === segmentId);

  if (index === -1) {
    console.warn('⚠️ 未找到目标切片:', segmentId);
    console.log('   filteredSegments 总数:', filteredSegments.length);
    console.log(
      '   前10个ID:',
      filteredSegments.slice(0, 10).map((s) => s.id)
    );
    console.log('================================================\n');
    return false;
  }

  console.log('✅ 找到目标切片!');
  console.log('📍 索引信息:', {
    index,
    total: filteredSegments.length,
    percentage: ((index / filteredSegments.length) * 100).toFixed(2) + '%'
  });
  console.log(
    '📄 切片内容预览:',
    filteredSegments[index].content.substring(0, 100) + '...'
  );

  // 方案 1: 使用 react-virtuoso 的 scrollToIndex (推荐)
  console.log('\n--- 尝试方案 1: react-virtuoso scrollToIndex ---');
  console.log('🔍 检查 virtuosoRef.current:', !!virtuosoRef.current);

  if (virtuosoRef.current) {
    try {
      console.log('📤 调用 scrollToIndex:', {
        index,
        align: 'start',
        behavior: immediate ? 'auto' : 'smooth'
      });
      virtuosoRef.current.scrollToIndex({
        index,
        align: 'start',
        behavior: immediate ? 'auto' : 'smooth'
      });
      console.log('✅ 方案1: virtuoso.scrollToIndex 调用成功');
      console.log('================================================\n');
      return true;
    } catch (error) {
      console.error('❌ 方案1失败:', error);
      console.log('   错误详情:', {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack?.split('\n').slice(0, 3)
      });
    }
  } else {
    console.warn('⚠️ virtuosoRef.current 不存在，跳过方案1');
  }

  // 方案 2: 使用 DOM 原生滚动 (降级方案)
  console.log('\n--- 尝试方案 2: DOM 原生滚动 ---');
  try {
    // 查找对应的 DOM 元素
    console.log('🔍 查找 DOM 元素:', `[data-segment-id="${segmentId}"]`);
    const segmentElement = document.querySelector(
      `[data-segment-id="${segmentId}"]`
    );

    if (segmentElement) {
      console.log('✅ 找到切片元素');

      // 找到滚动容器 - 尝试多种选择器
      console.log('🔍 查找滚动容器...');
      let scrollContainer = segmentElement.closest(
        '[data-virtuoso-container]'
      )?.parentElement;

      if (!scrollContainer) {
        console.log('   尝试 [data-test-id] 选择器...');
        scrollContainer =
          segmentElement.closest('[data-test-id]')?.parentElement;
      }

      if (!scrollContainer) {
        console.log('   尝试查找最近的可滚动父元素...');
        let parent = segmentElement.parentElement;
        while (parent) {
          const overflow = window.getComputedStyle(parent).overflow;
          if (overflow === 'auto' || overflow === 'scroll') {
            scrollContainer = parent;
            break;
          }
          parent = parent.parentElement;
        }
      }

      if (scrollContainer) {
        console.log('✅ 找到滚动容器');
        const elementTop = (segmentElement as HTMLElement).offsetTop;
        console.log('📏 元素位置:', {
          offsetTop: elementTop,
          scrollTop: scrollContainer.scrollTop,
          clientHeight: scrollContainer.clientHeight
        });

        console.log('📤 执行 scrollTo:', {
          top: elementTop - 20,
          behavior: immediate ? 'auto' : 'smooth'
        });
        scrollContainer.scrollTo({
          top: elementTop - 20, // 留 20px 边距
          behavior: immediate ? 'auto' : 'smooth'
        });
        console.log('✅ 方案2: DOM 原生滚动成功');
        console.log('================================================\n');
        return true;
      } else {
        console.warn('⚠️ 未找到滚动容器');
      }
    } else {
      console.warn('⚠️ 未找到切片元素（可能还没渲染）');
    }
  } catch (error) {
    console.error('❌ 方案2失败:', error);
    console.log('   错误详情:', {
      name: (error as Error).name,
      message: (error as Error).message
    });
  }

  // 方案 3: 使用 scrollIntoView (最后的降级方案)
  console.log('\n--- 尝试方案 3: scrollIntoView ---');
  try {
    console.log('🔍 查找 DOM 元素:', `[data-segment-id="${segmentId}"]`);
    const segmentElement = document.querySelector(
      `[data-segment-id="${segmentId}"]`
    );

    if (segmentElement) {
      console.log('✅ 找到切片元素');
      console.log('📤 执行 scrollIntoView:', {
        behavior: immediate ? 'auto' : 'smooth',
        block: 'start'
      });
      (segmentElement as HTMLElement).scrollIntoView({
        behavior: immediate ? 'auto' : 'smooth',
        block: 'start'
      });
      console.log('✅ 方案3: scrollIntoView 成功');
      console.log('================================================\n');
      return true;
    } else {
      console.warn('⚠️ 未找到切片元素');
    }
  } catch (error) {
    console.error('❌ 方案3失败:', error);
    console.log('   错误详情:', {
      name: (error as Error).name,
      message: (error as Error).message
    });
  }

  console.error('❌ 所有滚动方案都失败了');
  console.log('💡 建议:');
  console.log('   1. 检查目标切片是否在 filteredSegments 中');
  console.log('   2. 检查 data-segment-id 属性是否正确添加');
  console.log('   3. 检查虚拟列表是否完全初始化');
  console.log('   4. 尝试清空搜索框');
  console.log('   5. 检查 DOM 结构是否正确');
  console.log('================================================\n');
  return false;
}
