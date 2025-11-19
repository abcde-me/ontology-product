import React, { useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { useRagDetailStore } from '../../store/ragDetailStore';
import BreadCrumbHeader from '@/components/breadcrumb-header';

const Header: React.FC = () => {
  const history = useHistory();
  const { filePath } = useRagDetailStore();

  // 解析文件路径为面包屑项
  const breadcrumbItems = useMemo(() => {
    if (!filePath) return [];

    // 支持两种格式：
    // 1. /documents/reports/file.pdf
    // 2. 数据集市 / 中油油井结构化问答知识库 / file.pdf
    let pathParts: string[];

    if (filePath.includes(' / ')) {
      // 格式2：使用 " / " 分隔（带空格）
      pathParts = filePath.split(' / ').map((part) => part.trim());
    } else {
      // 格式1：使用 "/" 分隔
      pathParts = filePath.replace(/^\//, '').split('/');
    }

    return pathParts.map((part, index) => ({
      name: part,
      // 最后一项是文件名，不可点击
      isLast: index === pathParts.length - 1
    }));
  }, [filePath]);

  const handleBack = () => {
    history.goBack();
  };

  return (
    <div className="flex h-[56px] items-center px-[20px]">
      <BreadCrumbHeader list={breadcrumbItems} onArrowClick={handleBack} />
    </div>
  );
};

export default Header;
