import React from 'react';

export default function details() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
      <div
        style={{
          textAlign: 'left',
          width: '102px',
          marginTop: '16px',
          fontSize: '14px'
        }}
      >
        <ul style={{ listStyleType: 'none', padding: 0, color: '#6E7B8D' }}>
          <li style={{ marginBottom: '16px' }}>创建时间：</li>
          <li style={{ marginBottom: '16px' }}>最近更新时间：</li>
          <li style={{ marginBottom: '16px' }}>载入用户：</li>
          <li style={{ marginBottom: '16px' }}>数据器名称：</li>
          <li style={{ marginBottom: '16px' }}>数据载入任务：</li>
        </ul>
      </div>
      <div style={{ marginLeft: '2px', marginTop: '16px', fontSize: '14px' }}>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          <li style={{ marginBottom: '16px' }}>创建时间：</li>
          <li style={{ marginBottom: '16px' }}>最近更新时间：</li>
          <li style={{ marginBottom: '16px' }}>载入用户：</li>
          <li style={{ marginBottom: '16px' }}>数据器名称：</li>
          <li style={{ marginBottom: '16px' }}>数据载入任务：</li>
        </ul>
      </div>
    </div>
  );
}
