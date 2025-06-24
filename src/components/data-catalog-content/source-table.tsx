// components/CustomDbIcon.js
import React, { useEffect, useState } from 'react';
//数据库图标（从里图标库拿，转换成组件的形式）
const CustomDbIcon: any = () => (
  <svg
    className="icon"
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    style={{ marginRight: 6 }}
  >
    <path
      d="M522.666667 96l8.533333 0.042667a910.08 910.08 0 0 1 91.562667 5.333333l14.549333 1.706667 15.402667 2.133333 15.125333 2.410667 7.573333 1.322666 14.890667 2.837334c125.205333 25.322667 212.928 79.488 216.256 150.677333l0.106667 4.202667v448c0 73.258667-88.704 129.066667-216.362667 154.88l-14.890667 2.837333-7.573333 1.322667-15.125333 2.389333-15.402667 2.133333c-36.266667 4.650667-74.773333 7.104-114.645333 7.104-39.872 0-78.378667-2.453333-114.645334-7.104l-15.402666-2.133333-15.125334-2.389333c-137.088-23.189333-235.264-79.488-238.72-154.901334L138.666667 714.666667v-448l0.106666-4.202667c3.328-71.189333 91.050667-125.354667 216.256-150.677333l14.890667-2.837334 7.573333-1.322666 15.125334-2.389334 15.402666-2.133333a892.202667 892.202667 0 0 1 97.642667-6.954667L522.666667 96z m145.173333 543.04l-15.125333 2.389333-15.402667 2.133334c-36.266667 4.650667-74.773333 7.104-114.645333 7.104-39.872 0-78.378667-2.453333-114.645334-7.104l-15.402666-2.133334-15.125334-2.389333c-71.488-12.096-132.416-33.194667-174.826666-61.312V714.666667c0 20.949333 24.170667 42.773333 65.066666 61.184l9.749334 4.181333c15.04 6.186667 32 11.925333 50.602666 17.024l12.650667 3.306667c12.864 3.2 26.453333 6.144 40.597333 8.704l14.378667 2.453333 14.741333 2.197333c9.962667 1.386667 20.16 2.602667 30.570667 3.626667l15.765333 1.408 16.064 1.109333 16.362667 0.810667a845.994667 845.994667 0 0 0 66.901333 0l16.362667-0.810667 16.064-1.109333 15.786667-1.408c10.389333-1.024 20.586667-2.24 30.549333-3.626667l14.741333-2.197333 14.378667-2.453333c14.165333-2.56 27.733333-5.482667 40.597333-8.704l12.650667-3.306667c18.602667-5.12 35.562667-10.837333 50.602667-17.024l9.749333-4.181333c39.317333-17.706667 63.189333-38.549333 64.96-58.773334l0.106667-2.410666v-136.96c-42.389333 28.138667-103.317333 49.237333-174.826667 61.333333zM842.666667 364.373333c-40.298667 26.730667-97.28 47.104-164.202667 59.456l-10.666667 1.877334-15.104 2.389333-15.402666 2.133333c-36.266667 4.650667-74.773333 7.104-114.645334 7.104-34.176 0-67.349333-1.792-98.986666-5.248l-15.658667-1.856-15.402667-2.133333-15.125333-2.389333c-71.488-12.096-132.416-33.194667-174.826667-61.312V480c0 20.949333 24.170667 42.773333 65.066667 61.184l9.749333 4.181333c15.04 6.186667 32 11.925333 50.602667 17.024l12.650667 3.306667c12.864 3.2 26.453333 6.144 40.597333 8.704l14.378667 2.453333 14.741333 2.197334c9.962667 1.386667 20.16 2.602667 30.570667 3.626666l15.765333 1.408 16.064 1.109334 16.362667 0.810666a845.994667 845.994667 0 0 0 66.901333 0l16.362667-0.810666 16.064-1.109334 15.786666-1.408c10.389333-1.024 20.586667-2.24 30.549334-3.626666l14.741333-2.197334 14.378667-2.453333c14.165333-2.56 27.733333-5.482667 40.597333-8.704l12.650667-3.306667c18.602667-5.12 35.562667-10.837333 50.602666-17.024l9.749334-4.181333c39.317333-17.706667 63.189333-38.549333 64.96-58.773333l0.106666-2.410667v-115.626667zM522.666667 160l-8.448 0.042667-12.586667 0.213333-12.416 0.405333-16.362667 0.810667-16.064 1.109333-15.786666 1.408c-6.933333 0.682667-13.76 1.450667-20.501334 2.304l-10.026666 1.322667-14.762667 2.197333-14.378667 2.453334c-10.624 1.92-20.906667 4.053333-30.826666 6.336l-9.770667 2.346666-12.650667 3.328c-15.488 4.266667-29.866667 8.96-42.922666 13.973334l-7.68 3.050666-9.749334 4.181334c-40.896 18.410667-65.066667 40.234667-65.066666 61.184 0 20.053333 22.122667 40.874667 59.84 58.773333l5.226666 2.410667 9.749334 4.181333c12.522667 5.162667 26.389333 10.005333 41.450666 14.421333l9.173334 2.602667 12.629333 3.306667c9.642667 2.410667 19.690667 4.650667 30.08 6.72l10.517333 1.984 14.378667 2.453333 14.741333 2.197333c6.634667 0.938667 13.376 1.770667 20.224 2.56l10.346667 1.066667 15.765333 1.408 16.064 1.109333 16.362667 0.810667a845.994667 845.994667 0 0 0 55.872 0.362667l11.029333-0.362667 16.362667-0.810667 16.064-1.109333 15.786667-1.408c6.933333-0.682667 13.76-1.450667 20.501333-2.304l10.026667-1.322667 14.762666-2.197333 14.378667-2.453333c10.624-1.92 20.906667-4.053333 30.826667-6.336l9.770666-2.346667 12.650667-3.328c15.488-4.266667 29.866667-8.96 42.922667-13.973333l7.68-3.050667 9.749333-4.181333c40.896-18.410667 65.066667-40.234667 65.066667-61.184 0-20.053333-22.122667-40.874667-59.84-58.773334l-5.226667-2.410666-9.749333-4.181334a424.469333 424.469333 0 0 0-41.450667-14.421333l-9.173333-2.602667-12.629334-3.306666a623.658667 623.658667 0 0 0-30.08-6.72l-10.517333-1.984-14.378667-2.453334-14.741333-2.197333a765.994667 765.994667 0 0 0-20.224-2.56l-10.346667-1.066667-15.765333-1.408-16.064-1.109333-16.362667-0.810667c-7.317333-0.298667-14.72-0.490667-22.186666-0.597333L522.666667 160z"
      fill="#1677FF"
    ></path>
  </svg>
);



import { Tree, Typography, Button, Message, Modal } from '@arco-design/web-react';
import { IconFolder } from '@arco-design/web-react/icon';
import { getDataCatalogList, getCatalogList } from '@/api/dataCatalog'
//getDataCatalogList是获取表格中的数据，getDataCatalog是获取左侧树状结构的数据，getCatalogList是获取目录列表




import SmartTable from './components/SmartTable';
import Pages from './components/pages'
import './index.css';
import { sourceDataVolume, sourceDataDatabase, targetDataVolume, targetDataDatabase } from './source-columns'
import FormComponent from './components/Dataset-form'
const { Text } = Typography;//使用Text来控制文字的效果


const rawCatalogData =
{
  "src": {
    "catalog1": {
      "volume": [
        "source-vol1",
        "source-vol2",
        "source-vol3"
      ],
      "db": [
        "source-db1",
        "source-db2",
        "source-db3"
      ]
    },
    "catalog2": {
      "volume": [
        "source-vol1",
        "source-vol2",
        "source-vol3"
      ],
      "db": [
        "source-db1",
        "source-db2",
        "source-db3"
      ]
    }
  },
  "dst": {
    "catalog1": {
      "volume": [
        "source-vol1",
        "source-vol2",
        "source-vol3"
      ],
      "db": [
        "source-db1",
        "source-db2",
        "source-db3"
      ]
    },
    "catalog2": {
      "volume": [
        "source-vol1",
        "source-vol2",
        "source-vol3"
      ],
      "db": [
        "source-db1",
        "source-db2",
        "source-db3"
      ]
    }
  }
}
//将后端返回的数据改成tree可以识别的数据
{
  // function convertToArcoTreeData(data: any, handleTreeSelect: any): any[] {
  //   const result: any[] = [];
  //   //后续有过有其他的目录可以在这里增加
  //   for (const directionKey of ['src', 'dst']) {
  //     const directionNode = {
  //       key: directionKey,
  //       title: directionKey == 'src' ? '源数据' : '目标数据',
  //       children: [] as any[]
  //     };
  //     //catalogs是源数据或者目标数据
  //     const catalogs = data[directionKey];
  //     for (const catalogName in catalogs) {//catalogName是目录名
  //       const catalogNode = {
  //         key: `${directionKey}-${catalogName}`,
  //         title: catalogName,
  //         children: [] as any[]
  //       };

  //       const types = catalogs[catalogName];//types是目录下的类型（volume或者db）
  //       for (const typeName in types) {
  //         const typeNode = {
  //           key: `${directionKey}-${catalogName}-${typeName}`,
  //           title: typeName === 'volume' ? '卷 Volume' : '库 DB',
  //           children: [] as any[]
  //         };

  //         const items = types[typeName];
  //         for (const item of items) {
  //           typeNode.children.push({
  //             key: `${directionKey}-${catalogName}-${typeName}-${item}`,
  //             title: (
  //               <span onClick={() => handleTreeSelect(directionKey + '/' + catalogName + '/' + typeName + '/' + item,directionKey,typeName)}>
  //                 {typeName === 'db' ? <CustomDbIcon /> : <IconFolder style={{ marginRight: 6 }} />}
  //                 {item}
  //               </span>
  //             )
  //           });
  //         }

  //         catalogNode.children.push(typeNode);
  //       }

  //       directionNode.children.push(catalogNode);
  //     }

  //     result.push(directionNode);
  //   }

  //   return result;
  // }
}

interface TreeNode {
  key: string;
  title: React.ReactNode;
  children?: TreeNode[];
}

type DataType = {
  [direction: string]: {
    [catalog: string]: {
      volume?: string[];
      db?: string[];
    };
  };
};

function convertToArcoTreeData(data: DataType, handleTreeSelect: (fullPath: string, direction: string, type: string) => void): TreeNode[] {
  const createItemNode = (direction: string, catalog: string, type: string, item: string): TreeNode => ({
    key: `${direction}-${catalog}-${type}-${item}`,
    title: (
      <span onClick={() => handleTreeSelect(`${direction}/${catalog}/${type}/${item}`, direction, type)}>
        {type === 'db' ? <CustomDbIcon /> : <IconFolder style={{ marginRight: 6 }} />}
        {item}
      </span>
    )
  });

  const createTypeNode = (direction: string, catalog: string, type: string, items: string[]): TreeNode => ({
    key: `${direction}-${catalog}-${type}`,
    title: type === 'db' ? '库 DB' : '卷 Volume',
    children: items.map(item => createItemNode(direction, catalog, type, item))
  });

  const createCatalogNode = (direction: string, catalog: string, types: any): TreeNode => ({
    key: `${direction}-${catalog}`,
    title: catalog,
    children: Object.entries(types).map(([type, items]: [string, string[]]) =>
      createTypeNode(direction, catalog, type, items)
    )
  });

  return ['src', 'dst'].map(direction => ({
    key: direction,
    title: direction === 'src' ? '源数据' : '目标数据',
    children: Object.entries(data[direction] || {}).map(([catalog, types]) =>
      createCatalogNode(direction, catalog, types)
    )
  }));
}


//将日期字符串转换为时间戳
function toUnixTimestamp(dateString) {
  const date = new Date(dateString.replace(' ', 'T'));
  return Math.floor(date.getTime() / 1000);
}





const data = [
  {
    id: 4,
    content: '插图展示唐僧与孙悟空在火焰山对战红孩儿的场景...',
    type: 'pdf',
    createdAt: '2025-02-25 09:18:45',
    file: '西游插图.jpg',
    workflowId: 'WF-20250225-001',
  },
  {
    id: 5,
    content: '音频片段包含经典西游记电视剧主题曲《敢不敢》的部分片段...',
    type: 'txt',
    createdAt: '2025-02-25 10:40:18',
    file: '西游配乐.mp3',
    workflowId: 'WF-20250225-002',
  },
  {
    id: 6,
    content: '视频片段展示1986年版西游记电视剧中孙悟空大闹天宫的经典场景...',
    type: 'doc',
    createdAt: '2025-02-25 15:05:32',
    file: '西游片段.mp4',
    workflowId: 'WF-20250225-003',
  },
  {
    id: 0,
    content: '第一回 灵根子守山神，孙悟空开石洞。一日，花果山顶突然石破天惊...',
    type: 'pdf',
    createdAt: '2025-02-24 17:40:22',
    file: '西游.pdf',
    workflowId: 'WF-20250224-001',
  },
  {
    id: 1,
    content: '唐僧取经路上遭遇了九九八十一难，其中最著名的是白骨精三打...',
    type: 'doc',
    createdAt: '2025-02-24 17:42:15',
    file: '西游.pdf',
    workflowId: 'WF-20250224-001',
  },
  {
    id: 2,
    content: '网络安全防护包括防火墙配置、入侵检测系统、加密措施等核心内容...',
    type: 'txt',
    createdAt: '2025-02-26 10:30:45',
    file: '信息安全必知.pdf',
    workflowId: 'WF-20250226-002',
  },
  {
    id: 3,
    content: '2025年第一季度销售数据显示，电子产品类别同比增长12.7%...',
    type: 'pdf',
    createdAt: '2025-03-10 12:20:18',
    file: '数据报告.pdf',
    workflowId: 'WF-20250310-003',
  },
];




function DataPage(props) {
  const { selectedNode, onSelectionChange,searchValue} = props;
  const [treeData, setTreeData] = React.useState([])
  // const [searchValue, setSearchValue] = React.useState('')
  const [startTime, setStartTime] = React.useState('')
  const [endTime, setEndTime] = React.useState('')
  //searchValue 为搜索框的值,startTime为开始时间,endTime为结束时间
  const [visible, setVisible] = React.useState(false);
  //删除的弹框控制
  const [columns, setColumns] = React.useState(() => sourceDataVolume(downloadShow))//默认是第一个
  const [downloadData, setDownloadData] = React.useState([])//下载的数据
  const [selectedFilePath, setSelectedFilePath] = React.useState('')//选中的文件路径
  //设一个值表示他渲染的是那种类型的数据，默认是源数据
  const [tableData, setTableData] = React.useState([])

  // 分页状态
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)//每页条数
  const [total, setTotal] = React.useState(100)//总条数

  // 表格选择状态
  const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([])
  const [selectedRows, setSelectedRows] = React.useState<any[]>([])

  const handleTreeSelect = (item: any, directionKey: string, type: string) => {
    setSelectedFilePath(item)
    console.log(item)
    console.log(directionKey, type)
    if (directionKey === 'src' && type === 'volume') {
      setColumns(() => sourceDataVolume(downloadShow))
    } else if (directionKey === 'src' && type === 'db') {
      setColumns(() => sourceDataDatabase(downloadShow))
    } else if (directionKey === 'dst' && type === 'volume') {
      setColumns(() => targetDataVolume(downloadShow))
    } else if (directionKey === 'dst' && type === 'db') {
      setColumns(() => targetDataDatabase(downloadShow))
    }
  }

  function downloadShow(visible, downloaddata) {//控制下载弹框的显示和隐藏
    setVisible(visible)
    console.log(downloaddata)
    setDownloadData(downloaddata)
  }

  // 处理表格选择变化
  const handleSelectionChange = (selectedRowKeys: React.Key[], selectedRows: any[]) => {
    setSelectedRowKeys(selectedRowKeys)
    setSelectedRows(selectedRows)
    console.log('表格选择变化:', selectedRowKeys, '长度吗', selectedRows)

    // 调用外部传入的回调函数
    console.log('DataPage - 准备调用外部回调函数, onSelectionChange存在:', !!onSelectionChange);
    if (onSelectionChange) {
      console.log('DataPage - 调用外部回调函数, 参数:', selectedRowKeys, selectedRows);
      onSelectionChange(selectedRowKeys, selectedRows);
    }
  }

  // 处理从外部传入的selectedNode
  React.useEffect(() => {
    if (selectedNode) {
      // 这里可以根据selectedNode来更新表格数据
      // 暂时保持原有的逻辑，后续可以根据需要扩展
      console.log('Selected node changed:', selectedNode);
    }
  }, [selectedNode]);

  // 页码变化处理
  const handlePageChange = (page: number, size: number) => {
    console.log('页码变化:', page, '每页条数:', size)
    setCurrentPage(page)
    setPageSize(size)
    // 这里可以添加获取数据的逻辑
  }

  // 每页条数变化处理
  const handlePageSizeChange = (page: number, size: number) => {
    console.log('每页条数变化:', page, '每页条数:', size)
    setCurrentPage(page)
    setPageSize(size)
    // 这里可以添加获取数据的逻辑
  }

  useEffect(() => {
    // getCatalogList().then(res => {
    //   setTreeData(convertToArcoTreeData(res.data, handleTreeSelect))
    // })
    setTreeData(convertToArcoTreeData(rawCatalogData, handleTreeSelect))//测试使用，有数据以后可以将rawCatalogData改成后端返回的数据
  }, [])

  //监听搜索条件变化
  useEffect(() => {
    // getDataCatalogList({
    //   start_time:toUnixTimestamp(startTime),
    //   end_time:toUnixTimestamp(endTime),
    //   file_name:searchValue,
    //   file_path:selectedFilePath,
    //   page:currentPage,
    //   page_size:pageSize,
    // }).then(res=>{
    //   console.log(res)
    // })
    if(searchValue){
      setTableData(data.filter(item => item.content.includes(searchValue)))
    }else{
      setTableData(data)
    }
    // setTableData(data)//测试使用
  }, [searchValue, startTime, endTime, selectedFilePath, currentPage, pageSize])
  return (
    <>
      <div>
        <SmartTable
          columns={columns}
          data={tableData}
          selectedArray={selectedRowKeys as []}
          onSelectionChange={handleSelectionChange}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
          <span></span>
          <Pages
            current={currentPage}//当前页码
            total={data.length}
            pageSize={pageSize}//每页条数
            onChange={handlePageChange}//页码变化处理
            onPageSizeChange={handlePageSizeChange}//每页条数变化处理
          />
        </div>

      </div>

      <Modal
        title='导出设置'
        visible={visible}
        onOk={() => setVisible(false)}
        onCancel={() => setVisible(false)}
        autoFocus={false}
        focusLock={true}
        footer={null}
      >
        <FormComponent downloadData={downloadData} onCancel={() => setVisible(false)} />
      </Modal>
    </>
  );
}

export default DataPage;
