import React from 'react'
import { Spin } from '@arco-design/web-react';

import './style.css'

type ILoadingProps = {
  type?: 'area' | 'app'
}

const Loading = (
  { type = 'area' }: ILoadingProps = { type: 'area' },
) => {
  return (
    <div className={`flex w-full justify-center items-center ${type === 'app' ? 'h-full' : ''}`}>
      {/* <div className="custom-loader"></div> */}
      <Spin />
    </div>
  )
}
export default Loading
