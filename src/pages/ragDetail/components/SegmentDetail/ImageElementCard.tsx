/**
 * Image Element Card Component
 * 图片元素卡片组件
 */

import React, { useState } from 'react';
import { Modal } from '@arco-design/web-react';
import { IconCopy } from '@arco-design/web-react/icon';
import type { ImageElement } from '../../types';
import ElementEnhancedInfo from './ElementEnhancedInfo';

interface ImageElementCardProps {
  element: ImageElement;
  isEditing: boolean;
}

const ImageElementCard: React.FC<ImageElementCardProps> = ({
  element,
  isEditing
}) => {
  const [previewVisible, setPreviewVisible] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // TODO: 显示复制成功提示
  };

  const handleImageClick = () => {
    setPreviewVisible(true);
  };

  return (
    <>
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
        <div className="mb-3 flex items-center">
          <span className="inline-flex items-center rounded bg-purple-50 px-2 py-1 text-xs font-medium text-purple-600">
            图片
          </span>
          <span className="ml-2 text-sm text-gray-600">
            元素ID: {element.id}
          </span>
        </div>

        <div className="mb-3 flex items-center gap-2">
          <button
            onClick={handleImageClick}
            className="cursor-pointer text-sm text-blue-600 hover:underline"
          >
            {element.url}
          </button>
          <button
            onClick={() => handleCopy(element.url)}
            className="text-gray-400 hover:text-gray-600"
          >
            <IconCopy />
          </button>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex">
            <span className="w-20 text-gray-500">定位类型:</span>
            <span className="text-gray-900">{element.positionType}</span>
          </div>
          <div className="flex">
            <span className="w-20 text-gray-500">位置信息:</span>
            <span className="text-gray-900">{element.positionInfo}</span>
          </div>
          <div className="flex">
            <span className="w-20 text-gray-500">尺寸:</span>
            <span className="text-gray-900">{element.dimensions}</span>
          </div>
          <div className="flex">
            <span className="w-20 text-gray-500">修饰:</span>
            <span className="text-gray-900">{element.modifiers || '-'}</span>
          </div>
        </div>

        <ElementEnhancedInfo element={element} isEditing={isEditing} />
      </div>

      {/* 图片预览弹窗 */}
      <Modal
        visible={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        style={{ width: 'auto', maxWidth: '90vw' }}
      >
        <div className="flex items-center justify-center p-4">
          <img
            src={element.url}
            alt="预览"
            style={{
              maxWidth: '100%',
              maxHeight: '80vh',
              objectFit: 'contain'
            }}
          />
        </div>
      </Modal>
    </>
  );
};

export default ImageElementCard;
