import React from 'react';
import BasicInfo from './BasicInfo';
import AnnotationConfig from './AnnotationConfig';
import QualityConfig from './QualityConfig';
import DistributConfig from './DistributConfig';

function RequirementDetail({ requirementDetail }: { requirementDetail: any }) {
  return (
    <>
      <BasicInfo requirementDetail={requirementDetail} />
      <AnnotationConfig requirementDetail={requirementDetail} />
      <QualityConfig requirementDetail={requirementDetail} />
      <DistributConfig requirementDetail={requirementDetail} />
    </>
  );
}
export default RequirementDetail;
