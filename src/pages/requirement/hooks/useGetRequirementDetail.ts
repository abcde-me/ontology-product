import { getRequirementDetail } from '@/api/dataAnnotation';
import { useQuery } from 'react-query';

export const useGetRequirementDetail = (params: { requirement_id: number }) => {
  const { data, isLoading, isFetching, refetch } = useQuery(
    ['get-requirement-detail', params.requirement_id],
    () => getRequirementDetail(params),
    {
      enabled: !!params.requirement_id,
      select(res) {
        if (res?.code !== 'success') {
          return {};
        }
        return res.data;
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
