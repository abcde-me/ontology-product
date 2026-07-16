import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNodes } from 'reactflow';
import styles from './CanvasEmptyHint.module.scss';

/**
 * 画布无节点时居中提示「右键选择节点」。
 * 需挂在 AIWorkflowProvider / ReactFlow 上下文内（如 fullyCustomSubheader）。
 */
export default function CanvasEmptyHint() {
  const nodes = useNodes();
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const findHost = () =>
      document.querySelector('[data-task-editor="true"] .react-flow');

    const existing = findHost();
    if (existing) {
      setHost(existing);
      return undefined;
    }

    const timerId = window.setInterval(() => {
      const next = findHost();
      if (next) {
        setHost(next);
        window.clearInterval(timerId);
      }
    }, 50);

    return () => {
      window.clearInterval(timerId);
    };
  }, []);

  if (!host || nodes.length > 0) {
    return null;
  }

  return createPortal(
    <div className={styles['empty-hint']} aria-hidden>
      <div className={styles['empty-hint-title']}>右键选择节点</div>
      <div className={styles['empty-hint-desc']}>
        在画布空白处右键，从菜单中选择要添加的节点
      </div>
    </div>,
    host
  );
}
