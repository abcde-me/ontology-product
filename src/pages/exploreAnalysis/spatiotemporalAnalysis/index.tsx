import React, { useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import { SECONDARY_MENU_ITEMS } from '@/config/secondaryMenuItems';
import { removeStaleArcoOverlays } from '@/utils/removeStaleArcoOverlays';
import SpatiotemporalWorkspace from './components/SpatiotemporalWorkspace';
import styles from './index.module.scss';

export default function SpatiotemporalAnalysisPage() {
  useEffect(() => {
    return () => {
      removeStaleArcoOverlays();
    };
  }, []);

  return (
    <div className={styles.page}>
      <PageHeader
        className={styles.pageHeader}
        title={SECONDARY_MENU_ITEMS.SpatiotemporalAnalysis}
        subTitle="选择本体场景与对象实例，基于时空属性进行轨迹、聚集、区域、迁徙与演化分析"
      />
      <div className={styles.pageContent}>
        <SpatiotemporalWorkspace />
      </div>
    </div>
  );
}
