import React, { useEffect, useState } from 'react';
import {
  Alert,
  InputNumber,
  Modal,
  Radio,
  Typography
} from '@arco-design/web-react';
import {
  CANVAS_MAX_INSTANCES,
  CANVAS_MAX_RELATIONS,
  DEFAULT_GRAPH_LOAD_HOPS
} from '../constants';
import type { GraphLoadSettings } from '../types';
import styles from './LoadGraphSettingsModal.module.scss';

const { Text } = Typography;

interface LoadGraphSettingsModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (settings: GraphLoadSettings) => void;
}

type HopMode = 'custom' | 'all';

export const LoadGraphSettingsModal: React.FC<LoadGraphSettingsModalProps> = ({
  visible,
  onCancel,
  onConfirm
}) => {
  const [hopMode, setHopMode] = useState<HopMode>('custom');
  const [hopCount, setHopCount] = useState(DEFAULT_GRAPH_LOAD_HOPS);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setHopMode('custom');
    setHopCount(DEFAULT_GRAPH_LOAD_HOPS);
  }, [visible]);

  const handleConfirm = () => {
    onConfirm({
      hopCount: hopMode === 'all' ? 'all' : hopCount
    });
  };

  return (
    <Modal
      title="查询设置"
      visible={visible}
      onCancel={onCancel}
      onOk={handleConfirm}
      okText="确认载入"
      cancelText="取消"
      style={{ width: 440 }}
      unmountOnExit
    >
      <div className={styles.content}>
        <Text type="secondary" className={styles.desc}>
          设置载入到画布中各节点的关系跳数
        </Text>

        <Radio.Group
          className={styles['hop-mode']}
          value={hopMode}
          onChange={(value) => setHopMode(value as HopMode)}
        >
          <Radio value="custom">指定跳数</Radio>
          <Radio value="all">全部</Radio>
        </Radio.Group>

        {hopMode === 'custom' ? (
          <InputNumber
            className={styles['hop-input']}
            prefix="跳数"
            suffix="跳"
            min={1}
            max={20}
            precision={0}
            value={hopCount}
            onChange={(value) => {
              if (typeof value === 'number' && value >= 1) {
                setHopCount(value);
              }
            }}
          />
        ) : (
          <Text type="secondary" className={styles['all-hint']}>
            将载入焦点节点所在连通分量内的全部关联
          </Text>
        )}

        <Alert
          className={styles.alert}
          type="warning"
          content={`画布最多展示 ${CANVAS_MAX_INSTANCES} 个实例 ${CANVAS_MAX_RELATIONS} 条关系，超出数量无法加载到画布中`}
        />
      </div>
    </Modal>
  );
};
