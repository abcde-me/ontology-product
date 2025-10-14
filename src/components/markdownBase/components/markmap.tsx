import React, { useState, useRef, useEffect } from 'react';
import { Markmap } from 'markmap-view';
import { transformer } from '../hooks/useMarkmap';

export default function MarkmapRenderer({ chart }) {
  const [value, setValue] = useState(chart);
  const refSvg = useRef<SVGSVGElement>();
  const refMm = useRef<Markmap>();

  useEffect(() => {
    if (refMm.current) return;
    const mm = Markmap.create(refSvg.current, {
      pan: false, // 禁用拖拽
      zoom: false, // 禁用缩放
      autoFit: true, // 自动适应视图
      maxInitialScale: 1 // 初始最大缩放比例
    });
    console.log('create', refSvg.current);
    refMm.current = mm;
  }, []);

  useEffect(() => {
    const mm = refMm.current;
    if (!mm) return;
    const { root } = transformer.transform(value);
    mm.setData(root).then(() => {
      mm.fit();
    });
  }, [value]);

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  return (
    <React.Fragment>
      <svg className="min-h-[300px] min-w-[600px]" ref={refSvg} />
    </React.Fragment>
  );
}
