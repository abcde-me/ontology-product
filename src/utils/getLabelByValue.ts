export type Options = OptionItem[];

export interface OptionItem {
  label: string;
  value: string | number;
}
const getLabelByValue = (
  options: Options,
  value: string | number | boolean
) => {
  const option = options.find((item) => item.value === value);
  return option ? option.label : '';
};
export default getLabelByValue;
