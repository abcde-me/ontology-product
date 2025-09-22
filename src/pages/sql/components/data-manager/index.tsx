import React, { useState } from 'react';
import { Message, Typography } from '@arco-design/web-react';
import DataDirectoryTree from '@/components/sql-data-directory-tree';
import { DatasetListItem } from '@/types/datasetManagement';
import './index.scss';
import { Db } from '@/api/dataCatalog';
import { DataDirectoryTreeFrom } from '@/components/sql-data-directory-tree/types';
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
  const handleInsertDataset = (nodeData: any) => {
    console.log(nodeData);
    const isEditorFocused = getIsEditorFocused?.() ?? false;
    let copyText = '';
    if (nodeData.type === 'dataset') {
      copyText = `\`${nodeData?.data?.database}\`.\`${nodeData?.data?.latest_table}\``;
    }
    if (nodeData.type === 'scheam') {
      // `字段名`
      copyText = `\`${nodeData.title}\``;
    }

    if (isEditorFocused && onInsertContent) {
      // 编辑器聚焦时插入内容
      onInsertContent(copyText);
    } else {
      // 编辑器未聚焦时复制到剪贴板
      copy(copyText);
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
  const handleViewDbDetail = (nodeData: any) => {
    console.log('数据库详情:', nodeData);
    const { type } = nodeData?.data;

    if (type === 'db_item') {
      const searchParams = {
        database: nodeData?.data?.name,
        path_id: nodeData?.data?.parentDB?.id
      };
      setDbFromOrigin(searchParams);
      setDbDetailVisible(true);
    }

    if (type === 'table') {
      const searchParams = {
        databaseName: nodeData?.data?.parentDBItem?.name,
        path_id: nodeData?.data?.parentDBItem?.parentDB?.id,
        table_id: nodeData?.data?.table_id,
        tableName: nodeData?.data?.table_name
      };
      setTableFromOrigin(searchParams);
      setTableDetailVisible(true);
    }
  };

  // 处理数据库插入
  const handleDbInsert = (data: any) => {
    console.log(data, 'nodeData');
    const isEditorFocused = getIsEditorFocused?.() ?? false;
    const { type } = data;
    let copyText = '';
    // 库
    if (type === 'db_item') {
      copyText = `\`${data?.name}\``;
    }
    // 表
    if (type === 'table') {
      copyText = `\`${data?.parentDBItem?.name}\`.\`${data?.table_name}\``;
    }
    // 字段
    if (type === 'column') {
      copyText = `\`${data.name}\``;
    }
    if (isEditorFocused && onInsertContent) {
      // 编辑器聚焦时插入内容
      onInsertContent(copyText);
    } else {
      // 编辑器未聚焦时复制到剪贴板
      copy(copyText);
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
