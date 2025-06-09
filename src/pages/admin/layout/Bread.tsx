import { Breadcrumb } from '@arco-design/web-react';
import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

const pathMap = {};
export default function Bread() {
  const location = useLocation();
  const breads = useMemo(() => {
    const path = Object.keys(pathMap).find((path) => {
      if (location.pathname.includes(path)) return true;
      return false;
    });
    return pathMap[path] || [];
  }, [location.pathname]);
  if (breads.length === 0) return null;
  return (
    <Breadcrumb className="my-[16px] flex-none">
      {breads.map((item) => {
        return <Breadcrumb.Item key={item}>{item}</Breadcrumb.Item>;
      })}
    </Breadcrumb>
  );
}
