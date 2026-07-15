import React, { useMemo } from 'react';
import { Empty } from '@arco-design/web-react';
import { parseInferenceResultSections } from '../utils';
import styles from '../index.module.scss';

interface InferenceResultContentProps {
  content?: string;
}

export default function InferenceResultContent({
  content
}: InferenceResultContentProps) {
  const sections = useMemo(
    () => parseInferenceResultSections(content),
    [content]
  );

  if (!sections.length) {
    return (
      <div className={styles.resultEmpty}>
        <Empty description="暂无推理结果" />
      </div>
    );
  }

  return (
    <div className={styles.resultPanel}>
      <div className={styles.resultSectionList}>
        {sections.map((section, index) => {
          const items =
            section.items.length > 0
              ? section.items
              : section.body
                ? [section.body]
                : [];
          return (
            <div
              key={`${section.title}-${index}`}
              className={
                section.emphasis
                  ? styles.resultSectionEmphasis
                  : styles.resultSection
              }
            >
              <div className={styles.resultSectionTitle}>
                <span className={styles.resultSectionIndex}>{index + 1}</span>
                <span className={styles.resultSectionTitleText}>
                  {section.title}
                </span>
                {section.emphasis ? (
                  <span className={styles.resultSectionBadge}>重点</span>
                ) : null}
              </div>
              {items.length > 0 ? (
                <ul className={styles.resultItemList}>
                  {items.map((item, itemIndex) => (
                    <li
                      key={`${section.title}-${index}-${itemIndex}`}
                      className={styles.resultItem}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={styles.resultSectionBodyMuted}>暂无内容</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
