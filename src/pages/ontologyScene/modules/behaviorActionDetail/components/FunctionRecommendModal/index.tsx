import React from 'react';
import { Button, Empty, Modal, Tag } from '@arco-design/web-react';
import { GlobalTooltip } from '@ceai-front/arco-material';
import type {
  BehaviorFunctionRecommendation,
  BehaviorFunctionRecommendSource
} from '@/pages/ontologyScene/modules/behaviorActionDetail/services/recommendBehaviorFunctions';
import styles from './index.module.scss';

interface FunctionRecommendModalProps {
  visible: boolean;
  loading?: boolean;
  source?: BehaviorFunctionRecommendSource;
  recommendations: BehaviorFunctionRecommendation[];
  onSelect: (functionId: number) => void;
  onCancel: () => void;
}

export const FunctionRecommendModal = ({
  visible,
  loading,
  source,
  recommendations,
  onSelect,
  onCancel
}: FunctionRecommendModalProps) => {
  return (
    <Modal
      title="智能推荐函数"
      visible={visible}
      onCancel={onCancel}
      footer={null}
      className={styles.modal}
      style={{ width: 640 }}
      unmountOnExit
    >
      {source === 'llm' && (
        <Tag color="purple" size="small" className="mb-[12px]">
          AI 推荐
        </Tag>
      )}

      {loading ? (
        <div className={styles.loading}>正在分析行为意图并匹配函数...</div>
      ) : recommendations.length ? (
        <div className={styles.list}>
          {recommendations.map((item) => (
            <div key={item.functionId} className={styles.item}>
              <div className={styles.itemMain}>
                <div className={styles.itemTitle}>
                  <GlobalTooltip.Ellipsis text={item.functionCode} />
                  <span className={styles.score}>匹配度 {item.score}</span>
                </div>
                <div className={styles.itemName}>
                  显示名称：
                  <GlobalTooltip.Ellipsis text={item.functionName} />
                </div>
                <div className={styles.itemReason}>{item.reason}</div>
              </div>
              <Button
                type="primary"
                size="small"
                onClick={() => onSelect(item.functionId)}
              >
                选用
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <Empty description="未找到匹配的函数，请手动选择或先创建函数" />
      )}
    </Modal>
  );
};
