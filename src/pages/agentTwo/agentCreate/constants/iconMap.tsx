import React from 'react';
import DeepSeekIcon from '@/assets/deepseek.svg';

const MODEL_ICON_MAP: Record<string, React.FC> = {
  'deepseek-chat': DeepSeekIcon
  // 可以在这里添加更多模型的图标映射
};

export default MODEL_ICON_MAP;
