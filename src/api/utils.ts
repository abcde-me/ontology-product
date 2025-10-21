export const isRequestSuccess = ({ statusCode }: { statusCode: number }) => {
  return statusCode === 0;
};
