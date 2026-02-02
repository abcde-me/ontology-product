import { useDemoStore } from '../../store';
import { Button } from '@arco-design/web-react';
import {
  IconCloudDownload,
  IconBackward,
  IconForward,
  IconPlayCircle
} from '@arco-design/web-react/icon';
import React from 'react';

export function TopBar({ id, data }) {
  const showPanel = useDemoStore((s) => s.showPanel);
  const setShowPanel = useDemoStore((s) => s.setShowPanel);
  return (
    <div className="mr-4 flex items-center gap-2">
      <Button
        size="mini"
        type="primary"
        icon={<IconCloudDownload />}
        onClick={(e) => {
          e.stopPropagation();
          setShowPanel(!showPanel);
        }}
      />
      <Button size="mini" type="primary" icon={<IconBackward />} />
      <Button size="mini" type="primary" icon={<IconForward />} />
      <Button size="mini" type="primary" icon={<IconPlayCircle />} />
    </div>
  );
}
