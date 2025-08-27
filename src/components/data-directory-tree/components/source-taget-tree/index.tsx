import React from 'react';
import { IconArrowLeft } from '@arco-design/web-react/icon';
import './index.scss';

const SourceTargetTree: React.FC<{
  type: 'source' | 'target';
  onBack: () => void;
}> = ({ type, onBack }) => {
  const handleBack = () => {
    onBack();
  };

  return (
    <div className="data-collection">
      <div className="data-collection-header">
        <div className="data-collection-header-left">
          <IconArrowLeft className="back-arrow" onClick={handleBack} />
          <div className="data-collection-header-title">
            {type === 'source' ? '源数据目录' : '目标数据目录'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SourceTargetTree;
