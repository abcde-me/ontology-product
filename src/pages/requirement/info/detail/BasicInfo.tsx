import React from 'react';
import { InfoDescription, EllipsisPopover } from '@ceai-front/arco-material';

function BasicInfo({ requirementDetail }: { requirementDetail: any }) {
  const basicInfoData = [
    {
      title: '基本信息',
      items: [
        {
          label: '需求名称',
          value: requirementDetail?.name
        },
        {
          label: '描述说明',
          value: <EllipsisPopover value={requirementDetail?.description} />
        }
      ]
    }
  ];
  return (
    <InfoDescription
      data={basicInfoData}
      column={2}
      titleStyle={{ fontSize: '16px', fontWeight: 'normal' }}
    />
  );
}
export default BasicInfo;
