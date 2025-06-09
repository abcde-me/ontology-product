import FileIcon from '@/components/file-icon';
import { Button, Checkbox, Input, Popover, Radio, Space, Switch, Tree } from '@arco-design/web-react';
import { IconDelete, IconClockCircle, IconInfoCircle, IconLoading, IconCaretDown, IconDown, IconFullscreen, IconPrinter, IconUp, IconZoomIn, IconZoomOut } from '@arco-design/web-react/icon';
import React, { useEffect, useMemo, useState } from 'react'
import { Table, useTable } from '@ccf2e/arco-material';
import AdjustIcon from '@/assets/adjust.svg'

function Step3(props) {
  const { setStepData } = props
  const [treeData, setTreeData] = useState([])
  
  useEffect(() => {
    const data = [
      {
        title: 'Trunk 0-0',
        key: '0-0',
        children: [
          {
            title: 'Branch 0-0-2',
            key: '0-0-2',
            selectable: false,
          },
        ],
      },
      {
        title: 'Trunk 0-1',
        key: '0-1',
        children: [
          {
            title: 'Branch 0-1-1',
            key: '0-1-1',
          },
        ],
      },
      {
        title: 'Trunk 0-2',
        key: '0-2',
      },
      {
        title: 'Trunk 0-3',
        key: '0-3',
      },
      {
        title: 'Trunk 0-4',
        key: '0-4',
      },
      {
        title: 'Trunk 0-5',
        key: '0-5',
      },
      {
        title: 'Trunk 0-6',
        key: '0-6',
        children: [
          {
            title: 'Branch 0-6-1',
            key: '0-6-1',
          },
          {
            title: 'Branch 0-6-2',
            key: '0-6-2',
          },
          {
            title: 'Branch 0-6-3',
            key: '0-6-3',
          },
          {
            title: 'Branch 0-6-4',
            key: '0-6-4',
          },
        ],
      },
      {
        title: 'Trunk 0-7',
        key: '0-7',
        children: [
          {
            title: 'Branch 0-7-1',
            key: '0-7-1',
          },
          {
            title: 'Branch 0-7-2',
            key: '0-7-2',
          },
          {
            title: 'Branch 0-7-3',
            key: '0-7-3',
          },
          {
            title: 'Branch 0-7-4',
            key: '0-7-4',
          },
        ],
      },
      {
        title: 'Trunk 0-8',
        key: '0-8',
        children: [
          {
            title: 'Branch 0-8-1',
            key: '0-8-1',
          },
          {
            title: 'Branch 0-8-2',
            key: '0-8-2',
          },
          {
            title: 'Branch 0-8-3',
            key: '0-8-3',
          },
          {
            title: 'Branch 0-8-4',
            key: '0-8-4',
          },
        ],
      },
    ]
    setTreeData(data)
  }, [])

  return (
    <div className='step3'>
      <div className='left-part'>
        <Input.Search
          className="search-input mb-[20px]"
          placeholder="请输入名称"
          onChange={(val) => {}}
        />
        <div className='sub-title mb-[8px]'>文档列表</div>
        <div className='file-selector'>
          <FileIcon name="xxx.pdf" />
          <span className='flex-1 one-row-ellipse-box'>Stopping-Big-Tech-from-BecoStopping-Big-Tech-from-Beco..</span>
        </div>
        <div className='left-sepatator'></div>
        <div className='sub-title mb-[8px]'>分段层级</div>
        <div className='level-tree'>
        <Tree
          treeData={treeData}
          defaultExpandedKeys={[]}
        ></Tree>
        </div>
      </div>
      <div className='right-part'>
        <div className='right-header'>
          <div className='file-name'>
            <FileIcon name="xxx.pdf" />
            <span>Stopping-Big-Tech-from-Becoming-Big-AI.pdf</span>
          </div>
          <div className='file-tools'>
            <span>预览原始文档</span>
            <Switch />
            <AdjustIcon className='size-[16px]'/>
            <IconDelete className='size-[16px]'/>
          </div>
        </div>
        <div className='right-file-content'>
          <div className='file-content-preview'>
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
              {/* <div className="others flex items-center gap-x-[16px]">
                <IconFullscreen className="size-[20px] cursor-pointer"/>
                <IconPrinter className="size-[20px] cursor-pointer"/>
              </div> */}
            </div>
            <div className='file-content'></div>
          </div>
          <div className='file-content-result'>
            <div className='level-title level1'>at Bawah Reserve</div>
            <div className='level-title level2'>at Bawah Reserve</div>
            <div className='p-content level2'>Bawah Reserve, Anambas, Riau, Indonesia reservations@bawahreserve.com Whatsapp: +60 11 10547003 bawahreserve.com</div>
            <div className='p-content level2'>Bawah Reserve, Anambas, Riau, Indonesia reservations@bawahreserve.com Whatsapp: +60 11 10547003 bawahreserve.com</div>
            <div className='level-title level1'>at Bawah Reserve</div>
            <div className='level-title level2'>at Bawah Reserve</div>
            <div className='p-content level2'>Bawah Reserve, Anambas, Riau, Indonesia reservations@bawahreserve.com Whatsapp: +60 11 10547003 bawahreserve.com</div>
            <div className='p-content level2'>Bawah Reserve, Anambas, Riau, Indonesia reservations@bawahreserve.com Whatsapp: +60 11 10547003 bawahreserve.com</div>
            <div className='level-title level1'>at Bawah Reserve</div>
            <div className='level-title level2'>at Bawah Reserve</div>
            <div className='p-content level2'>Bawah Reserve, Anambas, Riau, Indonesia reservations@bawahreserve.com Whatsapp: +60 11 10547003 bawahreserve.com</div>
            <div className='p-content level2'>Bawah Reserve, Anambas, Riau, Indonesia reservations@bawahreserve.com Whatsapp: +60 11 10547003 bawahreserve.com</div>
            <div className='level-title level1'>at Bawah Reserve</div>
            <div className='level-title level2'>at Bawah Reserve</div>
            <div className='p-content level2'>Bawah Reserve, Anambas, Riau, Indonesia reservations@bawahreserve.com Whatsapp: +60 11 10547003 bawahreserve.com</div>
            <div className='p-content level2'>Bawah Reserve, Anambas, Riau, Indonesia reservations@bawahreserve.com Whatsapp: +60 11 10547003 bawahreserve.com</div>
            
          </div>
        </div>
      </div>
    </div>
)
}

export default Step3;