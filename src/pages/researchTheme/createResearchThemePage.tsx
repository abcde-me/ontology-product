import React from 'react';
import ComingSoonPage from '@/components/ComingSoonPage';

/** 科研主题占位页工厂 */
export default function createResearchThemePage(
  title: string,
  subTitle: string
) {
  const Page: React.FC = () => (
    <ComingSoonPage title={title} subTitle={subTitle} />
  );
  Page.displayName = `ResearchThemePage(${title})`;
  return Page;
}
