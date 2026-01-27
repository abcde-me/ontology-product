import { Checkbox, Input, Radio } from '@arco-design/web-react';
import React from 'react';
import { LabelData } from '../../type';
import './LabelPreview.scss';
import { EllipsisPopover } from '@ceai-front/arco-material';

interface LabelPreviewProps {
  labelDataList: LabelData[];
}

const LabelPreview: React.FC<LabelPreviewProps> = ({ labelDataList }) => {
  return (
    <div className="label-preview-container">
      {labelDataList?.map((label, labelIndex) => (
        <div
          key={label.label_id || labelIndex}
          className="label-preview-item"
          style={{ borderLeftColor: label.label_colour || '#165DFF' }}
        >
          {/* 标签行 */}
          <div className="label-preview-row">
            <div className="label-preview-label">
              <span className="label-index">#{labelIndex + 1}</span>
              <span className="label-text">标签：</span>
            </div>
            <div className="label-preview-content">
              <Input
                value={label.label_name_cn || label.label_name_en}
                readOnly
                style={{ pointerEvents: 'none' }}
              />
            </div>
          </div>

          {/* 属性组列表 */}
          {label.label_info_attribute_groups?.map((attrGroup, groupIndex) => (
            <div
              key={attrGroup.attribute_id || groupIndex}
              className="label-preview-row"
            >
              <div className="label-preview-label">
                {attrGroup.attribute_group_type === 1 && (
                  <span className="required-mark">*</span>
                )}
                <span className="label-text">
                  <EllipsisPopover
                    value={`${attrGroup.attribute_group_name}：`}
                  />
                </span>
              </div>
              <div className="label-preview-content">
                {/* 单选 */}
                {attrGroup.attribute_group_class === 1 && (
                  <Radio.Group direction="vertical">
                    {attrGroup.label_info_attribute?.map((attr, attrIndex) =>
                      attr.input_type === 2 ? (
                        <div
                          key={attr.label_info_id || attrIndex}
                          className="checkbox-with-input"
                        >
                          <Radio value={attr.attribute_name_en}>
                            {attr.attribute_name_cn || attr.attribute_name_en}
                          </Radio>
                          <Input
                            readOnly
                            placeholder="请输入属性"
                            style={{ pointerEvents: 'none' }}
                          />
                        </div>
                      ) : (
                        <Radio
                          key={attr.label_info_id || attrIndex}
                          value={attr.attribute_name_en}
                        >
                          {attr.attribute_name_cn || attr.attribute_name_en}
                        </Radio>
                      )
                    )}
                  </Radio.Group>
                )}

                {/* 多选 */}
                {attrGroup.attribute_group_class === 2 && (
                  <Checkbox.Group direction="vertical">
                    {attrGroup.label_info_attribute?.map((attr, attrIndex) =>
                      attr.input_type === 2 ? (
                        <div
                          key={attr.label_info_id || attrIndex}
                          className="checkbox-with-input"
                        >
                          <Checkbox value={attr.attribute_name_en}>
                            {attr.attribute_name_cn || attr.attribute_name_en}
                          </Checkbox>
                          <Input
                            readOnly
                            placeholder="请输入属性"
                            style={{ pointerEvents: 'none' }}
                          />
                        </div>
                      ) : (
                        <Checkbox
                          key={attr.label_info_id || attrIndex}
                          value={attr.attribute_name_en}
                        >
                          {attr.attribute_name_cn || attr.attribute_name_en}
                        </Checkbox>
                      )
                    )}
                  </Checkbox.Group>
                )}

                {/* 输入框 */}
                {attrGroup.attribute_group_class === 3 && (
                  <Input.TextArea
                    readOnly
                    placeholder="请输入"
                    style={{ resize: 'vertical', pointerEvents: 'none' }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default LabelPreview;
