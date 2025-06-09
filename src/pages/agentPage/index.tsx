import React, { useState } from 'react';
import Content from './compontents/content';
import Sidebar from './compontents/sidebar';
import Header  from './compontents/header';
function AgentPage(props) {
  return (
    <div className="flex h-full w-full" >
      <div className="flex-1 flex flex-col w-[928px] h-[876px] border border-solid border-[1px]"  style={{borderRadius:'8px',backgroundColor:'white',marginTop:'8px'}}>
        {/* 头部 */}
        <Header />
        {/* 内容区-应用体验 */}
        <Content />
        {/* 侧边栏-应用介绍 */}
      </div>
        <Sidebar />
    </div>
  );
}
export default AgentPage;
