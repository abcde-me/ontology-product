
export const findVariableNameById = (
  id: string | number,
  dataSource: Array<any>,
  name: any
) => {
  const variable = dataSource?.find((item: any) => item?.id === id);
  return variable?.[name];
};
