import React from 'react';
import { BehaviorActionItem } from '@/pages/ontologyScene/types/behavior_actions';

interface IProps {
  show: boolean;
  onClose: () => void;
  data?: BehaviorActionItem;
}

export const BehaviorDetail = () => {
  return (
    <div>
      <h1>BehaviorDetail</h1>
    </div>
  );
};
