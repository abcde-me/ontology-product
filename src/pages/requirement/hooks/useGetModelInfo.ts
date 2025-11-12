import { getModelList, getModelLabelList } from '@/api/dataAnnotation';
import { useQuery } from 'react-query';
import { isArray } from 'lodash-es';

export const useGetModelList = (
  params: { label_tool_code: string; page: number; page_size: number },
  options?
) => {
  const { data, isLoading, isFetching, refetch } = useQuery(
    ['get-model-list', params.label_tool_code],
    () => getModelList(params),
    {
      ...options,
      select(res) {
        if (res?.code !== 'success') {
          return [];
        }
        if (!isArray(res?.data?.result)) {
          return [];
        }
        return res.data.result.map((item) => ({
          label: item.name,
          value: item.id
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
  params: { model_id: number },
  options?
) => {
  const { data, isLoading, isFetching, refetch } = useQuery(
    ['get-model-label-list', params.model_id],
    () => getModelLabelList(params),
    {
      ...options,
      select(res) {
        if (res?.code !== 'success') {
          return [];
        }
        if (!isArray(res?.data?.label_list)) {
          return [];
        }
        return res.data.label_list.map((item) => ({
          label: item.label_name,
          value: item.label_mapping
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
