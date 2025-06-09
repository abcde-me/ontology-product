import FileIcon from '@/components/file-icon';
import { Button, Checkbox, Input, Popover, Radio, Space, Tree } from '@arco-design/web-react';
import { IconCheckCircle, IconClockCircle, IconInfoCircle, IconLoading } from '@arco-design/web-react/icon';
import React, { useEffect, useMemo, useState } from 'react'
import { Table, useTable } from '@ccf2e/arco-material';

function Step2(props) {
  const { setStepData } = props
  const parseOptions = [
    { key: 'precise', title: '精准分析', desc: '将从文档中提取图片、表格等元素，需要耗费更长的时间' },
    { key: 'fast', title: '快速解析', desc: '不会对文档提取图像、表格等元素，适用于纯文本' }
  ]
  const substractOptions = [
    {label: '图片扫描', value: 'image'},
    {label: '扫描件（OCR）', value: 'ocr'},
    {label: '表格元素', value: 'table'}
  ]
  const sectionOptions = [
    { key: 'auto', title: '自动分段与清洗', desc: '自动分段与预处理规则' },
    { key: 'custom', title: '自定义', desc: '自定义分段规则、分段长度及预处理规则' },
    { key: 'level', title: '按层级分段', desc: '按照文档层级结构分段，将文档转化为有层级信息的树结构', advice: true }
  ]


  return (
    <div className='step2'>
      <div className='sub-title mb-[4px]'>文档解析策略</div>
      <Radio.Group  direction='vertical' name='card-radio-group' defaultValue="precise" className="parse-options">
        {parseOptions.map((item) => {
          return (
            <Radio key={item.key} value={item.key}>
              {({ checked }) => {
                return (
                  <div className={`custom-radio-card ${checked ? 'custom-radio-card-checked' : ''}`}>
                    <div className='brief-section'>
                      <div className='custom-radio-card-mask'>
                        <div className='custom-radio-card-mask-dot'></div>
                      </div>
                      <div className='txt-part'>
                        <div className='custom-radio-card-title'>{item.title}</div>
                        <div className='title-desc *:custom-radio-card-desc'>{item.desc}</div>
                      </div>
                    </div>
                    { item.key === 'precise' && checked &&
                      <>
                        <div className='sepatator'></div>
                        <div className='detail-section'>
                          <div className='sub-title mb-[16px]'>提取内容</div>
                          <Checkbox.Group
                            options={substractOptions}
                            direction='vertical'
                            defaultValue={['image', 'ocr', 'table']}
                          />
                          <div className='sub-title mb-[8px] mt-[24px]'>过滤策略</div>
                          <div className='flex gap-x-[8px]'>
                            <Button type='outline' className="primary">设置过滤内容</Button>
                            <Input disabled={true} className="flex-1"></Input>
                          </div>
                        </div>
                      </>
                    }
                  </div>
                );
              }}
          </Radio>
        );
      })}
      </Radio.Group>
      <div className='step2-sepatator'></div>
      <div className='sub-title mb-[12px]'>分段策略</div>
      <Radio.Group  direction='vertical' name='card-radio-group' defaultValue="auto" className="section-options">
        {sectionOptions.map((item) => {
          return (
            <Radio key={item.key} value={item.key}>
              {({ checked }) => {
                return (
                  <div className={`custom-radio-card ${checked ? 'custom-radio-card-checked' : ''}`}>
                    <div className='brief-section'>
                      <div className='custom-radio-card-mask'>
                        <div className='custom-radio-card-mask-dot'></div>
                      </div>
                      <div className='txt-part'>
                        <div className='flex gap-x-[8px] items-center'>
                          <div className='custom-radio-card-title'>{item.title}</div>
                          { item.advice && <div className='advice-tag'>推荐选择</div>}
                        </div>
                        <div className='title-desc *:custom-radio-card-desc'>{item.desc}</div>
                      </div>
                    </div>
                    { item.key === 'precise' && checked &&
                      <>
                        
                      </>
                    }
                  </div>
                );
              }}
          </Radio>
        );
      })}
      </Radio.Group>

  </div>
)
}

export default Step2;