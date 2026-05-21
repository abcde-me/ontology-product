/**
 * CodeBlock - 代码块组件
 * 参考 ai-appforge 的 CodeBlock，带行号和复制功能
 */
import React, { memo, useMemo } from 'react';
import { IconCopy } from '@arco-design/web-react/icon';
import { Message } from '@arco-design/web-react';
import styles from './CodeBlock.module.scss';

interface CodeBlockProps {
  /** 代码内容字符串 */
  code: string;
  /** 语言标签（左上角显示），默认 "JSON" */
  language?: string;
  /** 自定义类名 */
  className?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'JSON',
  className
}) => {
  const lines = useMemo(() => code.split('\n'), [code]);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        Message.success('复制成功');
      })
      .catch(() => {
        Message.error('复制失败');
      });
  };

  return (
    <div className={`${styles.codeBlock} ${className || ''}`}>
      {/* 头部栏：语言标签 + 复制按钮 */}
      <div className={styles.header}>
        <span className={styles.language}>{language}</span>
        <IconCopy className={styles.copyIcon} onClick={handleCopy} />
      </div>

      {/* 代码区域 — 内部滚动 */}
      <div className={styles.codeArea}>
        <table className={styles.codeTable}>
          <tbody>
            {lines.map((line, i) => (
              <tr key={i}>
                <td className={styles.lineNumber}>{i + 1}</td>
                <td className={styles.lineContent}>{line || ' '}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default memo(CodeBlock);
