interface ApiRes<T> {
  code: number;
  data: T;
  message: string;
  requestId: string;
  status: number;
}
