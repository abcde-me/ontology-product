import React from 'react';
import PageHeaderBase from '@/components/PageHeader';

interface PageHeaderProps {
  title: string;
  subTitle?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subTitle }) => (
  <PageHeaderBase title={title} subTitle={subTitle} />
);
