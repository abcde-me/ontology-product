type GetFirstArgument<T> = T extends (
  first: infer FirstArgument,
  ...args: any[]
) => any
  ? FirstArgument
  : never;
type ImockFetch<T = any> = (data: T, delay?: number) => Promise<T>;
export const mockFetch: ImockFetch<GetFirstArgument<ImockFetch>> = (
  data,
  delay = 1000
) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, delay);
  });
};

export const dataInit = () => {
  return mockFetch(
    {
      data: {
        result: [
          {
            name: 'name-1'
          },
          {
            name: 'name-2'
          }
        ],
        totalCount: 10
      }
    },
    1000
  );
};

export const modelLabelDataInit = () => {
  return mockFetch(
    {
      data: {
        model_name: '模型名字',
        label_list: [
          {
            label_name: '标签名称1',
            label_shape: 'bbox'
          },
          {
            label_name: '标签名称2',
            label_shape: 'polygon'
          }
        ]
      }
    },
    1000
  );
};
