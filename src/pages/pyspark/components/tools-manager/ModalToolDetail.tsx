import React, { useCallback } from 'react';
import {
  Modal,
  Button,
  Tag,
  Space,
  Divider,
  Input
} from '@arco-design/web-react';
import { IconCopy } from '@arco-design/web-react/icon';
import { OperatorItem } from '@/types/pythonApi';
import copy from 'copy-to-clipboard';
import { Message } from '@arco-design/web-react';
import './ModalToolDetail.scss';

interface ModalToolDetailProps {
  toolDetailData: OperatorItem | null;
  toolDetailVisible: boolean;
  closeToolDetail: () => void;
}

/** 算子详情弹框 */
const ModalToolDetail: React.FC<ModalToolDetailProps> = ({
  toolDetailData,
  toolDetailVisible,
  closeToolDetail
}) => {
  // 复制代码功能
  const handleCopyCode = useCallback(() => {
    if (toolDetailData?.sample_code) {
      const success = copy(toolDetailData.sample_code);
      Message[success ? 'success' : 'error'](
        success ? '代码已复制到剪贴板' : '复制失败'
      );
    }
  }, [toolDetailData?.sample_code]);

  if (!toolDetailData) {
    return null;
  }

  return (
    <Modal
      title="算子详情"
      style={{ width: 1200 }}
      visible={toolDetailVisible}
      footer={null}
      onCancel={closeToolDetail}
      className="operator-detail-modal"
    >
      <div className="operator-detail-container">
        {/* 左侧详情面板 */}
        <div className="operator-detail-left">
          <div className="operator-info">
            {/* 算子名称 */}
            <div className="operator-section">
              <h4>算子名称：</h4>
              <p>{toolDetailData.name}</p>
            </div>

            {/* 算子介绍 */}
            <div className="operator-section">
              <h4>算子介绍：</h4>
              <p>{toolDetailData.description}</p>
            </div>

            {/* 处理逻辑 */}
            <div className="operator-section">
              <h4>处理逻辑：</h4>
              <p>{toolDetailData.detail}</p>
            </div>

            {/* 输入输出 */}
            <div className="operator-section">
              <h4>输入输出：</h4>
              <div className="io-container">
                <div className="io-item">
                  <span className="io-label flex-shrink-0">输入:</span>
                  <span className="io-value whitespace-pre-wrap break-words">
                    {toolDetailData.usage.input}
                  </span>
                </div>
                <div className="io-item">
                  <span className="io-label flex-shrink-0">输出:</span>
                  <span className="io-value whitespace-pre-wrap break-words">
                    {toolDetailData.usage.output}
                  </span>
                </div>
              </div>
            </div>

            {/* 应用场景 */}
            <div className="operator-section">
              <h4>应用场景：</h4>
              <p>{toolDetailData.usage_scenarios}</p>
              {/* 标签 */}
              <Space wrap>
                {toolDetailData.tags.map((tag, index) => (
                  <Tag
                    key={index}
                    style={{
                      borderRadius: '4px',
                      color: '#0F172A',
                      backgroundColor: '#E7ECF0'
                    }}
                  >
                    {tag}
                  </Tag>
                ))}
              </Space>
            </div>
          </div>
        </div>

        {/* 右侧代码编辑器 */}
        <div className="operator-detail-right">
          <div className="code-editor-container">
            <Button
              type="outline"
              icon={<IconCopy />}
              onClick={handleCopyCode}
              className="copy-button"
            >
              复制代码
            </Button>
            <div className="code-textarea">{toolDetailData.sample_code}</div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ModalToolDetail;
