import dayjs from 'dayjs';

export type TimeRange = 'all' | 'today' | 'last7';

export const getTimeRange = (range: TimeRange) => {
  if (range === 'today') {
    return {
      startTime: dayjs().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
      endTime: dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss')
    };
  }

  if (range === 'last7') {
    return {
      startTime: dayjs()
        .subtract(6, 'day')
        .startOf('day')
        .format('YYYY-MM-DD HH:mm:ss'),
      endTime: dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss')
    };
  }

  return {};
};
