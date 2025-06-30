interface ApiRes<T> {
  code: string;
  data: T;
  message: string;
  requestId: string;
  status: number;
}
