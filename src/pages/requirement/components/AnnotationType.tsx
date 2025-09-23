import React, { useEffect, useRef, useState } from 'react';

import './AnnotationType.scss';
import { AnnotationTypeStatus } from '../type';

const typeList = [
  {
    label: '图片',
    value: AnnotationTypeStatus.IMAGE
  },
  {
    label: '文本',
    value: AnnotationTypeStatus.TEXT
  },
  {
    label: '音频',
    value: AnnotationTypeStatus.AUDIO
  },
  {
    label: '视频',
    value: AnnotationTypeStatus.VIDEO
  }
];
const btnPicData = [
  { key: 2, value: 2, label: '图片标注', code: 'IMAGE_ANNOTATION' }
];
const btnTextData = [
  { key: 1, value: 1, label: '实体/实体关系', code: 'TEXT_ENTITY' },
  { key: 2, value: 2, label: '分类', code: 'TEXT_CLASSIFICATION' },
  { key: 3, value: 3, label: '问答', code: 'TEXT_QA' },
  { key: 4, value: 4, label: '排序', code: 'TEXT_SORT' }
];
interface AnnotationTypeProps {
  isDisabled: boolean;
  label_type: number;
  label_tool_code: string;
  getChildAnnotationType: (
    selectedRadio: number,
    activeKey: string | number,
    annotationTypeContentCode: string
  ) => void;
}
const AnnotationType: React.FC<AnnotationTypeProps> = ({
  isDisabled,
  label_type,
  label_tool_code,
  getChildAnnotationType
}) => {
  // 标注类型当前选择项
  const [selectedRadio, setSelectedRadio] = useState(label_type || 2);
  // 标注工具
  const [activeKey, setActiveKey] = useState<string | number>(
    label_tool_code || 'IMAGE_ANNOTATION'
  );
  // 当前标注类型选择内容
  const [annotationTypeContentCode, setAnnotationTypeContentCode] =
    useState('IMAGE_ANNOTATION');
  const handleBtnClick = (key) => {
    if (key !== activeKey) {
      // 避免重复点击触发更新
      setActiveKey(key);
    }
  };
  useEffect(() => {
    setSelectedRadio(label_type);
    setActiveKey(label_tool_code);
  }, [label_type, label_tool_code]);
  useEffect(() => {
    getChildAnnotationType(selectedRadio, activeKey, annotationTypeContentCode);
  }, [selectedRadio, activeKey, annotationTypeContentCode]);

  // 头部点击事件
  const headerItemClick = (item) => {
    setSelectedRadio(item.value);
    if (item?.value === 2) {
      setActiveKey('IMAGE_ANNOTATION');
      setAnnotationTypeContentCode('IMAGE_ANNOTATION');
    }
    if (item?.value === 1) {
      setActiveKey('TEXT_ENTITY');
      setAnnotationTypeContentCode('TEXT_ENTITY');
    }
  };
  return (
    <div className="annotation-type-warp">
      <div
        className={['type-header', isDisabled ? 'disabled-div' : ''].join(' ')}
      >
        {typeList.map((item) => {
          return (
            <div
              className={[
                'item-base-class',
                selectedRadio === item.value ? 'active' : '',
                item.value > 2 ? 'disabled-div' : ''
              ].join(' ')}
              onClick={() => {
                headerItemClick(item);
              }}
              key={item.value}
            >
              {item.label}
            </div>
          );
        })}
      </div>
      <div className="type-content">
        {selectedRadio === 2
          ? btnPicData.map((item) => {
              return (
                <div
                  className={`mutex-btn ${activeKey === item.code ? 'active' : ''}`}
                  onClick={() => {
                    handleBtnClick(item.code);
                    setAnnotationTypeContentCode(item.code);
                  }}
                  key={item.value}
                >
                  {item.label}
                </div>
              );
            })
          : null}
        {selectedRadio === 1
          ? btnTextData.map((item) => {
              return (
                <div
                  className={`mutex-btn ${activeKey === item.code || activeKey === item.key ? 'active' : ''} ${isDisabled ? 'disabled-div' : ''}`}
                  onClick={() => {
                    handleBtnClick(item.code);
                    setAnnotationTypeContentCode(item.code);
                  }}
                  key={item.key}
                >
                  {item.label}
                </div>
              );
            })
          : null}
      </div>
      <div></div>
    </div>
  );
};
export default AnnotationType;
