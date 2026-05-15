import React from 'react';
import { Link } from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import { NoDataCard } from '@ceai-front/arco-material';

interface EmptyStateProps {
  onCreateClick: () => void;
}

/**
 * 空状态组件
 */
const EmptyState: React.FC<EmptyStateProps> = ({ onCreateClick }) => {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#f8f9fc]">
      <NoDataCard
        title="您还没有本体场景"
        primaryBtn={
          <Link onClick={onCreateClick} icon={<IconPlus />}>
            创建本体场景
          </Link>
        }
        isTextButton
      />
    </div>
  );
};

export default EmptyState;
