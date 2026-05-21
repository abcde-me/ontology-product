/**
 * useAutoScroll - 智能滚动控制（对标豆包体验）
 *
 * 核心行为：
 * 1. 流式输出时默认自动追底
 * 2. 用户向上滚动（哪怕 1px）→ 立即停止追底，显示「回到底部」按钮
 * 3. 用户手动滚回底部 / 点击按钮 → 恢复自动追底
 * 4. 新消息发送时强制追底
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseAutoScrollOptions {
  /** 距底部多少 px 以内视为 "回到底部"，用于恢复追底，默认 20 */
  bottomThreshold?: number;
  /** 距底部超过多少 px 才显示「回到底部」按钮，默认 80 */
  showButtonThreshold?: number;
}

export interface UseAutoScrollReturn {
  /** 是否显示「回到底部」按钮 */
  showGoBottom: boolean;
  /** 追底滚动（仅在 stickToBottom 为 true 时生效） */
  scrollToBottom: (behavior?: ScrollBehavior) => void;
  /** 强制追底（发消息 / 点按钮 / 加载历史时使用） */
  forceScrollToBottom: (behavior?: ScrollBehavior) => void;
  /** 当前是否处于追底模式（ref，供同步读取） */
  stickToBottom: React.MutableRefObject<boolean>;
}

export function useAutoScroll(
  containerRef: React.RefObject<HTMLDivElement>,
  opts?: UseAutoScrollOptions
): UseAutoScrollReturn {
  const bottomThreshold = opts?.bottomThreshold ?? 20;
  const showButtonThreshold = opts?.showButtonThreshold ?? 80;

  // ---- 是否处于「追底」模式 ----
  const stickToBottom = useRef(true);

  // ---- 是否显示「回到底部」按钮 ----
  const [showGoBottom, setShowGoBottom] = useState(false);

  // ---- 标记：忽略 programmatic scroll 触发的 scroll 事件 ----
  const isAutoScrolling = useRef(false);

  // ---- 上一次 scrollTop，用于判断用户滚动方向 ----
  const lastScrollTop = useRef(0);

  // ---- 辅助：计算距底距离 ----
  const distanceToBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return 0;
    return el.scrollHeight - el.scrollTop - el.clientHeight;
  }, [containerRef]);

  // ---- 监听容器 scroll 事件 ----
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // 初始化 lastScrollTop
    lastScrollTop.current = el.scrollTop;

    const handleScroll = () => {
      // 如果是 programmatic scroll 触发的，只更新 lastScrollTop，不改变状态
      if (isAutoScrolling.current) {
        lastScrollTop.current = el.scrollTop;
        return;
      }

      const currentScrollTop = el.scrollTop;
      const scrolledUp = currentScrollTop < lastScrollTop.current;
      const dist = distanceToBottom();

      if (scrolledUp) {
        // 用户向上滚动 → 立即脱离追底
        stickToBottom.current = false;
        // 但按钮只有离底部足够远才显示
        setShowGoBottom(dist > showButtonThreshold);
      } else {
        // 用户向下滚动 → 检查是否已经回到底部
        if (dist <= bottomThreshold) {
          stickToBottom.current = true;
          setShowGoBottom(false);
        } else {
          // 向下滚但还没到底，更新按钮显示状态
          setShowGoBottom(dist > showButtonThreshold);
        }
      }

      lastScrollTop.current = currentScrollTop;
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [containerRef, bottomThreshold, showButtonThreshold, distanceToBottom]);

  // ---- 执行滚动的内部方法 ----
  const doScroll = useCallback((el: HTMLElement, behavior: ScrollBehavior) => {
    isAutoScrolling.current = true;

    if (behavior === 'smooth') {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    } else {
      el.scrollTop = el.scrollHeight;
    }

    // 解除 isAutoScrolling 标记
    // instant 滚动在下一帧即可解除，smooth 需要等动画完成
    requestAnimationFrame(() => {
      if (behavior !== 'smooth') {
        isAutoScrolling.current = false;
        lastScrollTop.current = el.scrollTop;
      } else {
        setTimeout(() => {
          isAutoScrolling.current = false;
          lastScrollTop.current = el.scrollTop;
        }, 300);
      }
    });
  }, []);

  // ---- scrollToBottom：流式输出时调用，仅在 stickToBottom 为 true 时生效 ----
  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = 'smooth') => {
      if (!stickToBottom.current) return; // 用户正在翻阅，不打扰

      const el = containerRef.current;
      if (!el) return;

      doScroll(el, behavior);
    },
    [containerRef, doScroll]
  );

  // ---- forceScrollToBottom：发消息 / 加载历史 / 点击按钮时调用，强制追底 ----
  const forceScrollToBottom = useCallback(
    (behavior: ScrollBehavior = 'auto') => {
      stickToBottom.current = true;
      setShowGoBottom(false);

      const el = containerRef.current;
      if (!el) return;

      doScroll(el, behavior);
    },
    [containerRef, doScroll]
  );

  return {
    showGoBottom,
    scrollToBottom,
    forceScrollToBottom,
    stickToBottom
  };
}
