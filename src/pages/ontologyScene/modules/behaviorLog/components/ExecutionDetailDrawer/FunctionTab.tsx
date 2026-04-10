import React from 'react';
import { PyCodeContent } from '@/pages/ontologyScene/components';
import { NoDataCard } from '@ceai-front/arco-material';

interface FunctionTabProps {
  code: string;
  loading?: boolean;
}

export const FunctionTab: React.FC<FunctionTabProps> = ({ code, loading }) => {
  if (loading) {
    return <div className="py-10 text-center text-gray-400">加载中...</div>;
  }

  if (!code) {
    return (
      <div className="mt-4">
        <NoDataCard title="暂无函数代码" />
      </div>
    );
  }

  return (
    <div className="mt-4 overflow-auto" style={{ maxHeight: '600px' }}>
      <PyCodeContent value={code} readOnly />
    </div>
  );
};
