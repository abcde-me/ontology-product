import { Dropdown, Menu } from '@arco-design/web-react';
import { IconPlus, IconUpload } from '@arco-design/web-react/icon';
import React from 'react';
import AISvg from '@/assets/ai.svg';

export default function AvatarField() {
  return (
    <div className="mb-[16px] flex justify-center">
      <Dropdown
        droplist={
          <Menu>
            <Menu.Item
              key="ai"
              className="flex items-center text-[var(--color-text-3)] hover:text-[rgb(var(--primary-6))]"
            >
              <AISvg className="mr-[8px]  " />
              智能生成图标
            </Menu.Item>
            <Menu.Item
              key="upload"
              className="flex items-center text-[var(--color-text-3)] hover:text-[rgb(var(--primary-6))]"
            >
              <IconUpload className="mr-[8px]" />
              上传图标
            </Menu.Item>
          </Menu>
        }
      >
        <div className="group flex size-[56px] items-center justify-center border border-dashed border-[var(--color-border-1)] hover:border-[rgb(var(--primary-5))] hover:bg-[rgb(var(--primary-1))]">
          <IconPlus className="text-[21px] text-[var(--color-text-3)] group-hover:text-[rgb(var(--link-6))]" />
        </div>
      </Dropdown>
    </div>
  );
}
