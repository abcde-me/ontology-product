import { useEffect, useState } from 'react';
import { Message } from '@arco-design/web-react';
import { fetchDataSourceList } from '@/pages/dataSource/services/api';
import {
  ConnectionStatus,
  DataSourceItem,
  DataSourceType as ConnectorDataSourceType
} from '@/pages/dataSource/types';

export function useSchemaSourceConnectors() {
  const [connectors, setConnectors] = useState<DataSourceItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadConnectors = async () => {
      setLoading(true);
      try {
        const res = await fetchDataSourceList({
          pageNo: 1,
          pageSize: 1000,
          dataSourceTypes: [
            ConnectorDataSourceType.MYSQL,
            ConnectorDataSourceType.POSTGRESQL,
            ConnectorDataSourceType.DAMENG
          ],
          connectionStatuses: [ConnectionStatus.SUCCESS]
        });
        setConnectors(res.items || []);
      } catch (error) {
        console.error('加载连接器列表失败:', error);
        Message.error('加载连接器列表失败');
      } finally {
        setLoading(false);
      }
    };

    loadConnectors();
  }, []);

  return {
    connectors,
    loading
  };
}
