import React from 'react';
import {
  Card,
  Avatar,
  Tag,
  Space,
  Typography,
  Divider
} from '@arco-design/web-react';
import './index.less';
import cn from 'classnames';

const { Text, Title } = Typography;

interface StatItem {
  icon: React.ReactNode;
  value: number;
  formatter?: (value: number) => string;
}

export enum Variant {
  /** 默认样式 */
  DEFAULT = 'default',
  /** 大图样式 */
  COMPACT = 'compact'
}

export interface AppCardInfo {
  title?: string;
  author?: string;
  description?: string;
  tags?: string[];
  stats?: StatItem[];
  avatar?: React.ReactNode;
  extra?: React.ReactNode;
  style?: React.CSSProperties;
  topImg?: React.ReactNode;
  id: string;
  variant: Variant;
}

interface AppCardProps {
  appCardInfo?: AppCardInfo;
}

const defaultFormatter = (value: number): string => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }

  return value.toString();
};

export const AppCard: React.FC<AppCardProps> = ({
  appCardInfo
}: AppCardProps) => {
  const {
    title = '高德地图 MCP 插件',
    author = '@AppForge官方',
    description = '集成多能力，精准导航、智能推荐，出行超便捷',
    tags = [],
    stats = [],
    avatar = (
      <Avatar
        size={48}
        shape="square"
        style={{ backgroundColor: '#8985FF', borderRadius: 8 }}
      >
        高
      </Avatar>
    ),
    extra,
    style,
    topImg,
    variant = Variant.DEFAULT
  } = appCardInfo ?? {};
  const isCompact = variant === Variant.COMPACT;
  const HeaderContent = () => {
    if (isCompact) {
      return (
        <Space direction="vertical" size={4}>
          {avatar}
          <Space size={6} align="center">
            <Title heading={6} style={{ margin: 0 }}>
              {title}
            </Title>
            <Text type="secondary">{author}</Text>
          </Space>
        </Space>
      );
    }

    return (
      <Space align="start" size={12}>
        {avatar}
        <Space size={0} direction="vertical">
          <Title heading={6} style={{ margin: 0 }}>
            {title}
          </Title>
          <Text type="secondary">{author}</Text>
        </Space>
      </Space>
    );
  };

  return (
    <Card
      className="app-card"
      style={{
        ...style
      }}
      bodyStyle={{
        padding: 0,
        width: '100%'
      }}
      bordered={false}
    >
      {/* 顶部图片 */}
      {topImg && <div className="app-card__top-img">{topImg}</div>}

      <Space
        className={cn('app-card__content', {
          'app-card__content--with-top-img': !!topImg
        })}
        direction="vertical"
        size={12}
      >
        {/* 头部区域 */}
        <HeaderContent></HeaderContent>

        {/* 描述 */}
        <Text>{description}</Text>

        {/* 标签 */}
        {tags && tags.length > 0 && (
          <Space wrap size={[8, 4]}>
            {tags.map((tag, index) => (
              <Tag className="app-card__tag" key={index}>
                {tag}
              </Tag>
            ))}
          </Space>
        )}

        {/* 统计数据 */}
        {stats && stats.length > 0 && (
          <>
            <Space size={12}>
              {stats.map((stat, index) => (
                <Space
                  key={index}
                  size={2}
                  align="center"
                  style={{ height: 16, lineHeight: '16px' }}
                >
                  {stat.icon}
                  {(stat.formatter || defaultFormatter)(stat.value)}
                </Space>
              ))}
            </Space>
          </>
        )}

        {/* 额外的内容 */}
        {extra && <div>{extra}</div>}
      </Space>
    </Card>
  );
};
