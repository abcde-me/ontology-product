import React from 'react';
import { PyCodeContent } from '@/pages/ontologyScene/componens';
import { NoDataCard } from '@ceai-front/arco-material';

interface LogsTabProps {
  logs: string;
  loading?: boolean;
}

export const LogsTab: React.FC<LogsTabProps> = ({ logs, loading }) => {
  if (loading) {
    return <div className="py-10 text-center text-gray-400">加载中...</div>;
  }

  if (!logs) {
    return (
      <div className="mt-4">
        <NoDataCard title="暂无日志" />
      </div>
    );
  }

  return (
    <div className="mt-4">
      <PyCodeContent value={logs} readOnly />
    </div>
  );
};
