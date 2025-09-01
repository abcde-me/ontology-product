// import React, { FC, useEffect, useRef, useState } from 'react';
// import { Input, Spin, Tree, Typography } from '@arco-design/web-react';
// import { IconFolder, IconFile, IconCommon } from '@arco-design/web-react/icon';
// import { useSqlIndexStore, SqlIndexStore } from '../store';
// import { CatalogListParams } from '@/api/sql';

// const InputSearch = Input.Search;

// interface DataFramesProps {
//   onSelect?: (value: any) => void;
// }

// const DataFrames: FC<DataFramesProps> = (props) => {
//   const { onSelect } = props;

//   const dataframesList = useSqlIndexStore(
//     (state: SqlIndexStore) => state.dataframesList
//   );

//   const loadDataFrames = useSqlIndexStore((state) => state.loadDataFrames);

//   const [inputValue, setInputValue] = useState('');
//   const [treeData, setTreeData] = useState<any | null>(null);
//   const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
//   const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
//   const [loading, setLoading] = useState(false);

//   const treeDataBeforeRef = useRef<any[] | null>(null);

//   useEffect(() => {
//     loadDataFrames()

//     // setLoading(true);

//     // // TODO 模拟数据
//     // setTimeout(() => {
//     //   const data = formatApiData(dataframesList);
//     //   setTreeData(data);
//     //   treeDataBeforeRef.current = data;

//     //   const keys = data.map((item: any) => item.id);
//     //   setExpandedKeys(keys);

//     //   setLoading(false);
//     // }, 50);
//   }, []);

//   useEffect(() => {
//     if (!inputValue) {
//       setTreeData(treeDataBeforeRef.current);
//     } else {
//       const result = searchData(inputValue);
//       setTreeData(result);
//     }
//   }, [inputValue]);

//   function searchData(inputValue: string) {
//     const loop = (data: any) => {
//       const result: any[] = [];
//       data.forEach((item: any) => {
//         if (item.name.toLowerCase().indexOf(inputValue.toLowerCase()) > -1) {
//           result.push({ ...item });
//         } else if (item.children) {
//           const filterData = loop(item.children);

//           if (filterData.length) {
//             result.push({ ...item, children: filterData });
//           }
//         }
//       });
//       return result;
//     };

//     // 使用最新的树形数据
//     return loop(treeDataBeforeRef.current || []);
//   }

//   return (
//     <>
//       <div className="flex h-full flex-col overflow-y-hidden">
//         <InputSearch
//           size="mini"
//           allowClear
//           placeholder="关键字"
//           className="mb-[10px] mt-[10px] px-[20px]"
//           onChange={setInputValue}
//         />

//         <div className="flex-1 overflow-y-auto px-[20px]">
//           {loading && <Spin />}
//           {treeData && treeData.length > 0 && (
//             <>
//               <span className="text-[14px] font-[600]">源数据目录</span>
//               <Tree
//                 blockNode
//                 treeData={treeData}
//                 fieldNames={{
//                   key: 'id',
//                   title: 'name'
//                 }}
//                 expandedKeys={expandedKeys}
//                 selectedKeys={selectedKeys}
//                 onSelect={(keys, extra) => {
//                   console.log(keys, extra);
//                   setSelectedKeys(keys);
//                 }}
//                 onExpand={(keys) => {
//                   setExpandedKeys(keys);
//                 }}
//               ></Tree>
//             </>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default DataFrames;

// function formatApiData(data: any[]): any[] {
//   const addIcon = (item: any): any => {
//     const newItem = { ...item };

//     // 根据类型设置图标
//     switch (item.type) {
//       case 'folder':
//         newItem.icon = <IconFolder className="text-gray-500" />;
//         break;
//       case 'database':
//         newItem.icon = <IconFolder className="text-gray-500" />;
//         break;
//       case 'schema':
//         newItem.icon = <IconCommon className="text-gray-500" />;
//         break;
//       case 'table':
//         newItem.icon = <IconFile className="text-gray-500" />;
//         break;
//       default:
//         newItem.icon = <IconFile className="text-gray-500" />;
//     }

//     // 递归处理子节点
//     if (item.children && item.children.length > 0) {
//       newItem.children = item.children.map(addIcon);
//     }

//     return newItem;
//   };

//   return data.map(addIcon);
// }
