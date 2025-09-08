import { useCallback, useRef, useState } from 'react';
import {
  getDatasetList,
  createDataset,
  deleteDataset,
  batchDeleteDataset,
  datasetVersionRebuild,
  getTagList
} from '@/api/datasetManagement';
import { Message } from '@arco-design/web-react';
import React from 'react';
import { exportDataset } from '@/api/pyspark';

export const useExportDaset = (currentFileId?: string, execid?: string) => {
  // Modal相关状态
  const [modalDatasetVisible, setModalDatasetVisible] =
    React.useState<boolean>(false);
  const childRef = useRef<{
    resetForm: () => void;
    setcreateTagDisabled: () => void;
  } | null>(null);
  const [tagList, setTagList] = React.useState<{ id: number; name: string }[]>(
    []
  ); //标签列表

  // 关闭弹窗
  const closeModal = () => {
    setModalDatasetVisible(false);
  };

  // 封装获取数据集列表的通用函数
  // const fetchDatasetList = useCallback(async () => {
  //     const params: any = {
  //         page: currentPage,
  //         limit: pageSize,
  //         search: actualSearch,
  //         search_field: actualSearchField
  //     };

  //     // 添加标签过滤参数
  //     if (selectedTagFilters.length > 0) {
  //         params.tag_names = selectedTagFilters;
  //     }
  //     console.log('selectedStorageTypeFilters', selectedStorageTypeFilters);

  //     // 添加存储格式过滤参数
  //     if (selectedStorageTypeFilters.length > 0) {
  //         params.storage_type = selectedStorageTypeFilters;
  //     }

  //     // 添加状态过滤参数
  //     if (selectedStatusFilters.length > 0) {
  //         params.status = selectedStatusFilters;
  //     }

  //     // 添加排序参数
  //     if (sortField) {
  //         params.sort_field = sortField;
  //     }
  //     if (sortOrder) {
  //         params.sort_order = sortOrder;
  //     }

  //     console.log('发送API请求，参数:', params);

  //     try {
  //         const res = await getDatasetList(params);
  //         setDatasetList(res.data?.list || []);
  //         setTotal(res.data?.total || 0);
  //         return res;
  //     } catch (err) {
  //         console.error('获取数据失败:', err);
  //         setDatasetList([]);
  //         setTotal(0);
  //         throw err;
  //     }
  // }, [
  //     currentPage,
  //     pageSize,
  //     actualSearch,
  //     actualSearchField,
  //     selectedTagFilters,
  //     selectedStatusFilters,
  //     selectedStorageTypeFilters,
  //     sortField,
  //     sortOrder
  // ]);

  // 提交表单数据,新建数据集
  const handleSubmit = async (formData: any) => {
    console.log('新建数据集:', formData);
    // let formattedPath;
    // let fullPath;
    // if (formData.dataSource === 'volume') {
    //   const basePath = String(formData?.targetDataSource?.[0]?.[0] ?? '');
    //   formattedPath =
    //     basePath.length > 1 && basePath.endsWith('/')
    //       ? `${basePath}/`
    //       : basePath;
    //   fullPath = `${formattedPath}dst/${formData?.targetDataSource?.[0]?.[1]}/volume/${formData?.targetDataSource?.[1]?.[0] ?? ''}`;
    // }
    const submitData = {
      name: formData.name,
      description: formData.description,
      tag_names: formData.tags || [],
      storage_type: formData.storageType,
      src: formData.dataSource === 'volume' ? 1 : 2, // 1-目标数据目录，2-连接器
      src_extra:
        formData.dataSource === 'volume'
          ? {
              // path: fullPath,
              path_id: formData.targetDataSource?.[1]?.[1] ?? '',
              path_file_ids: formData.path_file_ids || []
            }
          : {
              connector_id: parseInt(formData?.targetDataSource) || 0,
              connector_file_ids: formData?.selectedFiles || []
            }
    };

    console.log('提交数据:', submitData);

    try {
      const createDatasetRes = await exportDataset({
        name: formData.name,
        pyspark_id: currentFileId ? Number(currentFileId) : 0,
        storage_type: formData.storageType,
        file_names: formData.selectedFiles,
        tag_names: formData.tags,
        pyspark_exec_id: execid ?? ''
      });

      if (createDatasetRes.status !== 200) {
        Message.error(createDatasetRes.message ?? '数据集创建失败！');
        return;
      }

      // 刷新数据列表
      // fetchDatasetList();
      // closeModal();

      //获取标签
      // const tagListRes = await getTagList();

      // try {
      //   if (tagListRes.data && Array.isArray(tagListRes.data)) {
      //     setTagList(tagListRes.data);
      //   } else {
      //     console.error('标签列表数据格式错误:', tagListRes);
      //     setTagList([]);
      //   }
      // } catch {
      //   setTagList([]);
      //   Message.error('获取标签列表失败');
      // }

      childRef.current?.resetForm();
      childRef.current?.setcreateTagDisabled();
      // TODO: 补充跳转导出列表的链接
      Message.success('导出任务创建成功，可点击导出列表查看详情');
    } catch {
      Message.error('数据集创建失败！');
    }
  };

  return {
    childRef,
    modalDatasetVisible,
    setModalDatasetVisible,
    handleSubmit
  };
};
