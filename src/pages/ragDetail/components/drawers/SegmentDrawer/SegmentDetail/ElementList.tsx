/**
 * Element List Component
 * 元素列表组件
 */

import React from 'react';
import type { Element } from '../../../../types';
import TextElementCard from './TextElementCard';
import ImageElementCard from './ImageElementCard';
import TableElementCard from './TableElementCard';

interface ElementListProps {
  elements: Element[];
  isEditing: boolean;
}

const ElementList: React.FC<ElementListProps> = ({ elements, isEditing }) => {
  const renderElement = (element: Element) => {
    switch (element.type) {
      case 'text':
        return (
          <TextElementCard
            key={element.id}
            element={element}
            isEditing={isEditing}
          />
        );
      case 'image':
        return (
          <ImageElementCard
            key={element.id}
            element={element}
            isEditing={isEditing}
          />
        );
      case 'table':
        return (
          <TableElementCard
            key={element.id}
            element={element}
            isEditing={isEditing}
          />
        );
      default:
        return null;
    }
  };

  return <div>{elements.map((element) => renderElement(element))}</div>;
};

export default ElementList;
