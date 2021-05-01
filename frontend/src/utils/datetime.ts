import dayjs from 'dayjs';

export const formatUnixTimestamp = (unixTime: number | string) => {
  return dayjs.unix(Number(unixTime)).format('YYYY-MM-DD HH:mm:ss');
};

export const getUnixTimestamp = () => {
  return Math.round(+new Date()/1000);
};