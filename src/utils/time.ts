import dayjs from 'dayjs';

export const getTimeRange = (filter: 'day' | 'week' | 'month') => {
  let startDate;
  switch (filter) {
    case 'day':
      startDate = dayjs().startOf('day');
      break;
    case 'week':
      startDate = dayjs().startOf('week');
      break;
    case 'month':
      startDate = dayjs().startOf('month');
      break;
    default:
      startDate = dayjs().startOf('day');
  }
  return { start: startDate, end: dayjs() };
};