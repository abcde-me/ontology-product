interface ApiRes<T> {
  code: number | string;
  data: T;
  message: string;
  requestId: string;
  status: number;
}

interface CustomFormItemCompProps<T = Record<string, any>> {
  value?: T;
  disabled?: boolean;
  onChange?: (v: T) => any;
  id?: React.Key;
  ref?: React.Ref<any>;
  className?: string;
  style?: React.CSSProperties;
}
