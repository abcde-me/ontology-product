import type { FC } from 'react';
import React from 'react';
import type { CodeNodeType } from './types';
import type { NodeProps } from '@/pages/workflowConfig/workflow/types';
import './date-cleaning.scss';

const Node: FC<NodeProps<CodeNodeType>> = (props) => {
  const {
    data_standardization,
    threshold,
    threshold_switch,
    oh_is,
    df_is,
    qd_is,
    mg_is,
    ts_remove,
    remove_url,
    remove_invisible,
    remove_html,
    unicode,
    traditional_to_simplified,
    case_uniformity,
    mg_duplicate_checkbox,
    mg_duplicate_ngram,
    mg_duplicate
  } = props.data;
  // 特殊字符其中有一项为true显示
  const isChecked = () => {
    return [remove_url, remove_invisible, remove_html].some(Boolean);
  };
  // 数据标准化其中有一项为true显示
  const isDataChecked = () => {
    return [unicode, traditional_to_simplified, case_uniformity].some(Boolean);
  };
  const isCleaningChecked = () => {
    return [
      data_standardization && isDataChecked(),
      ts_remove && isChecked(),
      mg_is,
      qd_is,
      df_is,
      oh_is,
      mg_duplicate &&
        (mg_duplicate_checkbox === 'md5' ||
          (mg_duplicate_ngram !== undefined &&
            mg_duplicate_checkbox === 'ngram')),
      threshold_switch && threshold > 0
    ].some(Boolean);
  };
  return isCleaningChecked() ? (
    <div className={`wk-node-content data-cleaning-node`}>
      <span className="node-title">清洗类型</span>
      <div className="node-item-content">
        {data_standardization && isDataChecked() && (
          <div className="node-item">数据标准化</div>
        )}
        {threshold_switch && threshold > 0 && (
          <div className="node-item">数据过滤</div>
        )}
        {ts_remove && ts_remove && isChecked() && (
          <div className="node-item">特殊字符删除</div>
        )}
        {mg_is && mg_is && <div className="node-item">去除敏感词</div>}
        {qd_is && qd_is && <div className="node-item">数据去毒化</div>}
        {df_is && df_is && <div className="node-item">数据填补</div>}
        {oh_is && oh_is && <div className="node-item">异常值处理</div>}
        {mg_duplicate &&
          (mg_duplicate_checkbox === 'md5' ||
            (mg_duplicate_ngram !== undefined &&
              mg_duplicate_checkbox === 'ngram')) && (
            <div className="node-item">数据去重</div>
          )}
      </div>
    </div>
  ) : (
    <div className={`wk-node-content data-cleaning-node`}>
      <span className="node-title">清洗类型</span>
      <div className="node-item-content">
        <div className="node-item-text">未配置</div>
      </div>
    </div>
  );
};

export default React.memo(Node);
