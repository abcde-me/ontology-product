/**
 * Scene Router Component
 * 根据文件类型（fileType/sceneType）渲染不同的场景组件
 * - PDF: 自动根据数据判断是普通文本、层级结构还是图文混合
 * - PPT: PPT场景
 * - Excel: 表格场景
 */

import React from 'react';
import { SceneType } from '../types';
import PdfSceneContent from './scenes/pdf/PdfSceneContent';
import PptSceneContent from './scenes/ppt/PptSceneContent';
import TableSceneContent from './scenes/table/TableSceneContent';

interface SceneRouterProps {
  sceneType: SceneType;
  showPdfViewer: boolean;
  loading: boolean;
}

const SceneRouter: React.FC<SceneRouterProps> = ({
  sceneType,
  showPdfViewer,
  loading
}) => {
  switch (sceneType) {
    case 'pdf':
      // PDF场景：根据数据自动判断渲染模式（文本/层级/图文）
      return (
        <PdfSceneContent showPdfViewer={showPdfViewer} loading={loading} />
      );

    case 'ppt':
      // PPT场景
      return <PptSceneContent loading={loading} />;

    case 'excel':
      // Excel/表格场景
      return <TableSceneContent loading={loading} />;

    default:
      // 默认使用PDF场景（向后兼容旧的sceneType值）
      return (
        <PdfSceneContent showPdfViewer={showPdfViewer} loading={loading} />
      );
  }
};

export default SceneRouter;
