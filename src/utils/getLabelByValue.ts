export type Options = OptionItem[];

export interface OptionItem {
  label: string;
  value: string | number;
  labelKey?: string;
}
const getLabelByValue = (
  options: Options,
  value: string | number | boolean,
  labelKey = 'label'
) => {
  const option = options.find((item) => item.value === value);
  return option ? option[labelKey] : '';
};
export default getLabelByValue;
