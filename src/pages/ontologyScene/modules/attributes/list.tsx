import React from 'react';
import NormalTable from './components/NormalTable';
import styles from './list.module.scss';

export default function OntologySceneAttributesList() {
  return (
    <div className={styles['attributes-list']}>
      <div>
        <div className="mb-1 font-PingFangSc text-[20px] font-[600] leading-[30px] text-default">
          属性
        </div>
        <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#334155]">
          属性映射物理字段并关联公共属性以实现语义标准化,公共属性则定义统一的语义标准
        </div>
      </div>
      <div className={styles['attributes-content']}>
        <NormalTable />
      </div>
    </div>
  );
}
