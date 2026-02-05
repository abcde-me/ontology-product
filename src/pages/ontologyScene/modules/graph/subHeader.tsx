import React, { useCallback } from 'react';
import { Input } from '@arco-design/web-react';
import { IconSearch } from '@arco-design/web-react/icon';
import { useReactFlow, useViewport } from 'reactflow';
import { RiZoomInLine, RiZoomOutLine } from '@remixicon/react';

const SubHeader: React.FC = () => {
  const { zoomIn, zoomOut } = useReactFlow();
  const { zoom } = useViewport();
  const [searchValue, setSearchValue] = React.useState('');

  const handleZoomIn = useCallback(() => {
    if (zoom < 2) {
      zoomIn();
    }
  }, [zoom, zoomIn]);

  const handleZoomOut = useCallback(() => {
    if (zoom > 0.25) {
      zoomOut();
    }
  }, [zoom, zoomOut]);

  return (
    <div className="pointer-events-auto absolute left-5 top-5 z-10 flex items-center gap-0 rounded-xl border border-[#e2e8f0] bg-white px-4 py-2">
      <div className="flex flex-1 items-center">
        <Input
          className="w-full rounded-lg border border-[#e2e8f0] bg-white [&_.arco-input]:border-none [&_.arco-input]:bg-transparent"
          placeholder="请输入关键词"
          value={searchValue}
          onChange={(value) => setSearchValue(value)}
          suffix={<IconSearch className="text-base text-[#86909c]" />}
        />
      </div>
      <div className="mx-3 h-5 w-px bg-[#e2e8f0]" />
      <div className="flex items-center gap-2">
        <div
          className={`flex cursor-pointer items-center justify-center text-[#1d2129] transition-opacity duration-200 hover:opacity-70 ${
            zoom <= 0.25 ? 'cursor-not-allowed opacity-30' : ''
          }`}
          onClick={handleZoomOut}
        >
          <RiZoomOutLine className="h-4 w-4" />
        </div>
        <div className="min-w-[30px] text-center text-xs font-medium text-[#1d2129]">
          {parseFloat(`${zoom * 100}`).toFixed(0)}%
        </div>
        <div
          className={`flex cursor-pointer items-center justify-center text-[#1d2129] transition-opacity duration-200 hover:opacity-70 ${
            zoom >= 2 ? 'cursor-not-allowed opacity-30' : ''
          }`}
          onClick={handleZoomIn}
        >
          <RiZoomInLine className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};

export default SubHeader;
