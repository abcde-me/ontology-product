/**
 * Image Element Card Component
 * 图片元素卡片组件
 */

import React from 'react';
import { Message } from '@arco-design/web-react';
import { IconCopy } from '@arco-design/web-react/icon';
import type { ImageElement } from '../../../../types';
import { previewUrl } from '@/api/modules/rag';
import { useRagDetailStore } from '../../../../store/ragDetailStore';

interface ImageElementCardProps {
  element: ImageElement;
  isEditing: boolean;
}

const ImageElementCard: React.FC<ImageElementCardProps> = ({
  element,
  isEditing
}) => {
  const { openImageModal } = useRagDetailStore();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    Message.success('复制成功');
  };

  const handleImageClick = async () => {
    // 如果有 bucketName 和 path，调用 API 获取预览 URL
    console.log('element', element);
    if (element.bucketName && element.path) {
      try {
        const response = await previewUrl({
          bucket_name: element.bucketName,
          path: element.path
        });

        if (response.data?.url) {
          openImageModal(response.data.url);
        } else {
          Message.error('获取图片预览地址失败');
        }
      } catch (error) {
        console.error('获取图片预览地址失败:', error);
        Message.error('获取图片预览地址失败');
      }
    } else {
      // 如果没有 bucketName 和 path，直接使用 element.url
      openImageModal(element.url);
    }
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

        <div className="flex items-center gap-6 text-sm">
          {/* {element.positionType && (
            <span className="text-gray-900">
              <span className="text-gray-500">定位类型:</span>
              {element.positionType}
            </span>
          )}
          {element.positionInfo && (
            <span className="text-gray-900">
              <span className="text-gray-500">位置信息:</span>
              {element.positionInfo}
            </span>
          )} */}
          {/* {(element as any).pageId && (
            <span className="text-gray-900">
              <span className="text-gray-500">页码:</span>
              {(element as any).pageId}
            </span>
          )}
          {element.dimensions && (
            <span className="text-gray-900">
              <span className="text-gray-500">尺寸:</span>
              {element.dimensions}
            </span>
          )}
          {element.modifiers && (
            <span className="text-gray-900">
              <span className="text-gray-500">修饰:</span>
              {element.modifiers}
            </span>
          )} */}
        </div>

        {/* <ElementEnhancedInfo element={element} isEditing={isEditing} /> */}
      </div>
    </>
  );
};

export default ImageElementCard;
