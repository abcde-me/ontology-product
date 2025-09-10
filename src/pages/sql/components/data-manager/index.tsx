import React, { useState } from 'react';
import { Message, Typography } from '@arco-design/web-react';
import DataDirectoryTree from '@/components/data-directory-tree';
import { DatasetListItem } from '@/types/datasetManagement';
import './index.scss';
import { Db } from '@/api/dataCatalog';
import { DataDirectoryTreeFrom } from '@/components/data-directory-tree/types';
import ModalDbDetail from './ModalDbDetail';
import ModalDatasetDetail from './ModalDatasetDetail';
import copy from 'copy-to-clipboard';
import DbModal from '@/components/data-catalog-content/components/popups-form/dbmodal';

const { Title } = Typography;

interface DataManagerProps {
  onInsertContent?: (content: string) => void;
  getIsEditorFocused?: () => boolean;
}

const PythonTabContent: React.FC<DataManagerProps> = ({
  onInsertContent,
  getIsEditorFocused
}) => {
  const [dbDetailVisible, setDbDetailVisible] = useState(false);
  const [dbFromOrigin, setDbFromOrigin] = useState({});
  const [datasetDetailVisible, setDatasetDetailVisible] = useState(false);
  const [detailId, setDetailId] = useState('');
  const [tableDetailVisible, setTableDetailVisible] = useState(false);
  const [tableFromOrigin, setTableFromOrigin] = useState<any>({});

  const closeDbDetail = () => {
    setDbDetailVisible(false);
  };

  const closeTableDetail = () => {
    setTableDetailVisible(false);
  };

  // 处理数据集插入
  const handleInsertDataset = (dataset: DatasetListItem) => {
    const isEditorFocused = getIsEditorFocused?.() ?? false;
    console.log(
      '数据集插入:',
      dataset,
      'isEditorFocused:',
      isEditorFocused,
      'onInsertContent:',
      onInsertContent
    );

    if (isEditorFocused && onInsertContent) {
      // 编辑器聚焦时插入内容
      onInsertContent(dataset?.name ?? '');
    } else {
      // 编辑器未聚焦时复制到剪贴板
      copy(dataset?.name ?? '');
      Message.success('内容复制成功，请粘贴到编辑器');
    }
  };

  const closeDatasetDetail = () => {
    setDatasetDetailVisible(false);
  };

  // 处理数据集详情查看
  const handleViewDatasetDetail = (dataset: DatasetListItem) => {
    setDetailId(String(dataset.id));
    setDatasetDetailVisible(true);
  };

  // 处理数据库详情查看
  const handleViewDbDetail = (database: any, hierarchyData?: any) => {
    console.log('数据库详情:', database);
    console.log('层级选择数据:', hierarchyData);

    const level = hierarchyData.currentViewLevel;

    if (level === 'db-item') {
      const searchParams = {
        database: database.name,
        path_id: hierarchyData.selectedDb.id
      };
      setDbFromOrigin(searchParams);
      setDbDetailVisible(true);
    }

    if (level === 'database-tables') {
      const searchParams = {
        databaseName: hierarchyData.selectedDbItem.name,
        path_id: hierarchyData.selectedDb.id,
        table_id: database.table_id,
        tableName: database.table_name
      };
      setTableFromOrigin(searchParams);
      setTableDetailVisible(true);
    }
  };

  // 处理数据库插入
  const handleDbInsert = (database: Db, hierarchyData?: any) => {
    const isEditorFocused = getIsEditorFocused?.() ?? false;
    console.log('数据库插入:', database, 'isEditorFocused:', isEditorFocused);
    console.log('层级选择数据:', hierarchyData);

    if (isEditorFocused && onInsertContent) {
      // 编辑器聚焦时插入内容
      onInsertContent(database?.name ?? '');
    } else {
      // 编辑器未聚焦时复制到剪贴板
      copy(database?.name ?? '');
      Message.success('内容复制成功，请粘贴到编辑器');
    }
  };

  return (
    <div className="python-tab-content">
      <div className="tab-header">
        <Title className="tab-title">数据目录</Title>
      </div>

      <div className="tab-tree sider-container">
        <DataDirectoryTree
          from={DataDirectoryTreeFrom.SQL}
          // 数据集插入
          onInsertDataset={handleInsertDataset}
          // 数据集详情
          onViewDatasetDetail={handleViewDatasetDetail}
          // 数据库详情
          onViewDbDetail={handleViewDbDetail}
          // 数据库插入
          onDbInsert={handleDbInsert}
          getIsEditorFocused={getIsEditorFocused}
        />
      </div>

      {/* 数据集详情 */}
      {datasetDetailVisible && (
        <ModalDatasetDetail
          datasetDetailVisible={datasetDetailVisible}
          detailId={detailId}
          closeDatasetDetail={closeDatasetDetail}
        />
      )}

      {/* 数据库详情 */}
      {dbDetailVisible && (
        <ModalDbDetail
          dbDetailVisible={dbDetailVisible}
          fromOrigin={dbFromOrigin}
          closeDbDetail={closeDbDetail}
        />
      )}

      {/* 数据表详情 */}
      {tableDetailVisible && (
        <DbModal
          visible={tableDetailVisible}
          onCancel={closeTableDetail}
          data={tableFromOrigin}
        />
      )}
    </div>
  );
};

export default PythonTabContent;
