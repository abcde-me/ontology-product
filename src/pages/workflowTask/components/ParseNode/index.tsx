import React from "react";
import './index.css';

export default function ParseNode(props: { dataSource }) {
  return (
    <div className="parse-node">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
        <div className="item-box">
          <span className="item-title">原始数据量</span>
          <span className="item-content">10000</span>
        </div>
        <div className="item-box">
          <span className="item-title">成功</span>
          <span className="item-content">10000</span>
        </div>
        <div className="item-box">
          <span className="item-title">失败</span>
          <span className="item-content">10000</span>
        </div>
      </div>
    </div>
  )
}