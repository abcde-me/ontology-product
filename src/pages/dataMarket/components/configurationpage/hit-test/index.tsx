import React, { useEffect, useState } from 'react';
import styles from './index.module.scss';
import PageContentFalse from '../compontents/hitTest/index';
import { useLocation } from 'react-router-dom';
import { getknowledgeBaseDetails } from '@/api/datasetsV2';

function HitTest() {
  const location = useLocation();
  const [record, setrecord] = useState<string>('');
  const [detailsdata, setdetailsdata] = useState({});
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('id');
    if (id) {
      setrecord(id);
      init(id);
    }
  }, [location]);
  const init = async (id: string) => {
    if (!id) return;
    try {
      const documentList = await getknowledgeBaseDetails(id); //知识库详情
      if (!documentList.data) return;
      setdetailsdata(documentList.data);
    } catch {}
  };
  const onInit = () => {
    init(record);
  };
  return (
    <div className={styles.hitTest}>
      <PageContentFalse
        onInit={onInit}
        detailsdata={detailsdata}
      ></PageContentFalse>
    </div>
  );
}
export default HitTest;
