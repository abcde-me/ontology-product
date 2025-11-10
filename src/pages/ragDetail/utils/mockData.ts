import {
  Segment,
  RagDetailData,
  HierarchicalSegment,
  ImageTextSegment,
  PptSegment,
  TableSegment,
  DirectoryNode
} from '../types';

// 场景1: 基础文本分段（带PDF坐标）
export const mockTextSceneData = (ragId: string): RagDetailData => {
  const segments: Segment[] = [
    {
      id: 'seg_001',
      content:
        '按照本次发行前的股份数计算，对于截止本次发行前本行已经计的最近一个审计基准日的涓存未分配利润，由本次发行前的本行老股东享有其中的 35%，其余部分由老股东和新股东共享；对于基准日之后实现的可分配利润，则全部由老股东和新股东共享。截至 2006 年 12 月 31 日，按涓存未分配利润计算的应由老',
      charCount: 886,
      segmentIndex: 1,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      pdfCoordinate: {
        page: 1,
        x: 50,
        y: 100,
        w: 500,
        h: 150
      }
    },
    {
      id: 'seg_002',
      content:
        '利润计算的应由老股东享有的部分为人民币 1,247.36 万元。本次发行完成后，本行将按照上述原则进行利润分配。',
      charCount: 650,
      segmentIndex: 2,
      createdAt: '2024-01-15T10:31:00Z',
      updatedAt: '2024-01-15T10:31:00Z',
      pdfCoordinate: {
        page: 1,
        x: 50,
        y: 260,
        w: 500,
        h: 90
      }
    },
    {
      id: 'seg_003',
      content:
        '本次发行前，本行的主要股东为中国电子云有限公司、北京市电话通信业务入网服务合同。本次发行完成后，本行将继续保持独立的经营管理体系。',
      charCount: 720,
      segmentIndex: 3,
      createdAt: '2024-01-15T10:32:00Z',
      updatedAt: '2024-01-15T10:32:00Z',
      pdfCoordinate: {
        page: 1,
        x: 50,
        y: 360,
        w: 500,
        h: 120
      }
    },
    {
      id: 'seg_004',
      content:
        '根据《公司法》的规定，本行的利润分配政策为：在弥补亏损和提取法定公积金后，在股东大会的决议下进行分配。',
      charCount: 580,
      segmentIndex: 4,
      createdAt: '2024-01-15T10:33:00Z',
      updatedAt: '2024-01-15T10:33:00Z',
      pdfCoordinate: {
        page: 2,
        x: 50,
        y: 100,
        w: 500,
        h: 100
      }
    },
    {
      id: 'seg_005',
      content:
        '本行将根据实际经营情况和发展需要，制定合理的利润分配方案，以实现股东利益最大化。',
      charCount: 520,
      segmentIndex: 5,
      createdAt: '2024-01-15T10:34:00Z',
      updatedAt: '2024-01-15T10:34:00Z',
      pdfCoordinate: {
        page: 2,
        x: 50,
        y: 210,
        w: 500,
        h: 90
      }
    },
    {
      id: 'seg_006',
      content:
        '本次发行的股票将在上海证券交易所上市交易，股票代码为 XXXX，股票简称为"中国电子云"。',
      charCount: 610,
      segmentIndex: 6,
      createdAt: '2024-01-15T10:35:00Z',
      updatedAt: '2024-01-15T10:35:00Z',
      pdfCoordinate: {
        page: 2,
        x: 50,
        y: 310,
        w: 500,
        h: 90
      }
    },
    {
      id: 'seg_007',
      content:
        '本行承诺将严格遵守相关法律法规，规范运营，为投资者创造长期稳定的回报。',
      charCount: 540,
      segmentIndex: 7,
      createdAt: '2024-01-15T10:36:00Z',
      updatedAt: '2024-01-15T10:36:00Z',
      pdfCoordinate: {
        page: 2,
        x: 50,
        y: 410,
        w: 500,
        h: 90
      }
    }
  ];

  return {
    ragId,
    fileName: '北京市电话通信业务入网服务合同.pdf',
    filePath:
      '数据集市 / 中油油井结构化问答知识库 / 北京市电话通信业务入网服务合同.pdf',
    sceneType: 'pdf' as const, // PDF文件类型
    segments
  };
};

// 场景2: 分层级分段 + 目录树（6级目录，展示时最多5级）
export const mockHierarchicalSceneData = (ragId: string): RagDetailData => {
  const directory: DirectoryNode[] = [
    {
      id: 'dir_1',
      label: '第一章 总则',
      level: 1,
      children: [
        {
          id: 'dir_1_1',
          label: '第一节 基本原则',
          level: 2,
          children: [
            {
              id: 'dir_1_1_1',
              label: '1.1.1 诚实信用原则',
              level: 3,
              segmentIds: ['seg_h_001']
            }
          ]
        },
        {
          id: 'dir_1_2',
          label: '第二节 适用范围',
          level: 2,
          segmentIds: ['seg_h_002']
        }
      ]
    },
    {
      id: 'dir_2',
      label: '第二章 权利义务',
      level: 1,
      children: [
        {
          id: 'dir_2_1',
          label: '第一节 甲方权利',
          level: 2,
          children: [
            {
              id: 'dir_2_1_1',
              label: '2.1.1 知情权',
              level: 3,
              children: [
                {
                  id: 'dir_2_1_1_1',
                  label: '2.1.1.1 财务信息知情权',
                  level: 4,
                  children: [
                    {
                      id: 'dir_2_1_1_1_1',
                      label: '2.1.1.1.1 年度财务报告',
                      level: 5,
                      children: [
                        {
                          id: 'dir_2_1_1_1_1_1',
                          label:
                            '2.1.1.1.1.1 资产负债表（第6级，会被打平到第5级）',
                          level: 6,
                          segmentIds: ['seg_h_003']
                        },
                        {
                          id: 'dir_2_1_1_1_1_2',
                          label: '2.1.1.1.1.2 利润表（第6级，会被打平到第5级）',
                          level: 6,
                          segmentIds: ['seg_h_009']
                        }
                      ]
                    }
                  ]
                },
                {
                  id: 'dir_2_1_1_2',
                  label: '2.1.1.2 经营信息知情权',
                  level: 4,
                  segmentIds: ['seg_h_006']
                }
              ]
            }
          ]
        },
        {
          id: 'dir_2_2',
          label: '第二节 乙方义务',
          level: 2,
          children: [
            {
              id: 'dir_2_2_1',
              label: '2.2.1 履约义务',
              level: 3,
              segmentIds: ['seg_h_004']
            },
            {
              id: 'dir_2_2_2',
              label: '2.2.2 信息披露义务',
              level: 3,
              segmentIds: ['seg_h_005', 'seg_h_007', 'seg_h_008']
            }
          ]
        }
      ]
    }
  ];

  const segments: HierarchicalSegment[] = [
    {
      id: 'seg_h_001',
      content:
        '本合同遵循平等、自愿、公平、诚实信用的原则。双方应当遵守法律法规，尊重社会公德，不得损害社会公共利益。合同的订立、履行、变更、解除等均应遵循上述原则。',
      charCount: 456,
      segmentIndex: 1,
      level: 3,
      parentId: 'dir_1_1_1',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      pdfCoordinate: {
        page: 1,
        x: 50,
        y: 100,
        w: 500,
        h: 150
      }
    },
    {
      id: 'seg_h_002',
      content:
        '本合同适用于中华人民共和国境内的各类企业和个人。凡在中华人民共和国境内从事经营活动的企业和个人，均应遵守本合同的规定。',
      charCount: 389,
      segmentIndex: 2,
      level: 2,
      parentId: 'dir_1_2',
      createdAt: '2024-01-15T10:35:00Z',
      updatedAt: '2024-01-15T10:35:00Z',
      pdfCoordinate: {
        page: 1,
        x: 50,
        y: 260,
        w: 500,
        h: 90
      }
    },
    {
      id: 'seg_h_003',
      content:
        '资产负债表是反映企业在某一特定日期财务状况的会计报表。甲方有权查阅乙方的资产负债表，了解其资产、负债和所有者权益的构成情况。资产负债表应当真实、准确、完整地反映企业的财务状况。',
      charCount: 523,
      segmentIndex: 3,
      level: 6,
      parentId: 'dir_2_1_1_1_1_1',
      createdAt: '2024-01-15T10:40:00Z',
      updatedAt: '2024-01-15T10:40:00Z',
      pdfCoordinate: {
        page: 2,
        x: 50,
        y: 100,
        w: 500,
        h: 180
      }
    },
    {
      id: 'seg_h_004',
      content:
        '乙方应按照本合同的约定履行相关义务，不得违反法律法规。乙方应当按时交付产品或提供服务，保证产品质量符合约定标准。如因乙方原因导致违约，应当承担相应的违约责任。',
      charCount: 612,
      segmentIndex: 4,
      level: 3,
      parentId: 'dir_2_2_1',
      createdAt: '2024-01-15T10:45:00Z',
      updatedAt: '2024-01-15T10:45:00Z',
      pdfCoordinate: {
        page: 2,
        x: 50,
        y: 290,
        w: 500,
        h: 120
      }
    },
    {
      id: 'seg_h_005',
      content:
        '乙方应保证提供的信息真实、准确、完整。乙方应当及时向甲方披露可能影响合同履行的重大事项，包括但不限于经营状况变化、重大诉讼、资产重组等。',
      charCount: 445,
      segmentIndex: 5,
      level: 3,
      parentId: 'dir_2_2_2',
      createdAt: '2024-01-15T10:50:00Z',
      updatedAt: '2024-01-15T10:50:00Z',
      pdfCoordinate: {
        page: 3,
        x: 50,
        y: 100,
        w: 500,
        h: 100
      }
    },
    {
      id: 'seg_h_006',
      content:
        '甲方有权了解乙方的日常经营活动、市场策略、产品研发等信息。乙方应当定期向甲方报告经营情况，包括销售数据、市场份额、客户反馈等。',
      charCount: 398,
      segmentIndex: 6,
      level: 4,
      parentId: 'dir_2_1_1_2',
      createdAt: '2024-01-15T10:55:00Z',
      updatedAt: '2024-01-15T10:55:00Z',
      pdfCoordinate: {
        page: 2,
        x: 50,
        y: 420,
        w: 500,
        h: 110
      }
    },
    {
      id: 'seg_h_007',
      content:
        '乙方应当建立健全信息披露制度，确保信息披露的及时性、准确性和完整性。对于可能影响甲方权益的重大事项，乙方应当在第一时间通知甲方。',
      charCount: 467,
      segmentIndex: 7,
      level: 3,
      parentId: 'dir_2_2_2',
      createdAt: '2024-01-15T11:00:00Z',
      updatedAt: '2024-01-15T11:00:00Z',
      pdfCoordinate: {
        page: 3,
        x: 50,
        y: 210,
        w: 500,
        h: 105
      }
    },
    {
      id: 'seg_h_008',
      content:
        '乙方违反信息披露义务的，应当承担相应的法律责任。甲方有权要求乙方赔偿因信息披露不实或不及时造成的损失。',
      charCount: 356,
      segmentIndex: 8,
      level: 3,
      parentId: 'dir_2_2_2',
      createdAt: '2024-01-15T11:05:00Z',
      updatedAt: '2024-01-15T11:05:00Z',
      pdfCoordinate: {
        page: 3,
        x: 50,
        y: 325,
        w: 500,
        h: 85
      }
    },
    {
      id: 'seg_h_009',
      content:
        '利润表是反映企业在一定会计期间经营成果的会计报表。甲方有权查阅乙方的利润表，了解其收入、成本、费用和利润的情况。利润表应当真实、准确、完整地反映企业的经营成果。',
      charCount: 498,
      segmentIndex: 9,
      level: 6,
      parentId: 'dir_2_1_1_1_1_2',
      createdAt: '2024-01-15T11:10:00Z',
      updatedAt: '2024-01-15T11:10:00Z',
      pdfCoordinate: {
        page: 2,
        x: 50,
        y: 290,
        w: 500,
        h: 170
      }
    }
  ];

  return {
    ragId,
    fileName: '合同协议.pdf',
    filePath: '数据集市 / 法律文件 / 合同协议.pdf',
    sceneType: 'pdf' as const, // PDF文件类型（包含层级结构）
    segments,
    directory
  };
};

// 场景3: 图文混合分段
export const mockImageTextSceneData = (ragId: string): RagDetailData => {
  const segments: ImageTextSegment[] = [
    {
      id: 'seg_img_001',
      content:
        '按照本次发行前的股份数计算，对于截止本次发行前本行已经计的最近一个审计基准日的涓存未分配利润...',
      charCount: 886,
      segmentIndex: 1,
      images: [
        {
          id: 'img_001',
          url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300',
          caption: '风景图片示例'
        }
      ],
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 'seg_img_002',
      content:
        '本行在报告期内实现营业收入人民币 1,234.56 万元，同比增长 15.3%。其中，利息收入为 856.78 万元...',
      charCount: 756,
      segmentIndex: 2,
      images: [
        {
          id: 'img_002',
          url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300',
          caption: '数据图表'
        },
        {
          id: 'img_003',
          url: 'https://images.unsplash.com/photo-1460925895917-adf4e565db18?w=400&h=300',
          caption: '分析图表'
        }
      ],
      createdAt: '2024-01-15T10:35:00Z',
      updatedAt: '2024-01-15T10:35:00Z'
    },
    {
      id: 'seg_img_003',
      content:
        '根据《中华人民共和国商业银行法》等相关法律法规的规定，本行建立了完善的风险管理体系...',
      charCount: 654,
      segmentIndex: 3,
      createdAt: '2024-01-15T10:40:00Z',
      updatedAt: '2024-01-15T10:40:00Z'
    }
  ];

  return {
    ragId,
    fileName: '年度报告.pdf',
    filePath: '数据集市 / 报告文件 / 年度报告.pdf',
    sceneType: 'pdf' as const, // PDF文件类型（包含图文混合）
    segments
  };
};

// 场景4: PPT展示
export const mockPptSceneData = (ragId: string): RagDetailData => {
  const segments: PptSegment[] = [
    {
      id: 'seg_ppt_001',
      content: '2024年度工作总结与展望',
      charCount: 120,
      segmentIndex: 1,
      slideNumber: 1,
      slideTitle: '封面',
      slideContent: '2024年度工作总结与展望',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 'seg_ppt_002',
      content:
        '本年度实现营业收入1,234.56万元，同比增长15.3%。利润总额456.78万元，同比增长12.5%。',
      charCount: 456,
      segmentIndex: 2,
      slideNumber: 2,
      slideTitle: '财务成果',
      slideContent:
        '本年度实现营业收入1,234.56万元，同比增长15.3%。利润总额456.78万元，同比增长12.5%。',
      createdAt: '2024-01-15T10:35:00Z',
      updatedAt: '2024-01-15T10:35:00Z'
    },
    {
      id: 'seg_ppt_003',
      content:
        '完成了5个重点项目，投入资金2,000万元，创造了显著的经济效益和社会效益。',
      charCount: 389,
      segmentIndex: 3,
      slideNumber: 3,
      slideTitle: '项目成果',
      slideContent:
        '完成了5个重点项目，投入资金2,000万元，创造了显著的经济效益和社会效益。',
      createdAt: '2024-01-15T10:40:00Z',
      updatedAt: '2024-01-15T10:40:00Z'
    },
    {
      id: 'seg_ppt_004',
      content:
        '2025年将继续深化改革，推进创新发展，力争实现营业收入增长20%以上。',
      charCount: 312,
      segmentIndex: 4,
      slideNumber: 4,
      slideTitle: '2025年展望',
      slideContent:
        '2025年将继续深化改革，推进创新发展，力争实现营业收入增长20%以上。',
      createdAt: '2024-01-15T10:45:00Z',
      updatedAt: '2024-01-15T10:45:00Z'
    }
  ];

  return {
    ragId,
    fileName: '2024年度工作总结.pptx',
    filePath: '数据集市 / 演示文件 / 2024年度工作总结.pptx',
    sceneType: 'ppt' as const,
    segments
  };
};

// 场景5: 表格分段
export const mockTableSceneData = (ragId: string): RagDetailData => {
  const segments: TableSegment[] = [
    {
      id: 'seg_table_001',
      content: '员工信息表',
      charCount: 200,
      segmentIndex: 1,
      tableData: {
        headers: ['员工ID', '姓名', '部门', '职位', '入职日期', '月薪（元）'],
        rows: [
          {
            员工ID: 'E001',
            姓名: '张三',
            部门: '技术部',
            职位: '高级工程师',
            入职日期: '2020/3/15',
            '月薪（元）': '18,000'
          },
          {
            员工ID: 'E002',
            姓名: '李四',
            部门: '市场部',
            职位: '市场经理',
            入职日期: '2019/7/1',
            '月薪（元）': '15,500'
          },
          {
            员工ID: 'E003',
            姓名: '王五',
            部门: '销售部',
            职位: '销售代表',
            入职日期: '2021/5/20',
            '月薪（元）': '8,000'
          },
          {
            员工ID: 'E004',
            姓名: '赵六',
            部门: '技术部',
            职位: '实习生',
            入职日期: '2022/2/10',
            '月薪（元）': '4,500'
          }
        ]
      },
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 'seg_table_002',
      content: '销售数据表',
      charCount: 180,
      segmentIndex: 2,
      tableData: {
        headers: [
          '产品名称',
          '2023年销售额',
          '2024年销售额',
          '增长率',
          '市场占有率'
        ],
        rows: [
          {
            产品名称: '产品A',
            '2023年销售额': '1,200万',
            '2024年销售额': '1,500万',
            增长率: '25%',
            市场占有率: '15%'
          },
          {
            产品名称: '产品B',
            '2023年销售额': '800万',
            '2024年销售额': '1,000万',
            增长率: '25%',
            市场占有率: '10%'
          },
          {
            产品名称: '产品C',
            '2023年销售额': '600万',
            '2024年销售额': '900万',
            增长率: '50%',
            市场占有率: '9%'
          }
        ]
      },
      createdAt: '2024-01-15T10:35:00Z',
      updatedAt: '2024-01-15T10:35:00Z'
    }
  ];

  return {
    ragId,
    fileName: '数据统计表.xlsx',
    filePath: '数据集市 / 表格文件 / 数据统计表.xlsx',
    sceneType: 'excel' as const, // Excel文件类型
    segments
  };
};

/**
 * 真实API设计：根据ragId返回对应的Mock数据
 *
 * ragId 是一个随机数字ID，API根据该ID返回对应的文档数据
 * 返回的数据中包含 type 字段来区分左侧内容类型（pdf、ppt、table）
 * 根据 treeData 是否有数据来决定是否渲染目录树
 *
 * ragId 映射关系：
 * - 1001: 基础文本分段 (PDF + 文本分段)
 * - 1002: 分层级分段 (PDF + 目录树 + 分层级分段)
 * - 1003: 图文混合分段 (PDF + 图文混合分段)
 * - 1004: PPT展示 (PPT + PPT分段)
 * - 1005: 表格分段 (表格 + 表格分段)
 */
export const mockRagDetailData = (ragId: string): RagDetailData => {
  // 根据ragId返回对应的数据
  switch (ragId) {
    case '1001':
      // 基础文本分段：PDF + 文本分段，无目录树
      return {
        ragId: '1001',
        fileName: '中国银行2023年年报.pdf',
        filePath: '/documents/reports/中国银行2023年年报.pdf',
        sceneType: 'pdf', // PDF文件类型
        segments: mockTextSceneData(ragId).segments
        // 无 directory，不渲染目录树
      };

    case '1002':
      // 分层级分段：PDF + 目录树 + 分层级分段
      return {
        ragId: '1002',
        fileName: '产品设计文档.pdf',
        filePath: '/documents/design/产品设计文档.pdf',
        sceneType: 'pdf', // PDF文件类型（包含层级结构）
        segments: mockHierarchicalSceneData(ragId).segments,
        directory: mockHierarchicalSceneData(ragId).directory // 有目录树数据，自动渲染层级结构
      };

    case '1003':
      // 图文混合分段：PDF + 图文混合分段，无目录树
      return {
        ragId: '1003',
        fileName: '产品宣传册.pdf',
        filePath: '/documents/marketing/产品宣传册.pdf',
        sceneType: 'pdf', // PDF文件类型（包含图文混合）
        segments: mockImageTextSceneData(ragId).segments
        // 无 directory，不渲染目录树，但segments包含images字段，自动渲染图文混合
      };

    case '1004':
      // PPT展示：PPT + PPT分段，无目录树
      return {
        ragId: '1004',
        fileName: '2024年度计划.pptx',
        filePath: '/documents/presentations/2024年度计划.pptx',
        sceneType: 'ppt', // PPT文件类型
        segments: mockPptSceneData(ragId).segments
        // 无 directory，不渲染目录树
      };

    case '1005':
      // 表格分段：Excel + 表格分段，无目录树
      return {
        ragId: '1005',
        fileName: '销售数据统计.xlsx',
        filePath: '/documents/data/销售数据统计.xlsx',
        sceneType: 'excel', // Excel文件类型
        segments: mockTableSceneData(ragId).segments
        // 无 directory，不渲染目录树
      };

    default:
      // 默认返回基础文本分段
      return {
        ragId: ragId,
        fileName: '默认文档.pdf',
        filePath: '/documents/default.pdf',
        sceneType: 'pdf', // PDF文件类型
        segments: mockTextSceneData(ragId).segments
      };
  }
};

export const mockSegmentList = () => {
  return mockRagDetailData('1001').segments;
};
