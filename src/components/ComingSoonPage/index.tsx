import React from 'react';
import PageHeader from '@/components/PageHeader';
import NoDataEmpty from '@/components/NoDataEmpty';

interface ComingSoonPageProps {
  title: string;
  subTitle?: string;
}

export default function ComingSoonPage({
  title,
  subTitle = '功能建设中，敬请期待'
}: ComingSoonPageProps) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-white p-6">
      <PageHeader title={title} subTitle={subTitle} />
      <div className="flex flex-1 items-center justify-center">
        <NoDataEmpty text="待开发，敬请期待" />
      </div>
    </div>
  );
}
