import React, { useEffect, useRef, useState } from 'react';

import { Button } from '@arco-design/web-react';
import './AnnotationType.scss';

const typeList = [
  {
    label: '图片',
    value: 1
  },
  {
    label: '文本',
    value: 2
  },
  {
    label: '音频',
    value: 3
  },
  {
    label: '视频',
    value: 4
  }
];
const btnPicData = [{ key: 1, label: '图片', code: 'IMAGE_ANNOTATION' }];
const btnTextData = [
  { key: 1, label: '实体/实体关系', code: 'TEXT_ENTITY' },
  { key: 2, label: '文本分类', code: 'TEXT_CLASSIFICATION' },
  { key: 3, label: '问答', code: 'TEXT_QA' },
  { key: 4, label: '文本排序', code: 'TEXT_SORT' }
];
interface AnnotationTypeProps {
  isDisabled: boolean;
  label_type: number;
  label_tool: {
    label_tool_name: number;
    label_tool_code: number;
  };
  getChildAnnotationType: (
    selectedRadio: number,
    activeKey: number,
    annotationTypeContentCode: string
  ) => void;
}
const AnnotationType: React.FC<AnnotationTypeProps> = ({
  isDisabled,
  label_type,
  label_tool,
  getChildAnnotationType
}) => {
  // 标注类型当前选择项
  const [selectedRadio, setSelectedRadio] = useState(label_type || 1);
  // 标注工具
  const [activeKey, setActiveKey] = useState(label_tool?.label_tool_code || 1);
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
    getChildAnnotationType(selectedRadio, activeKey, annotationTypeContentCode);
  }, [selectedRadio, activeKey, annotationTypeContentCode]);

  // 头部点击事件
  const headerItemClick = (item) => {
    setSelectedRadio(item.value);
    setActiveKey(1);
    if (item?.value === 1) {
      setAnnotationTypeContentCode('IMAGE_ANNOTATION');
    }
    if (item?.value === 2) {
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
        {selectedRadio === 1
          ? btnPicData.map((item) => {
              return (
                <div
                  className={`mutex-btn ${activeKey === item.key ? 'active' : ''}`}
                  onClick={() => {
                    handleBtnClick(item.key);
                    setAnnotationTypeContentCode(item.code);
                  }}
                  key={item.key}
                >
                  {item.label}
                </div>
              );
            })
          : null}
        {selectedRadio === 2
          ? btnTextData.map((item) => {
              return (
                <div
                  className={`mutex-btn ${activeKey === item.key ? 'active' : ''}`}
                  onClick={() => {
                    handleBtnClick(item.key);
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
