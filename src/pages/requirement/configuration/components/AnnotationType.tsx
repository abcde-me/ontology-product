import React, { useEffect, useRef, useState } from 'react';

import './AnnotationType.scss';
import { AnnotationTypeStatus } from '../../type';
import { Tooltip } from '@arco-design/web-react';
import ImageAnnotationIcon from '../../image/Image.png';
import ImageClassificationIcon from '../../image/Image-Classification.jpg';
import TextClassificationIcon from '../../image/Text-Classification.png';
import TextEntityIcon from '../../image/Text-Entity.png';
import TextSortIcon from '../../image/Text-Sort.png';
import TextQAIcon from '../../image/Text-QA.png';
import AudioClassificationIcon from '../../image/Audio-Classification.png';
import AudioSplitIcon from '../../image/Audio-Split.png';
import VideoClassificationIcon from '../../image/Video-Classification.png';
import VideoSplitIcon from '../../image/Video-Split.png';

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
  {
    key: 2,
    value: 2,
    label: '图形',
    code: 'IMAGE_ANNOTATION',
    icon: ImageAnnotationIcon
  },
  {
    key: 1,
    value: 1,
    label: '分类',
    code: 'IMAGE_CLASSIFICATION',
    icon: ImageClassificationIcon
  }
];
const btnTextData = [
  {
    key: 1,
    value: 1,
    label: '实体/实体关系',
    code: 'TEXT_ENTITY',
    icon: TextEntityIcon
  },
  {
    key: 2,
    value: 2,
    label: '分类',
    code: 'TEXT_CLASSIFICATION',
    icon: TextClassificationIcon
  },
  { key: 3, value: 3, label: '问答', code: 'TEXT_QA', icon: TextQAIcon },
  { key: 4, value: 4, label: '排序', code: 'TEXT_SORT', icon: TextSortIcon }
];
const btnAudioData = [
  {
    key: 1,
    value: 1,
    label: '分类',
    code: 'AUDIO_CLASSIFICATION',
    icon: AudioClassificationIcon
  },
  {
    key: 2,
    value: 2,
    label: '分割',
    code: 'AUDIO_SPLIT',
    icon: AudioSplitIcon
  }
];
const btnVideoData = [
  {
    key: 1,
    value: 1,
    label: '分类',
    code: 'VIDEO_CLASSIFICATION',
    icon: VideoClassificationIcon
  },
  {
    key: 2,
    value: 2,
    label: '分割',
    code: 'VIDEO_SPLIT',
    icon: VideoSplitIcon
  }
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
    // 同步更新 annotationTypeContentCode
    if (label_tool_code) {
      setAnnotationTypeContentCode(label_tool_code);
    }
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
    if (item?.value === 3) {
      setActiveKey('AUDIO_CLASSIFICATION');
      setAnnotationTypeContentCode('AUDIO_CLASSIFICATION');
    }
    if (item?.value === 4) {
      setActiveKey('VIDEO_CLASSIFICATION');
      setAnnotationTypeContentCode('VIDEO_CLASSIFICATION');
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
                item.value > 4 || isDisabled ? 'disabled-div' : ''
              ].join(' ')}
              onClick={() => {
                if (item?.value > 4 || isDisabled) {
                  return;
                }
                headerItemClick(item);
              }}
              key={item.value}
            >
              {item?.value > 4 ? (
                <Tooltip content="功能开发中，敬请期待">
                  <div>{item?.label}</div>
                </Tooltip>
              ) : (
                item.label
              )}
            </div>
          );
        })}
      </div>
      <div className="type-content">
        {selectedRadio === 4
          ? btnVideoData.map((item) => {
              const isActive =
                activeKey === item.code || activeKey === item.key;
              return (
                <div
                  className={`annotation-card ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
                  onClick={() => {
                    if (isDisabled) {
                      return;
                    }
                    handleBtnClick(item.code);
                    setAnnotationTypeContentCode(item.code);
                  }}
                  key={item.key}
                >
                  <div className="card-image">
                    <img src={item.icon} alt={item.label} />
                  </div>
                  <div className="card-label">{item.label}</div>
                </div>
              );
            })
          : null}
        {selectedRadio === 3
          ? btnAudioData.map((item) => {
              const isActive =
                activeKey === item.code || activeKey === item.key;
              return (
                <div
                  className={`annotation-card ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
                  onClick={() => {
                    if (isDisabled) {
                      return;
                    }
                    handleBtnClick(item.code);
                    setAnnotationTypeContentCode(item.code);
                  }}
                  key={item.key}
                >
                  <div className="card-image">
                    <img src={item.icon} alt={item.label} />
                  </div>
                  <div className="card-label">{item.label}</div>
                </div>
              );
            })
          : null}
        {selectedRadio === 2
          ? btnPicData.map((item) => {
              const isActive = activeKey === item.code;
              return (
                <div
                  className={`annotation-card ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
                  onClick={() => {
                    if (isDisabled) {
                      return;
                    }
                    handleBtnClick(item.code);
                    setAnnotationTypeContentCode(item.code);
                  }}
                  key={item.value}
                >
                  <div className="card-image">
                    <img src={item.icon} alt={item.label} />
                  </div>
                  <div className="card-label">{item.label}</div>
                </div>
              );
            })
          : null}
        {selectedRadio === 1
          ? btnTextData.map((item) => {
              const isActive =
                activeKey === item.code || activeKey === item.key;
              return (
                <div
                  className={`annotation-card ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
                  onClick={() => {
                    if (isDisabled) {
                      return;
                    }
                    handleBtnClick(item.code);
                    setAnnotationTypeContentCode(item.code);
                  }}
                  key={item.key}
                >
                  <div className="card-image">
                    <img src={item.icon} alt={item.label} />
                  </div>
                  <div className="card-label">{item.label}</div>
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
