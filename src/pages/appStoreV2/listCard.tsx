import React, { Suspense, useState, FC, useEffect, useCallback } from 'react';
import { Grid, Pagination } from '@arco-design/web-react';
import Loading from '@/pages/workflowConfig/components/loading';
import {
  getPublishedAppList,
  PublishedAppListParams
} from '../../api/appStoreV2';
import { AppCard, type AppCardInfo } from '@/components/app-card';

interface ListCardProps {
  params: PublishedAppListParams;
  onParamsChange: (params: PublishedAppListParams) => void;
}

const usePublishedAppList = (params: PublishedAppListParams) => {
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [publishedAppList, setPublishedAppList] = useState<AppCardInfo[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    // TODO: 接口联调
    console.log('----应用广场参数改变----', params);
    const data = await getPublishedAppList(params);
    const test = Array(15)
      .fill(null)
      .map((item, index) => {
        return {
          title: '高德地图 MCP 插件',
          author: '@AppForge官方',
          description: '集成多能力，精准导航、智能推荐，出行超便捷',
          tags: ['效率工具', '开发工具'],
          stats: [
            {
              icon: <span className="app-card-icon use"></span>,
              value: 4500
            },
            {
              icon: <span className="app-card-icon star"></span>,
              value: 45
            }
          ],
          id: `高德地图 MCP 插件${index}`
        };
      }) as AppCardInfo[];

    setLoading(false);
    setTotal(15);
    setPublishedAppList(test);
  }, [params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  console.log(
    '----获取到最新的应用列表----',
    publishedAppList,
    publishedAppList.length
  );

  return { loading, publishedAppList, total, refresh: fetchData };
};

const { Row, Col } = Grid;

const ListCard: React.FC<ListCardProps> = ({ params, onParamsChange }) => {
  const { loading, publishedAppList, refresh, total } =
    usePublishedAppList(params);
  const listCard = publishedAppList?.map((item) => (
    <Col key={item?.id} span={8}>
      <AppCard appCardInfo={item} />
    </Col>
  ));

  const handlePageChange = (page: number) => {
    onParamsChange({
      ...params,
      page
    });
  };

  const handlePageSizeChange = (pageSize: number) => {
    onParamsChange({
      ...params,
      pageSize
    });
  };

  return (
    <div style={{ paddingLeft: 14 }} className="app-list-card">
      <Row gutter={[20, 20]} justify="start">
        {listCard}
      </Row>

      <Row justify="end" style={{ margin: '16px 0 29px 0' }}>
        <Pagination
          defaultCurrent={1}
          current={params.page}
          pageSize={params.pageSize}
          total={total}
          onChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          showTotal
          sizeCanChange
          showJumper
        />
      </Row>
    </div>
  );
};

export default ListCard;
