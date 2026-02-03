import React from 'react';
import { Link, Spin } from '@arco-design/web-react';

export function BottomBar({ id, data }) {
  return (
    <div className="absolute bottom-[-38px] right-0 flex h-[30px] items-center justify-end gap-2">
      <Link href="#" status="error">
        Error Link
      </Link>
      <Spin />
    </div>
  );
}
