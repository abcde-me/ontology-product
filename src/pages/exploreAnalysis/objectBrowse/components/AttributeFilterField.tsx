import React from 'react';
import { Form, Input } from '@arco-design/web-react';
import { getFieldQueryPlaceholder } from '../utils/fieldQueryType';
import type { QueryableProperty } from '../types';
import { RangeFilterInput } from './RangeFilterInput';

interface AttributeFilterFieldProps {
  property: QueryableProperty;
}

export const AttributeFilterField: React.FC<AttributeFilterFieldProps> = ({
  property
}) => {
  const fieldKey = `attributes.${property.fieldName}`;

  if (property.queryType === 'range') {
    return (
      <Form.Item label={property.label} field={fieldKey}>
        <RangeFilterInput />
      </Form.Item>
    );
  }

  return (
    <Form.Item label={property.label} field={fieldKey}>
      <Input
        allowClear
        placeholder={getFieldQueryPlaceholder(
          property.label,
          property.queryType
        )}
      />
    </Form.Item>
  );
};
