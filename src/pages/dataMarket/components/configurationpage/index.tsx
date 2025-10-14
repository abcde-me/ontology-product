import React, { useEffect, useState } from 'react';
import './index.less';
import { IconDriveFile, IconLeft, IconMore } from '@arco-design/web-react/icon';
import { Radio } from '@arco-design/web-react';
import Header from './compontents/header/index';
import PageContentTrue from './compontents/fileSegmentation/index';
import PageContentFalse from './compontents/hitTest/index';
import { useLocation } from 'react-router-dom';
import { getknowledgeBaseDetails, postHitTest } from '@/api/datasetsV2';

function ConfigurationPage(props) {
  const location = useLocation();
  const RadioGroup = Radio.Group;
  const [selectedValue, setSelectedValue] = useState('true');
  const [record, setrecord] = useState<any>('');
  const [detailsdata, setdetailsdata] = useState({});
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('id');
    if (id) {
      setrecord(id);
      init(id);
    }
  }, [location]);
  const init = async (id) => {
    if (!id) return;
    try {
      // const hitTestdata = await postHitTest(id);

      const documentList = await getknowledgeBaseDetails(id); //知识库详情

      setdetailsdata(documentList.data);
    } catch {}
  };
  const handleSelectedValueChange = (newValue) => {
    setSelectedValue(newValue);
  };
  const onInit = () => {
    init(record);
  };
  return (
    <div className="configurationPage">
      <Header
        detailsdata={detailsdata}
        selectedValue={selectedValue}
        onSelectedValueChange={handleSelectedValueChange}
      ></Header>
      {selectedValue === 'true' ? (
        <PageContentTrue
          detailsdata={detailsdata}
          onInit={onInit}
        ></PageContentTrue>
      ) : (
        <PageContentFalse
          onInit={onInit}
          detailsdata={detailsdata}
        ></PageContentFalse>
      )}
    </div>
  );
}
export default ConfigurationPage;
