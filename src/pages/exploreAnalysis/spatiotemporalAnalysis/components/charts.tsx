import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { SpatiotemporalPoint } from '../types';
import styles from '../index.module.scss';

const COLORS = [
  '#165DFF',
  '#00B42A',
  '#F77234',
  '#722ED1',
  '#14C9C9',
  '#F5319D',
  '#FF7D00',
  '#86909C'
];

export interface GeoLineSeries {
  name: string;
  points: SpatiotemporalPoint[];
  color?: string;
}

export interface GeoScatterSeries {
  name: string;
  points: SpatiotemporalPoint[];
  color?: string;
  symbolSize?: number;
}

interface GeoScatterChartProps {
  title?: string;
  scatterSeries?: GeoScatterSeries[];
  lineSeries?: GeoLineSeries[];
  flowLines?: Array<{
    name: string;
    from: [number, number];
    to: [number, number];
    width?: number;
  }>;
  heatmapCells?: Array<{
    name: string;
    center: [number, number];
    value: number;
  }>;
  height?: number;
}

export const GeoScatterChart: React.FC<GeoScatterChartProps> = ({
  title,
  scatterSeries = [],
  lineSeries = [],
  flowLines = [],
  heatmapCells = [],
  height = 360
}) => {
  const option = useMemo(() => {
    const allPoints = [
      ...scatterSeries.flatMap((item) => item.points),
      ...lineSeries.flatMap((item) => item.points)
    ];
    const lons = allPoints.map((item) => item.lon);
    const lats = allPoints.map((item) => item.lat);
    const minLon = lons.length ? Math.min(...lons) : 100;
    const maxLon = lons.length ? Math.max(...lons) : 120;
    const minLat = lats.length ? Math.min(...lats) : 20;
    const maxLat = lats.length ? Math.max(...lats) : 40;
    const lonPad = Math.max((maxLon - minLon) * 0.12, 0.05);
    const latPad = Math.max((maxLat - minLat) * 0.12, 0.05);

    const series: Record<string, unknown>[] = [];

    heatmapCells.forEach((cell, index) => {
      series.push({
        name: cell.name,
        type: 'scatter',
        symbolSize: Math.max(12, Math.min(48, cell.value * 4)),
        itemStyle: {
          color: `rgba(22, 93, 255, ${Math.min(0.15 + cell.value * 0.08, 0.75)})`,
          borderColor: '#165DFF',
          borderWidth: 1
        },
        data: [[cell.center[0], cell.center[1], cell.value]],
        z: 1
      });
    });

    lineSeries.forEach((item, index) => {
      const color = item.color || COLORS[index % COLORS.length];
      series.push({
        name: item.name,
        type: 'line',
        smooth: true,
        showSymbol: true,
        symbolSize: 7,
        lineStyle: { color, width: 2 },
        itemStyle: { color },
        data: item.points.map((point) => [point.lon, point.lat, point.label]),
        z: 3
      });
    });

    scatterSeries.forEach((item, index) => {
      const color =
        item.color || COLORS[(index + lineSeries.length) % COLORS.length];
      series.push({
        name: item.name,
        type: 'scatter',
        symbolSize: item.symbolSize ?? 10,
        itemStyle: { color },
        data: item.points.map((point) => [point.lon, point.lat, point.label]),
        z: 4
      });
    });

    flowLines.forEach((flow) => {
      series.push({
        name: flow.name,
        type: 'lines',
        coordinateSystem: 'cartesian2d',
        polyline: false,
        effect: {
          show: true,
          period: 4,
          trailLength: 0.2,
          symbol: 'arrow',
          symbolSize: 8
        },
        lineStyle: {
          color: '#F77234',
          width: flow.width ?? 2,
          curveness: 0.2
        },
        data: [
          {
            coords: [flow.from, flow.to]
          }
        ],
        z: 5
      });
    });

    return {
      grid: { left: 48, right: 24, top: 36, bottom: 40 },
      tooltip: {
        trigger: 'item',
        formatter: (params: {
          seriesName?: string;
          value?: [number, number, string?];
        }) => {
          const value = params.value;
          if (!value) {
            return params.seriesName || '';
          }
          const label = value[2] ? `<br/>${value[2]}` : '';
          return `${params.seriesName || '点位'}<br/>经度 ${value[0].toFixed(4)}，纬度 ${value[1].toFixed(4)}${label}`;
        }
      },
      legend: {
        type: 'scroll',
        top: 0,
        textStyle: { color: '#4E5969' }
      },
      xAxis: {
        type: 'value',
        name: '经度',
        min: minLon - lonPad,
        max: maxLon + lonPad,
        splitLine: { lineStyle: { color: '#F2F3F5' } },
        axisLabel: { color: '#86909C' }
      },
      yAxis: {
        type: 'value',
        name: '纬度',
        min: minLat - latPad,
        max: maxLat + latPad,
        splitLine: { lineStyle: { color: '#F2F3F5' } },
        axisLabel: { color: '#86909C' }
      },
      series
    };
  }, [flowLines, heatmapCells, lineSeries, scatterSeries]);

  return (
    <div className={styles.chartCard}>
      {title ? <div className={styles.chartTitle}>{title}</div> : null}
      <ReactECharts
        className={styles.chartBody}
        style={{ height }}
        option={option}
        notMerge
      />
    </div>
  );
};

interface TimeSeriesChartProps {
  title?: string;
  categories: string[];
  series: Array<{
    name: string;
    data: number[];
    type?: 'line' | 'bar';
    yAxisIndex?: number;
  }>;
  height?: number;
}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  title,
  categories,
  series,
  height = 320
}) => {
  const option = useMemo(
    () => ({
      grid: { left: 48, right: 24, top: 36, bottom: 48 },
      tooltip: { trigger: 'axis' },
      legend: { top: 0, textStyle: { color: '#4E5969' } },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: {
          color: '#86909C',
          rotate: categories.length > 4 ? 20 : 0
        }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#F2F3F5' } },
        axisLabel: { color: '#86909C' }
      },
      series: series.map((item) => ({
        name: item.name,
        type: item.type || 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        yAxisIndex: item.yAxisIndex || 0,
        data: item.data,
        lineStyle: { width: 2 },
        itemStyle: { color: '#165DFF' }
      }))
    }),
    [categories, series]
  );

  return (
    <div className={styles.chartCard}>
      {title ? <div className={styles.chartTitle}>{title}</div> : null}
      <ReactECharts
        className={styles.chartBody}
        style={{ height }}
        option={option}
        notMerge
      />
    </div>
  );
};
