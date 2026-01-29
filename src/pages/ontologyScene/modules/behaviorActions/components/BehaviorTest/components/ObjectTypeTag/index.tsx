import React from 'react';
import { Tag } from '@arco-design/web-react';

interface ObjectTypeTagProps {
  type: string;
}

// 对象类型颜色映射
const colorMap: Record<string, string> = {
  多媒体情报: 'purple',
  作战单元: 'orange',
  作战编队: 'magenta',
  战术预案: 'cyan'
};

export const ObjectTypeTag: React.FC<ObjectTypeTagProps> = ({ type }) => {
  const color = colorMap[type] || 'blue';

  return (
    <Tag color={color} size="small">
      {type}
    </Tag>
  );
};
