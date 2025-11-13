/**
 * Scene Router Component
 * 根据文件类型（fileType/sceneType）渲染不同的场景组件
 * - PDF/PPT: 使用PdfSceneContent渲染（后端返回相同的二进制数据格式）
 * - Excel: 表格场景
 */

import React from 'react';
import { SceneType } from '../types';
import PdfSceneContent from './scenes/pdf/PdfSceneContent';
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
    case 'ppt':
      // PDF/PPT场景：使用相同的处理方式
      // 后端返回相同的二进制数据格式，浏览器无法直接展示PPT，
      // 所以PPT也通过PDF查看器渲染
      return (
        <PdfSceneContent showPdfViewer={showPdfViewer} loading={loading} />
      );

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
