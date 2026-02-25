import React from 'react';
import { IconLoading } from '@arco-design/web-react/icon';
import { RUN_STATUS_MAP } from '../../types';
import styles from './index.module.scss';

// SVG 图标组件
const SuccessIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0 6.66667C0 2.98477 2.98477 0 6.66667 0C10.3486 0 13.3333 2.98477 13.3333 6.66667C13.3333 10.3486 10.3486 13.3333 6.66667 13.3333C2.98477 13.3333 0 10.3486 0 6.66667ZM6.00001 9.27615L10.3047 4.97141L9.36194 4.0286L6.00001 7.39053L4.13808 5.5286L3.19527 6.47141L6.00001 9.27615Z"
      fill="#10B981"
    />
  </svg>
);

const ErrorIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0 6.66667C0 2.98477 2.98477 0 6.66667 0C10.3486 0 13.3333 2.98477 13.3333 6.66667C13.3333 10.3486 10.3486 13.3333 6.66667 13.3333C2.98477 13.3333 0 10.3486 0 6.66667ZM4.07612 5.01902L5.72604 6.66894L4.07612 8.31885L5.01893 9.26166L6.66885 7.61175L8.31876 9.26166L9.26157 8.31885L7.61165 6.66894L9.26157 5.01902L8.31876 4.07621L6.66885 5.72613L5.01893 4.07621L4.07612 5.01902Z"
      fill="#EF4444"
    />
  </svg>
);

const StopIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M1.33337 8.00065C1.33337 4.31875 4.31814 1.33398 8.00004 1.33398C11.6819 1.33398 14.6667 4.31875 14.6667 8.00065C14.6667 11.6825 11.6819 14.6673 8.00004 14.6673C4.31814 14.6673 1.33337 11.6825 1.33337 8.00065ZM7.33337 10.0007V11.334H8.66671V10.0007H7.33337ZM8.66671 9.33398L8.66671 4.66732H7.33337L7.33337 9.33398H8.66671Z"
      fill="#6E7B8D"
    />
  </svg>
);

interface StatusCardProps {
  status: 1 | 2 | 3 | 4;
  executionId: string;
  source: string;
  duration: string;
  startTime: string;
  endTime: string;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  status,
  executionId,
  source,
  duration,
  startTime,
  endTime
}) => {
  const statusConfig = RUN_STATUS_MAP[status];

  // 根据状态渲染图标
  const renderStatusIcon = () => {
    switch (status) {
      case 1: // 运行中
        return (
          <div className="flex items-center gap-1">
            <IconLoading
              className="animate-spin"
              style={{ color: '#184FF2', fontSize: 14 }}
            />
            <span>{statusConfig.text}</span>
          </div>
        );
      case 2: // 成功
        return (
          <div className="flex items-center gap-1">
            <SuccessIcon />
            <span>{statusConfig.text}</span>
          </div>
        );
      case 3: // 失败
        return (
          <div className="flex items-center gap-1">
            <ErrorIcon />
            <span>{statusConfig.text}</span>
          </div>
        );
      case 4: // 已停止
        return (
          <div className="flex items-center gap-1">
            <StopIcon />
            <span>{statusConfig.text}</span>
          </div>
        );
      default:
        return <span>{statusConfig.text}</span>;
    }
  };

  // 根据状态设置背景色
  const getBackgroundColor = () => {
    switch (status) {
      case 2: // 成功
        return '#ECFDF5';
      case 3: // 失败
        return '#FFF0ED';
      case 1: // 运行中
        return '#EDF5FF';
      case 4: // 已停止
        return '#FFFFFF';
      default:
        return '#FFFFFF';
    }
  };

  const getBorderColor = () => {
    switch (status) {
      case 2: // 成功
        return '#10B981';
      case 3: // 失败
        return '#E52E2D';
      case 1: // 运行中
        return '#184FF2';
      case 4: // 已停止
        return '#C3C7D4';
      default:
        return '#C3C7D4';
    }
  };

  return (
    <div
      className={styles['status-card']}
      style={{
        backgroundColor: getBackgroundColor(),
        border: `1px solid ${getBorderColor()}`
      }}
    >
      <div className={styles['status-item']}>
        <div className={styles['label']}>状态</div>
        <div className={styles['value']}>{renderStatusIcon()}</div>
      </div>
      <div className={styles['status-item']}>
        <div className={styles['label']}>执行id</div>
        <div className={styles['value']}>{executionId}</div>
      </div>
      <div className={styles['status-item']}>
        <div className={styles['label']}>来源</div>
        <div className={styles['value']}>{source}</div>
      </div>
      <div className={styles['status-item']}>
        <div className={styles['label']}>执行耗时</div>
        <div className={styles['value']}>{duration}</div>
      </div>
      <div className={styles['status-item']}>
        <div className={styles['label']}>开始时间</div>
        <div className={styles['value']}>{startTime}</div>
      </div>
      <div className={styles['status-item']}>
        <div className={styles['label']}>结束时间</div>
        <div className={styles['value']}>{endTime}</div>
      </div>
    </div>
  );
};
