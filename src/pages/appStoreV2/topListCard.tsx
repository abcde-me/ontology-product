import React, { Suspense, useState, FC, useEffect, useCallback } from 'react';
import { Grid, Pagination } from '@arco-design/web-react';
import Loading from '@/pages/workflowConfig/components/loading';
import { AppCard, Variant, type AppCardInfo } from '@/components/app-card';
import { title } from 'process';
import AppListCardBacOne from '../../assets/app-list-card-bac1.png';
import AppListCardBacTwo from '../../assets/app-list-card-bac2.png';
import AppListCardBacThree from '../../assets/app-list-card-bac3.png';

const { Row, Col } = Grid;

const TopListCard: React.FC = () => {
  const publishedAppList = [
    {
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
      topImg: <img className="top-img" src={AppListCardBacOne} />,
      variant: Variant.COMPACT
    },
    {
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
      topImg: <img className="top-img" src={AppListCardBacTwo} />,
      variant: Variant.COMPACT
    },
    {
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
      topImg: <img className="top-img" src={AppListCardBacThree} />,
      variant: Variant.COMPACT
    }
  ].map((item, index) => {
    // @ts-expect-error
    item.id = `${title}${index}-`;
    return item;
  }) as AppCardInfo[];
  const listCard = publishedAppList?.map((item) => (
    <Col key={item?.id} span={8}>
      <AppCard appCardInfo={item} />
    </Col>
  ));

  return (
    <div style={{ paddingLeft: 14 }} className="app-top-list-card">
      <Row gutter={[20, 20]} justify="start">
        {listCard}
      </Row>
    </div>
  );
};

export default TopListCard;
