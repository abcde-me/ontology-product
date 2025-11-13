interface ApiRes<T> {
  code: number | string;
  data: T;
  message: string;
  requestId: string;
  status: number;
}
