/**
 * Element List Component
 * 元素列表组件
 */

import React from 'react';
import type {
  Element,
  TextElement,
  ImageElement,
  TableElement,
  FormulaElement
} from '../../../../types';
import TextElementCard from './TextElementCard';
import ImageElementCard from './ImageElementCard';
import TableElementCard from './TableElementCard';
import FormulaElementCard from './FormulaElement';

interface ElementListProps {
  elements: Element[];
  isEditing: boolean;
}

const ElementList: React.FC<ElementListProps> = ({ elements, isEditing }) => {
  const renderElement = (element: Element) => {
    // 将 type 转换为小写进行匹配，兼容后端返回的大小写变化
    const elementType = element.type.toLowerCase();

    switch (elementType) {
      case 'text':
        return (
          <TextElementCard
            key={element.id}
            element={element as TextElement}
            isEditing={isEditing}
          />
        );
      case 'image':
        return (
          <ImageElementCard
            key={element.id}
            element={element as ImageElement}
            isEditing={isEditing}
          />
        );
      case 'table':
        return (
          <TableElementCard
            key={element.id}
            element={element as TableElement}
            isEditing={isEditing}
          />
        );
      case 'formula':
        return (
          <FormulaElementCard
            key={element.id}
            element={element as FormulaElement}
            isEditing={isEditing}
          />
        );
      default:
        console.warn(`Unknown element type: ${element.type}`);
        return null;
    }
  };

  return <div>{elements.map((element) => renderElement(element))}</div>;
};

export default ElementList;
