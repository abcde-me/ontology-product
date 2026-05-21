/**
 * JSONViewer - JSON 结果查看器
 * 带行号、复制功能
 */
import React, { useState } from 'react';
import { Message } from '@arco-design/web-react';
import { IconCopy } from '@arco-design/web-react/icon';
import styles from './JSONViewer.module.scss';

interface JSONViewerProps {
  data: any;
  maxHeight?: number;
}

const JSONViewer: React.FC<JSONViewerProps> = ({ data, maxHeight = 400 }) => {
  const [copied, setCopied] = useState(false);

  // 格式化 JSON
  const jsonString = JSON.stringify(data, null, 2);
  const lines = jsonString.split('\n');

  // 复制到剪贴板
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      Message.success('已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      Message.error('复制失败');
    }
  };

  return (
    <div className={styles.jsonViewer}>
      {/* 头部 */}
      <div className={styles.header}>
        <span className={styles.label}>JSON</span>
        <div className={styles.actions}>
          <IconCopy className={styles.copyIcon} onClick={handleCopy} />
        </div>
      </div>

      {/* JSON 内容 */}
      <div className={styles.content} style={{ maxHeight: `${maxHeight}px` }}>
        <div className={styles.lineNumbers}>
          {lines.map((_, index) => (
            <div key={index} className={styles.lineNumber}>
              {index + 1}
            </div>
          ))}
        </div>
        <pre className={styles.code}>{jsonString}</pre>
      </div>
    </div>
  );
};

export default JSONViewer;
