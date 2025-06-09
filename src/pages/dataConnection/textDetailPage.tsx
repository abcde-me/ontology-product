import { Button, Spin, Tabs, Input } from '@arco-design/web-react';
import { IconArrowLeft, IconList, IconDown, IconUp, IconZoomIn, IconZoomOut, IconCaretDown, IconPrinter, IconFullscreen } from '@arco-design/web-react/icon';
import FileIcon from '@/components/file-icon';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import './textDetailPage.less';

const TabPane = Tabs.TabPane;

function TextDetailPage(props) {
  const history = useHistory();
  const [activeTab, setActiveTab] = useState('excel');

  return (
    <Spin className="appforge-spin" block loading={false}>
      <div className="h-full py-[20px] pr-[20px] text-detail-page">
        <div className='page-header'>
          <div className='left-part'>
            <div
              className='size-[24px] flex items-center justify-center mr-[8px] cursor-pointer shadow-lg rounded-full'
              onClick={() => history.goBack()}
            >
              <IconArrowLeft className='size-[16px] text-[#1E293B]'/>
            </div>
            <FileIcon filename="xxxx.pdf" className="size-[22px]"/>
            <span className='filename'>Space Weather - 2018 - Morley - Measures of Model Performance Based On the Log Accuracy Ratio.txt</span>
          </div>
          <div className='right-part'>
            <Button type='outline' className="primary">标签</Button>
            <Button type='primary'>删除</Button>
          </div>
        </div>
        <div className='content-section'>
          <div className='previewer-section'>
            <div className='tools'>
              <div className="pages">
                <IconDown className="size-[20px] cursor-pointer"/>
                <Input className="h-[24px] w-[32px]" />
                <span> / 9</span>
                <IconUp className="size-[20px] cursor-pointer"/>
              </div>
              <div className="zoom">
                <IconZoomOut className="size-[20px] cursor-pointer"/>
                <span className='zoom-txt flex items-center'>
                  <span>60%</span>
                  <IconCaretDown className="size-[12px] cursor-pointer"/>
                </span>
                <IconZoomIn className="size-[20px] cursor-pointer"/>
              </div>
              <div className="others flex items-center gap-x-[16px]">
                <IconFullscreen className="size-[20px] cursor-pointer"/>
                <IconPrinter className="size-[20px] cursor-pointer"/>
              </div>
            </div>
            <div className='file-content'></div>
          </div>
          <div className='parsed-section'>
            <Tabs activeTab={activeTab} onChange={setActiveTab}>
              <TabPane key='overview' title='解析概览' />
              <TabPane key='excel' title='表格' />
              <TabPane key='formula' title='公式' />
              <TabPane key='image' title='图片' />
            </Tabs>
            {activeTab === 'excel' &&
              <div className='excel-content'>
                <div className='excel-content-header flex gap-x-[8px] items-center'>
                  <IconList className='size-[16px]'/>
                  <span className=''>表格解析(55)</span>
                </div>
                <div className='excel-content-counter'>
                  <div className='active'>1-50</div>
                  <div>51-100</div>
                  <div>100-150</div>
                </div>
                <div className='excel-content-tables'>
                  <div className="table-item">
                    <div className="table-idx">01</div>
                    <table className="table">
                      <thead>
                        <tr><th>name</th><th>name</th><th>name</th><th>name</th></tr>
                      </thead>
                      <tbody>
                        <tr><td>ddddd</td><td>ddddd</td><td>ddddd</td><td>ddddd</td></tr>
                        <tr><td>ddddd</td><td>ddddd</td><td>ddddd</td><td>ddddd</td></tr>
                        <tr><td>ddddd</td><td>ddddd</td><td>ddddd</td><td>ddddd</td></tr>
                        <tr><td>ddddd</td><td>ddddd</td><td>ddddd</td><td>ddddd</td></tr>
                        <tr><td>ddddd</td><td>ddddd</td><td>ddddd</td><td>ddddd</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="table-item">
                    <div className="table-idx">02</div>
                    <table className="table">
                      <thead>
                        <tr><th>name</th><th>name</th><th>name</th><th>name</th></tr>
                      </thead>
                      <tbody>
                        <tr><td>ddddd</td><td>ddddd</td><td>ddddd</td><td>ddddd</td></tr>
                        <tr><td>ddddd</td><td>ddddd</td><td>ddddd</td><td>ddddd</td></tr>
                        <tr><td>ddddd</td><td>ddddd</td><td>ddddd</td><td>ddddd</td></tr>
                        <tr><td>ddddd</td><td>ddddd</td><td>ddddd</td><td>ddddd</td></tr>
                        <tr><td>ddddd</td><td>ddddd</td><td>ddddd</td><td>ddddd</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="table-item">
                    <div className="table-idx">03</div>
                    <table className="table">
                      <thead>
                        <tr><th>name</th><th>name</th><th>name</th><th>name</th></tr>
                      </thead>
                      <tbody>
                        <tr><td>ddddd</td><td>ddddd</td><td>ddddd</td><td>ddddd</td></tr>
                        <tr><td>ddddd</td><td>ddddd</td><td>ddddd</td><td>ddddd</td></tr>
                        <tr><td>ddddd</td><td>ddddd</td><td>ddddd</td><td>ddddd</td></tr>
                        <tr><td>ddddd</td><td>ddddd</td><td>ddddd</td><td>ddddd</td></tr>
                        <tr><td>ddddd</td><td>ddddd</td><td>ddddd</td><td>ddddd</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </Spin>
  );
}

export default TextDetailPage;
