import { getModelList, getModelLabelList } from '@/api/dataAnnotation';
import { useQuery } from 'react-query';
import { isArray } from 'lodash-es';

export const useGetModelList = (params: { label_type: number }, options?) => {
  const { data, isLoading, isFetching, refetch } = useQuery(
    ['get-model-list', params.label_type],
    () => getModelList(params),
    {
      ...options,
      select(data) {
        if (!isArray(data?.data?.result)) {
          return [];
        }
        return data.data.result.map((item) => ({
          label: item.name,
          value: item.name
        }));
      }
    }
  );
  return {
    data,
    isLoading,
    isFetching,
    refetch
  };
};

export const useGetModelLabelList = (
  params: { model_name: string },
  options?
) => {
  const { data, isLoading, isFetching, refetch } = useQuery(
    ['get-model-label-list', params.model_name],
    () => getModelLabelList(params),
    {
      ...options,
      select(data) {
        if (!isArray(data?.data?.label_list)) {
          return [];
        }
        return data.data.label_list.map((item) => ({
          label: item.label_name,
          value: item.label_shape
        }));
      }
    }
  );
  return {
    data,
    isLoading,
    isFetching,
    refetch
  };
};
