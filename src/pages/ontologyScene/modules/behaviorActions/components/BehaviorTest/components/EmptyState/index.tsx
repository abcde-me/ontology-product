import React from 'react';
import { Button } from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';

interface EmptyStateProps {
  onCreateBehavior?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onCreateBehavior }) => {
  return (
    <div className="flex h-full w-full items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center justify-center">
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="60" cy="60" r="50" fill="#F7F8FA" />
            <path
              d="M60 40V80M40 60H80"
              stroke="#C9CDD4"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="text-center text-sm text-[#86909c]">
          您还没有行为，暂不能进行行为测试
        </div>
        <Button
          type="primary"
          icon={<IconPlus />}
          size="large"
          onClick={onCreateBehavior}
        >
          创建行为
        </Button>
      </div>
    </div>
  );
};
