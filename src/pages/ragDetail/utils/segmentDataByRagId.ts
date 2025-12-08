import { SegmentData } from './segmentData';

/**
 * 根据ragId获取对应的分段数据
 * ragId=1001: 纯文本分段
 * ragId=1002: 纯文本分段
 * ragId=1003: 图文混排分段(包含图片)
 * ragId=1004: PPT分段
 * ragId=1005: 表格分段
 */
export function getSegmentDataByRagId(ragId: string) {
  if (ragId === '1003') {
    return SegmentData_1003;
  }

  if (ragId === '1004') {
    return SegmentData_1004;
  }

  if (ragId === '1005') {
    return SegmentData_1005;
  }

  // ragId=1001 和 1002 使用相同的纯文本分段数据
  return SegmentData;
}

// ragId=1003 的图文混排分段数据
export const SegmentData_1003 = {
  code: 'Success',
  message: '请求成功',
  data: {
    data: [
      {
        id: 'segment-e41fdb6d-58e2-4a47-9d43-77eb338bc51d',
        dataset_id: 'dataset-68471725-5c49-4392-a7ce-2d02d3401160',
        document_id: 'document-8edb84ce-18f8-40b8-bffe-aeb09f5c47f2',
        position_bbox: {
          '0': [73, 141, 284, 157]
        },
        position: 0,
        content: '基于移动通信产业的案例分析',
        content_shot: '基于移动通信产业的案例分析',
        sign_content: '',
        answer: '',
        word_count: 13,
        tokens: 8,
        keywords: null,
        index_node_id: '',
        index_node_hash: '',
        hit_count: 0,
        enabled: true,
        disabled_at: '0001-01-01T00:00:00Z',
        disabled_by: '',
        status: 'completed',
        created_by: '',
        created_at: '2025-11-04T10:59:34.102+08:00',
        updated_at: '2025-11-04T10:59:34.706+08:00',
        updated_by: '',
        indexing_at: '0001-01-01T00:00:00Z',
        completed_at: '2025-11-04T10:59:34.706+08:00',
        error: '',
        stopped_at: '0001-01-01T00:00:00Z',
        type: 0,
        is_edit: false,
        edited_at: '0001-01-01T00:00:00Z',
        full_title: '"有为政府"如何促进中国产业政策演进',
        title_id: 'title::URbXKJ::0',
        node_id: 0,
        level: 0,
        title: '"有为政府"如何促进中国产业政策演进',
        tag_status: 0
      },
      {
        id: 'segment-254cae91-f499-481e-ba8e-7a2e4c1690fa',
        dataset_id: 'dataset-68471725-5c49-4392-a7ce-2d02d3401160',
        document_id: 'document-8edb84ce-18f8-40b8-bffe-aeb09f5c47f2',
        position_bbox: {
          '0': [71, 190, 475, 414]
        },
        position: 1,
        content:
          '（1. 东华大学旭日工商管理学院，上海200051；2. 财新传媒采编部，北京100027）\n\n![研究框架图](https://picsum.photos/600/400?random=1)\n\n摘要：本文基于"有为政府"理论，构建政府促进移动通信产业政策演进的"政策目标-政策工具-政策执行"三维理论框架。\n\n根据线性回归模型，我们得到以下公式：\n\n$$y = \\beta_0 + \\beta_1 x_1 + \\beta_2 x_2 + \\epsilon$$\n\n其中 $\\beta_0$ 是截距项，$\\beta_1$ 和 $\\beta_2$ 是回归系数。\n\n![政策工具分类](https://picsum.photos/500/300?random=2)\n\n利用政策文本挖掘与可视化技术，分别解析移动通信产业政策在进赶阶段、并行阶段以及领跑阶段的结构特征。',
        content_shot:
          '（1. 东华大学旭日工商管理学院，上海200051；2. 财新传媒采编部，北京100027）\n\n![研究框架图](https://picsum.photos/600/400?random=1)\n\n摘要：本文基于"有为政府"理论，构建政府促进移动通信产业政策演进的"政策目标-政策工具-政策执行"三维理论框架。\n\n根据线性回归模型，我们得到以下公式：\n\n$$y = \\beta_0 + \\beta_1 x_1 + \\beta_2 x_2 + \\epsilon$$\n\n其中 $\\beta_0$ 是截距项，$\\beta_1$ 和 $\\beta_2$ 是回归系数。\n\n![政策工具分类](https://picsum.photos/500/300?random=2)\n\n利用政策文本挖掘与可视化技术，分别解析移动通信产业政策在进赶阶段、并行阶段以及领跑阶段的结构特征。',
        sign_content: '',
        answer: '',
        word_count: 628,
        tokens: 431,
        keywords: null,
        index_node_id: '',
        index_node_hash: '',
        hit_count: 0,
        enabled: true,
        disabled_at: '0001-01-01T00:00:00Z',
        disabled_by: '',
        status: 'completed',
        created_by: '',
        created_at: '2025-11-04T10:59:34.102+08:00',
        updated_at: '2025-11-04T10:59:34.707+08:00',
        updated_by: '',
        indexing_at: '0001-01-01T00:00:00Z',
        completed_at: '2025-11-04T10:59:34.707+08:00',
        error: '',
        stopped_at: '0001-01-01T00:00:00Z',
        type: 0,
        is_edit: false,
        edited_at: '0001-01-01T00:00:00Z',
        full_title: '$\\bigcirc$ 张睿涵，王石玉²',
        title_id: 'title::DEM3sb::2',
        node_id: 0,
        level: 0,
        title: '$\\bigcirc$ 张睿涵，王石玉²',
        tag_status: 0
      },
      {
        id: 'segment-84896be5-6209-4805-bd27-21e1092996fb',
        dataset_id: 'dataset-68471725-5c49-4392-a7ce-2d02d3401160',
        document_id: 'document-8edb84ce-18f8-40b8-bffe-aeb09f5c47f2',
        position_bbox: {
          '0': [72, 459, 548, 778],
          '1': [54, 109, 531, 774]
        },
        position: 2,
        content:
          '国家的发展需"强化国家战略科技力量"，并"集聚力量进行原创性引领性科技攻关"，以"加快建设科技强国"。\n\n![5G网络架构](https://picsum.photos/700/400?random=3)\n\n移动通信产业作为代表国家综合国力和整体科技竞争力的战略性先导产业，在中国式现代化科技创新强国道路上的作用日益凸显。\n\n技术创新的增长率可以用以下公式表示：\n\n$$G = \\frac{T_{t+1} - T_t}{T_t} \\times 100\\%$$\n\n其中 $T_t$ 表示 $t$ 时期的技术水平，$G$ 表示增长率。\n\n![产业发展趋势](https://picsum.photos/600/350?random=4)\n\n值得关注的是，2022年《中共中央国务院关于加快建设全国统一大市场的意见》提出有为政府、有效市场这一新的概念。',
        content_shot:
          '国家的发展需"强化国家战略科技力量"，并"集聚力量进行原创性引领性科技攻关"，以"加快建设科技强国"。\n\n![5G网络架构](https://picsum.photos/700/400?random=3)\n\n移动通信产业作为代表国家综合国力和整体科技竞争力的战略性先导产业，在中国式现代化科技创新强国道路上的作用日益凸显。\n\n技术创新的增长率可以用以下公式表示：\n\n$$G = \\frac{T_{t+1} - T_t}{T_t} \\times 100\\%$$\n\n其中 $T_t$ 表示 $t$ 时期的技术水平，$G$ 表示增长率。\n\n![产业发展趋势](https://picsum.photos/600/350?random=4)\n\n值得关注的是，2022年《中共中央国务院关于加快建设全国统一大市场的意见》提出有为政府、有效市场这一新的概念。',
        sign_content: '',
        answer: '',
        word_count: 2017,
        tokens: 1169,
        keywords: null,
        index_node_id: '',
        index_node_hash: '',
        hit_count: 0,
        enabled: true,
        disabled_at: '0001-01-01T00:00:00Z',
        disabled_by: '',
        status: 'completed',
        created_by: '',
        created_at: '2025-11-04T10:59:34.102+08:00',
        updated_at: '2025-11-04T10:59:34.708+08:00',
        updated_by: '',
        indexing_at: '0001-01-01T00:00:00Z',
        completed_at: '2025-11-04T10:59:34.708+08:00',
        error: '',
        stopped_at: '0001-01-01T00:00:00Z',
        type: 0,
        is_edit: false,
        edited_at: '0001-01-01T00:00:00Z',
        full_title: '1 问题提出',
        title_id: 'title::rgKNIY::8',
        node_id: 0,
        level: 0,
        title: '1 问题提出',
        tag_status: 0
      },
      {
        id: 'segment-bf0070e2-f861-4e5a-8c84-81bab042738b',
        dataset_id: 'dataset-68471725-5c49-4392-a7ce-2d02d3401160',
        document_id: 'document-8edb84ce-18f8-40b8-bffe-aeb09f5c47f2',
        position_bbox: {
          '1': [54, 109, 531, 774]
        },
        position: 3,
        content:
          '本文的数据来源以下三个渠道，以确保对中国移动通信产业政策演进的政府作用机制进行全面和深入分析：\n\n![数据来源示意图](https://picsum.photos/550/300?random=5)\n\n（1）基于"北大法宝"政策文件收集平台，以2003—2023年的"中央法规"与"地方法规"两类政策文件作为文本，考虑部分年份文件缺损，因此本文主要以3G、4G和5G的政策文件作为收集对象，共获得958份政策文本。',
        content_shot:
          '本文的数据来源以下三个渠道，以确保对中国移动通信产业政策演进的政府作用机制进行全面和深入分析：\n\n![数据来源示意图](https://picsum.photos/550/300?random=5)\n\n（1）基于"北大法宝"政策文件收集平台，以2003—2023年的"中央法规"与"地方法规"两类政策文件作为文本，考虑部分年份文件缺损，因此本文主要以3G、4G和5G的政策文件作为收集对象，共获得958份政策文本。',
        sign_content: '',
        answer: '',
        word_count: 332,
        tokens: 203,
        keywords: null,
        index_node_id: '',
        index_node_hash: '',
        hit_count: 0,
        enabled: true,
        disabled_at: '0001-01-01T00:00:00Z',
        disabled_by: '',
        status: 'completed',
        created_by: '',
        created_at: '2025-11-04T10:59:34.102+08:00',
        updated_at: '2025-11-04T10:59:34.711+08:00',
        updated_by: '',
        indexing_at: '0001-01-01T00:00:00Z',
        completed_at: '2025-11-04T10:59:34.711+08:00',
        error: '',
        stopped_at: '0001-01-01T00:00:00Z',
        type: 0,
        is_edit: false,
        edited_at: '0001-01-01T00:00:00Z',
        full_title: '1 问题提出',
        title_id: 'title::rgKNIY::8',
        node_id: 0,
        level: 0,
        title: '',
        tag_status: 0
      },
      {
        id: 'segment-bfa6bd7e-4bad-436a-96ad-1892fa75f752',
        dataset_id: 'dataset-68471725-5c49-4392-a7ce-2d02d3401160',
        document_id: 'document-8edb84ce-18f8-40b8-bffe-aeb09f5c47f2',
        position_bbox: {
          '1': [302, 318, 531, 772],
          '2': [71, 109, 548, 564]
        },
        position: 4,
        content:
          '政策目标是政策致力于实现的效果与价值体现，对产业政策的演进节奏起着重要作用。\n\n![政策演进路径](https://picsum.photos/650/380?random=6)\n\n政策目标可以分为任务导向型和扩散导向型。对于任务导向型，政府通过集中决策、实施、评价并分配技术创新资金，优先发展具有战略重要性的前沿技术来实现国家设定目标。\n\n政策效果评估模型如下：\n\n$$E = \\alpha \\cdot P + \\beta \\cdot I + \\gamma \\cdot M$$\n\n其中：\n- $E$ 表示政策效果\n- $P$ 表示政策强度\n- $I$ 表示创新投入\n- $M$ 表示市场响应\n- $\\alpha, \\beta, \\gamma$ 为权重系数，且 $\\alpha + \\beta + \\gamma = 1$',
        content_shot:
          '政策目标是政策致力于实现的效果与价值体现，对产业政策的演进节奏起着重要作用。\n\n![政策演进路径](https://picsum.photos/650/380?random=6)\n\n政策目标可以分为任务导向型和扩散导向型。对于任务导向型，政府通过集中决策、实施、评价并分配技术创新资金，优先发展具有战略重要性的前沿技术来实现国家设定目标。\n\n政策效果评估模型如下：\n\n$$E = \\alpha \\cdot P + \\beta \\cdot I + \\gamma \\cdot M$$\n\n其中：\n- $E$ 表示政策效果\n- $P$ 表示政策强度\n- $I$ 表示创新投入\n- $M$ 表示市场响应\n- $\\alpha, \\beta, \\gamma$ 为权重系数，且 $\\alpha + \\beta + \\gamma = 1$',
        sign_content: '',
        answer: '',
        word_count: 1423,
        tokens: 848,
        keywords: null,
        index_node_id: '',
        index_node_hash: '',
        hit_count: 0,
        enabled: true,
        disabled_at: '0001-01-01T00:00:00Z',
        disabled_by: '',
        status: 'completed',
        created_by: '',
        created_at: '2025-11-04T10:59:34.102+08:00',
        updated_at: '2025-11-04T10:59:34.714+08:00',
        updated_by: '',
        indexing_at: '0001-01-01T00:00:00Z',
        completed_at: '2025-11-04T10:59:34.714+08:00',
        error: '',
        stopped_at: '0001-01-01T00:00:00Z',
        type: 0,
        is_edit: false,
        edited_at: '0001-01-01T00:00:00Z',
        full_title: '2 中国移动通信产业政策节奏分析',
        title_id: 'title::CBuSHP::17',
        node_id: 0,
        level: 0,
        title: '2 中国移动通信产业政策节奏分析',
        tag_status: 0
      }
    ],
    has_more: false,
    limit: 20,
    page: 1,
    total: 5
  }
};

// ragId=1004 的PPT分段数据
export const SegmentData_1004 = {
  code: 'Success',
  message: '请求成功',
  data: {
    data: [
      {
        id: 'segment-ppt-001',
        dataset_id: 'dataset-68471725-5c49-4392-a7ce-2d02d3401160',
        document_id: 'document-ppt-001',
        position_bbox: {},
        position: 0,
        content: '2024年度工作总结与展望',
        content_shot: '2024年度工作总结与展望',
        sign_content: '',
        answer: '',
        word_count: 12,
        tokens: 8,
        keywords: null,
        index_node_id: '',
        index_node_hash: '',
        hit_count: 0,
        enabled: true,
        disabled_at: '0001-01-01T00:00:00Z',
        disabled_by: '',
        status: 'completed',
        created_by: '',
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z',
        updated_by: '',
        indexing_at: '0001-01-01T00:00:00Z',
        completed_at: '2024-01-15T10:30:00Z',
        error: '',
        stopped_at: '0001-01-01T00:00:00Z',
        type: 0,
        is_edit: false,
        edited_at: '0001-01-01T00:00:00Z',
        full_title: '封面',
        title_id: 'title::ppt::1',
        node_id: 1,
        level: 1,
        title: '封面',
        tag_status: 0,
        slideNumber: 1,
        slideTitle: '封面',
        slideContent: '2024年度工作总结与展望'
      },
      {
        id: 'segment-ppt-002',
        dataset_id: 'dataset-68471725-5c49-4392-a7ce-2d02d3401160',
        document_id: 'document-ppt-001',
        position_bbox: {},
        position: 1,
        content:
          '本年度实现营业收入1,234.56万元，同比增长15.3%。利润总额456.78万元，同比增长12.5%。',
        content_shot:
          '本年度实现营业收入1,234.56万元，同比增长15.3%。利润总额456.78万元，同比增长12.5%。',
        sign_content: '',
        answer: '',
        word_count: 45,
        tokens: 32,
        keywords: null,
        index_node_id: '',
        index_node_hash: '',
        hit_count: 0,
        enabled: true,
        disabled_at: '0001-01-01T00:00:00Z',
        disabled_by: '',
        status: 'completed',
        created_by: '',
        created_at: '2024-01-15T10:35:00Z',
        updated_at: '2024-01-15T10:35:00Z',
        updated_by: '',
        indexing_at: '0001-01-01T00:00:00Z',
        completed_at: '2024-01-15T10:35:00Z',
        error: '',
        stopped_at: '0001-01-01T00:00:00Z',
        type: 0,
        is_edit: false,
        edited_at: '0001-01-01T00:00:00Z',
        full_title: '第一章 财务成果 > 1.1 营收情况',
        title_id: 'title::ppt::2',
        node_id: 2,
        level: 2,
        title: '1.1 营收情况',
        tag_status: 0,
        slideNumber: 2,
        slideTitle: '财务成果',
        slideContent:
          '本年度实现营业收入1,234.56万元，同比增长15.3%。利润总额456.78万元，同比增长12.5%。'
      },
      {
        id: 'segment-ppt-003',
        dataset_id: 'dataset-68471725-5c49-4392-a7ce-2d02d3401160',
        document_id: 'document-ppt-001',
        position_bbox: {},
        position: 2,
        content:
          '完成了5个重点项目，投入资金2,000万元，创造了显著的经济效益和社会效益。',
        content_shot:
          '完成了5个重点项目，投入资金2,000万元，创造了显著的经济效益和社会效益。',
        sign_content: '',
        answer: '',
        word_count: 38,
        tokens: 28,
        keywords: null,
        index_node_id: '',
        index_node_hash: '',
        hit_count: 0,
        enabled: true,
        disabled_at: '0001-01-01T00:00:00Z',
        disabled_by: '',
        status: 'completed',
        created_by: '',
        created_at: '2024-01-15T10:40:00Z',
        updated_at: '2024-01-15T10:40:00Z',
        updated_by: '',
        indexing_at: '0001-01-01T00:00:00Z',
        completed_at: '2024-01-15T10:40:00Z',
        error: '',
        stopped_at: '0001-01-01T00:00:00Z',
        type: 0,
        is_edit: false,
        edited_at: '0001-01-01T00:00:00Z',
        full_title: '第二章 项目成果 > 2.1 重点项目',
        title_id: 'title::ppt::3',
        node_id: 3,
        level: 2,
        title: '2.1 重点项目',
        tag_status: 0,
        slideNumber: 3,
        slideTitle: '项目成果',
        slideContent:
          '完成了5个重点项目，投入资金2,000万元，创造了显著的经济效益和社会效益。'
      },
      {
        id: 'segment-ppt-004',
        dataset_id: 'dataset-68471725-5c49-4392-a7ce-2d02d3401160',
        document_id: 'document-ppt-001',
        position_bbox: {},
        position: 3,
        content:
          '2025年将继续深化改革，推进创新发展，力争实现营业收入增长20%以上。',
        content_shot:
          '2025年将继续深化改革，推进创新发展，力争实现营业收入增长20%以上。',
        sign_content: '',
        answer: '',
        word_count: 35,
        tokens: 26,
        keywords: null,
        index_node_id: '',
        index_node_hash: '',
        hit_count: 0,
        enabled: true,
        disabled_at: '0001-01-01T00:00:00Z',
        disabled_by: '',
        status: 'completed',
        created_by: '',
        created_at: '2024-01-15T10:45:00Z',
        updated_at: '2024-01-15T10:45:00Z',
        updated_by: '',
        indexing_at: '0001-01-01T00:00:00Z',
        completed_at: '2024-01-15T10:45:00Z',
        error: '',
        stopped_at: '0001-01-01T00:00:00Z',
        type: 0,
        is_edit: false,
        edited_at: '0001-01-01T00:00:00Z',
        full_title: '第三章 未来展望 > 3.1 2025年目标',
        title_id: 'title::ppt::4',
        node_id: 4,
        level: 2,
        title: '3.1 2025年目标',
        tag_status: 0,
        slideNumber: 4,
        slideTitle: '2025年展望',
        slideContent:
          '2025年将继续深化改革，推进创新发展，力争实现营业收入增长20%以上。'
      },
      {
        id: 'segment-ppt-005',
        dataset_id: 'dataset-68471725-5c49-4392-a7ce-2d02d3401160',
        document_id: 'document-ppt-001',
        position_bbox: {},
        position: 4,
        content: '加强团队建设，提升员工技能，打造高效协作的工作团队。',
        content_shot: '加强团队建设，提升员工技能，打造高效协作的工作团队。',
        sign_content: '',
        answer: '',
        word_count: 28,
        tokens: 20,
        keywords: null,
        index_node_id: '',
        index_node_hash: '',
        hit_count: 0,
        enabled: true,
        disabled_at: '0001-01-01T00:00:00Z',
        disabled_by: '',
        status: 'completed',
        created_by: '',
        created_at: '2024-01-15T10:50:00Z',
        updated_at: '2024-01-15T10:50:00Z',
        updated_by: '',
        indexing_at: '0001-01-01T00:00:00Z',
        completed_at: '2024-01-15T10:50:00Z',
        error: '',
        stopped_at: '0001-01-01T00:00:00Z',
        type: 0,
        is_edit: false,
        edited_at: '0001-01-01T00:00:00Z',
        full_title: '第三章 未来展望 > 3.2 团队建设',
        title_id: 'title::ppt::5',
        node_id: 5,
        level: 2,
        title: '3.2 团队建设',
        tag_status: 0,
        slideNumber: 5,
        slideTitle: '团队建设计划',
        slideContent: '加强团队建设，提升员工技能，打造高效协作的工作团队。'
      }
    ],
    has_more: false,
    limit: 20,
    page: 1,
    total: 5
  }
};

// ragId=1005 的表格分段数据
export const SegmentData_1005 = {
  code: 'Success',
  message: '请求成功',
  data: {
    data: [
      {
        id: 'segment-table-001',
        dataset_id: 'dataset-68471725-5c49-4392-a7ce-2d02d3401160',
        document_id: 'document-table-001',
        position_bbox: {},
        position: 0,
        content: '员工信息表',
        content_shot: '员工信息表',
        sign_content: '',
        answer: '',
        word_count: 5,
        tokens: 3,
        keywords: null,
        index_node_id: '',
        index_node_hash: '',
        hit_count: 0,
        enabled: true,
        disabled_at: '0001-01-01T00:00:00Z',
        disabled_by: '',
        status: 'completed',
        created_by: '',
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z',
        updated_by: '',
        indexing_at: '0001-01-01T00:00:00Z',
        completed_at: '2024-01-15T10:30:00Z',
        error: '',
        stopped_at: '0001-01-01T00:00:00Z',
        type: 0,
        is_edit: false,
        edited_at: '0001-01-01T00:00:00Z',
        full_title: '员工信息表',
        title_id: 'title::table::1',
        node_id: 1,
        level: 1,
        title: '员工信息表',
        tag_status: 0,
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
        }
      },
      {
        id: 'segment-table-002',
        dataset_id: 'dataset-68471725-5c49-4392-a7ce-2d02d3401160',
        document_id: 'document-table-001',
        position_bbox: {},
        position: 1,
        content: '销售数据表',
        content_shot: '销售数据表',
        sign_content: '',
        answer: '',
        word_count: 5,
        tokens: 3,
        keywords: null,
        index_node_id: '',
        index_node_hash: '',
        hit_count: 0,
        enabled: true,
        disabled_at: '0001-01-01T00:00:00Z',
        disabled_by: '',
        status: 'completed',
        created_by: '',
        created_at: '2024-01-15T10:35:00Z',
        updated_at: '2024-01-15T10:35:00Z',
        updated_by: '',
        indexing_at: '0001-01-01T00:00:00Z',
        completed_at: '2024-01-15T10:35:00Z',
        error: '',
        stopped_at: '0001-01-01T00:00:00Z',
        type: 0,
        is_edit: false,
        edited_at: '0001-01-01T00:00:00Z',
        full_title: '销售数据表',
        title_id: 'title::table::2',
        node_id: 2,
        level: 1,
        title: '销售数据表',
        tag_status: 0,
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
        }
      }
    ],
    has_more: false,
    limit: 20,
    page: 1,
    total: 2
  }
};
