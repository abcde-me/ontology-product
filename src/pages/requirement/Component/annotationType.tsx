import React, { useEffect, useRef, useState } from 'react';

import { Button } from '@arco-design/web-react';
import './index.scss';

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
const btnPicData = [{ key: 1, label: '图片' }];
const btnTextData = [
  { key: 1, label: '实体/实体关系' },
  { key: 2, label: '文本分类' },
  { key: 3, label: '问答' },
  { key: 4, label: '文本排序' }
];
interface AnnotationTypeProps {
  label_type: number;
  label_tool: {
    label_tool_name: number;
    label_tool_code: number;
  };
  getChildAnnotationType: (selectedRadio: number, activeKey: number) => void;
}

const AnnotationType: React.FC<AnnotationTypeProps> = ({
  label_type,
  label_tool,
  getChildAnnotationType
}) => {
  const [selectedRadio, setSelectedRadio] = useState(label_type || 1);
  const [activeKey, setActiveKey] = useState(label_tool?.label_tool_code || 1);
  const handleBtnClick = (key) => {
    if (key !== activeKey) {
      // 避免重复点击触发更新
      setActiveKey(key);
    }
  };
  useEffect(() => {
    getChildAnnotationType(selectedRadio, activeKey);
  }, [selectedRadio, activeKey]);
  return (
    <div className="annotation-type-warp">
      <div className="type-header">
        {typeList.map((item) => {
          return (
            <div
              className={[
                'item-base-class',
                selectedRadio === item.value ? 'active' : ''
              ].join(' ')}
              onClick={() => {
                (setSelectedRadio(item.value), setActiveKey(1));
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
