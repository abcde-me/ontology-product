import React from 'react';
import { Radio, Tooltip } from '@arco-design/web-react';
import { DISCOVERY_ALGORITHM_OPTIONS } from '../constants';
import type { ImplicitDiscoveryAlgorithm } from '../types';

interface DiscoveryAlgorithmRadioGroupProps {
  value?: ImplicitDiscoveryAlgorithm;
  onChange?: (value: ImplicitDiscoveryAlgorithm) => void;
}

export default function DiscoveryAlgorithmRadioGroup({
  value,
  onChange
}: DiscoveryAlgorithmRadioGroupProps) {
  return (
    <Radio.Group value={value} onChange={onChange}>
      {DISCOVERY_ALGORITHM_OPTIONS.map((option) => (
        <Radio key={option.value} value={option.value}>
          <Tooltip content={option.description} position="top">
            <span>{option.label}</span>
          </Tooltip>
        </Radio>
      ))}
    </Radio.Group>
  );
}
