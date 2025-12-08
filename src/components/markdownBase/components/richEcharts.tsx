import React, { useRef, useEffect } from 'react';
import * as echarts from 'echarts';
import type { EChartsOption, ECharts } from 'echarts';

export interface IEchartsData {
  option: EChartsOption;
  className?: string;
  style?: React.CSSProperties;
}

const RichEcharts: React.FC<IEchartsData> = ({
  option,
  className = '',
  style = { height: '400px', width: '100%' }
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<ECharts | null>(null);

  useEffect(() => {
    // 初始化图表
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current);

      // 设置图表配置项

      // 应用配置
      chartInstance.current.setOption(option);

      // 添加响应式支持
      const resizeHandler = () => {
        if (chartInstance.current) {
          chartInstance.current.resize();
        }
      };

      window.addEventListener('resize', resizeHandler);

      // 组件卸载时清理
      return () => {
        if (chartInstance.current) {
          chartInstance.current.dispose();
          chartInstance.current = null;
        }
        window.removeEventListener('resize', resizeHandler);
      };
    }
  }, [option]);

  return (
    <div
      ref={chartRef}
      className={`echarts-container ${className}`}
      style={style}
    />
  );
};

export default RichEcharts;
