import React from 'react';
import ImageLabelInfo from './ImageLabelInfo';
import TextClassifyLabelInfo from './TextClassifyLabelInfo';
import TextEntityLabelInfo from './TextEntityLabelInfo';
function LabelInfo({
  requirementDetail,
  labelToolCode
}: {
  requirementDetail: any;
  labelToolCode: string;
}) {
  const hasModel = !!requirementDetail?.model_id;

  switch (labelToolCode) {
    case 'IMAGE_ANNOTATION':
      return (
        <ImageLabelInfo
          labelInfo={requirementDetail?.labels}
          hasModel={hasModel}
        />
      );
    case 'TEXT_CLASSIFICATION':
      return (
        <TextClassifyLabelInfo labelInfo={requirementDetail?.file_labels} />
      );
    case 'TEXT_ENTITY':
      return (
        <TextEntityLabelInfo
          labelInfo={requirementDetail?.labels}
          entityRelations={requirementDetail?.entity_relations}
        />
      );
    default:
      return <></>;
  }
}
export default LabelInfo;
