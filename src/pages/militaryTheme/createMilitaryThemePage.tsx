import React from 'react';
import ComingSoonPage from '@/components/ComingSoonPage';

/** 军事主题占位页工厂，便于批量扩展二级场景 */
export default function createMilitaryThemePage(
  title: string,
  subTitle: string
) {
  const Page: React.FC = () => (
    <ComingSoonPage title={title} subTitle={subTitle} />
  );
  Page.displayName = `MilitaryThemePage(${title})`;
  return Page;
}
