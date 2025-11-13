// 统一的分块列表数据 - 包含目录树 + 分段列表（含图片和公式）
export const NewSegmentData = {
  code: 0,
  data: {
    total: 6,
    page: 1,
    limit: 10,
    message: '',
    list: [
      {
        id: 'segment-e41fdb6d-58e2-4a47-9d43-77eb338bc51d',
        document_id: 'document-8edb84ce-18f8-40b8-bffe-aeb09f5c47f2',
        chunk_index: 0,
        positions: [
          {
            page_id: 0,
            bbox: [73, 141, 284, 157]
          }
        ],
        content:
          '基于移动通信产业的案例分析\n\n![案例分析框架](https://picsum.photos/500/300?random=10)',
        type: 'text',
        char_count: 13,
        title: '"有为政府"如何促进中国产业政策演进',
        title_id: 'title::URbXKJ::0',
        enabled: true,
        source: 'Auto',
        is_edit: false
      },
      {
        id: 'segment-254cae91-f499-481e-ba8e-7a2e4c1690fa',
        document_id: 'document-8edb84ce-18f8-40b8-bffe-aeb09f5c47f2',
        chunk_index: 1,
        positions: [
          {
            page_id: 0,
            bbox: [71, 190, 475, 414]
          }
        ],
        content:
          '（1. 东华大学旭日工商管理学院，上海200051；2. 财新传媒采编部，北京100027）\n\n![研究框架图](https://picsum.photos/600/400?random=1)\n\n摘要：本文基于"有为政府"理论，构建政府促进移动通信产业政策演进的"政策目标-政策工具-政策执行"三维理论框架。\n\n根据线性回归模型，我们得到以下公式：\n\n$$y = \\beta_0 + \\beta_1 x_1 + \\beta_2 x_2 + \\epsilon$$\n\n其中 $\\beta_0$ 是截距项，$\\beta_1$ 和 $\\beta_2$ 是回归系数。\n\n![政策工具分类](https://picsum.photos/500/300?random=2)\n\n利用政策文本挖掘与可视化技术，分别解析移动通信产业政策在进赶阶段、并行阶段以及领跑阶段的结构特征，进而揭示中国场景下"有为政府"推动移动通信产业政策演进的作用机制。研究发现：（1)在移动通信产业政策演进过程中，政府展现了"有为"特质和"集中力量办大事"的政策理念，与我国顶层设计基本保持一致；(2)我国移动通信产业存在政策工具"环重、供重、需弱"、政策执行"国家强、地方弱"以及层级滞后性等不均衡现象。',
        type: 'text',
        char_count: 628,
        title: '$\\bigcirc$ 张睿涵，王石玉²',
        title_id: 'title::DEM3sb::2',
        enabled: true,
        source: 'Auto',
        is_edit: false
      },
      {
        id: 'segment-84896be5-6209-4805-bd27-21e1092996fb',
        document_id: 'document-8edb84ce-18f8-40b8-bffe-aeb09f5c47f2',
        chunk_index: 2,
        positions: [
          {
            page_id: 0,
            bbox: [72, 459, 548, 778]
          },
          {
            page_id: 1,
            bbox: [54, 109, 531, 774]
          }
        ],
        content:
          '国家的发展需"强化国家战略科技力量"，并"集聚力量进行原创性引领性科技攻关"，以"加快建设科技强国"。\n\n![5G网络架构](https://picsum.photos/700/400?random=3)\n\n移动通信产业作为代表国家综合国力和整体科技竞争力的战略性先导产业[12]，在中国式现代化科技创新强国道路上的作用日益凸显。\n\n技术创新的增长率可以用以下公式表示：\n\n$$G = \\frac{T_{t+1} - T_t}{T_t} \\times 100\\%$$\n\n其中 $T_t$ 表示 $t$ 时期的技术水平，$G$ 表示增长率。\n\n![产业发展趋势](https://picsum.photos/600/350?random=4)\n\n值得关注的是，2022年《中共中央国务院关于加快建设全国统一大市场的意见》提出有为政府、有效市场这一新的概念，既要"有效市场"，又要"有为政府"，这是对"发挥市场在资源配置中的决定性作用、更好发挥政府作用的"进一步阐释。近年来，随着政府在产业政策方面的积极干预，尤其是在"有为政府"理论的指导下，移动通信产业得到了快速的发展和显著的国际影响力提升。',
        type: 'text',
        char_count: 2017,
        title: '1 问题提出',
        title_id: 'title::rgKNIY::8',
        enabled: true,
        source: 'Auto',
        is_edit: false
      },
      {
        id: 'segment-bf0070e2-f861-4e5a-8c84-81bab042738b',
        document_id: 'document-8edb84ce-18f8-40b8-bffe-aeb09f5c47f2',
        chunk_index: 3,
        positions: [
          {
            page_id: 1,
            bbox: [54, 109, 531, 774]
          }
        ],
        content:
          '本文的数据来源以下三个渠道，以确保对中国移动通信产业政策演进的政府作用机制进行全面和深入分析：\n\n![数据来源示意图](https://picsum.photos/550/300?random=5)\n\n（1）基于"北大法宝"政策文件收集平台，以2003—2023年的"中央法规"与"地方法规"两类政策文件作为文本，考虑部分年份文件缺损，因此本文主要以3G、4G和5G的政策文件作为收集对象，共获得958份政策文本。（2）专家访谈与行业座谈。通过访谈行业专家和政策制定者，收集了关于政府政策、产业发展挑战、技术创新以及国际竞争的深入见解。（3）统计年鉴数据和学术文献的收集分析。对公开发布的行业报告、学术论文、媒体报道等进行了广泛收集和系统分析。',
        type: 'text',
        char_count: 332,
        title: '',
        title_id: 'title::rgKNIY::8',
        enabled: true,
        source: 'Auto',
        is_edit: false
      },
      {
        id: 'segment-bfa6bd7e-4bad-436a-96ad-1892fa75f752',
        document_id: 'document-8edb84ce-18f8-40b8-bffe-aeb09f5c47f2',
        chunk_index: 4,
        positions: [
          {
            page_id: 1,
            bbox: [302, 318, 531, 772]
          },
          {
            page_id: 2,
            bbox: [71, 109, 548, 564]
          }
        ],
        content:
          '政策目标是政策致力于实现的效果与价值体现，对产业政策的演进节奏起着重要作用。\n\n![政策演进路径](https://picsum.photos/650/380?random=6)\n\n政策目标可以分为任务导向型和扩散导向型。对于任务导向型，政府通过集中决策、实施、评价并分配技术创新资金，优先发展具有战略重要性的前沿技术来实现国家设定目标。\n\n政策效果评估模型如下：\n\n$$E = \\alpha \\cdot P + \\beta \\cdot I + \\gamma \\cdot M$$\n\n其中：\n- $E$ 表示政策效果\n- $P$ 表示政策强度\n- $I$ 表示创新投入\n- $M$ 表示市场响应\n- $\\alpha, \\beta, \\gamma$ 为权重系数，且 $\\alpha + \\beta + \\gamma = 1$\n\n对于扩散导向型，政府通过提供基础设施、教育培训、税收优惠等方式，营造有利于技术创新和产业发展的环境，促进技术的广泛应用和扩散。',
        type: 'text',
        char_count: 1423,
        title: '2 中国移动通信产业政策节奏分析',
        title_id: 'title::CBuSHP::17',
        enabled: true,
        source: 'Auto',
        is_edit: false
      },
      {
        id: 'segment-final-test',
        document_id: 'document-8edb84ce-18f8-40b8-bffe-aeb09f5c47f2',
        chunk_index: 5,
        positions: [
          {
            page_id: 2,
            bbox: [71, 600, 548, 750]
          }
        ],
        content:
          '综上所述，本文通过对中国移动通信产业政策的深入分析，揭示了"有为政府"在产业政策演进中的重要作用。\n\n![综合分析图](https://picsum.photos/800/450?random=7)\n\n研究表明，政府在产业政策制定和执行过程中发挥了关键作用，通过合理的政策目标设定、多样化的政策工具运用以及有效的政策执行机制，推动了移动通信产业的快速发展。\n\n最终的政策效果可以用综合评价函数表示：\n\n$$F(x) = \\sum_{i=1}^{n} w_i \\cdot f_i(x)$$\n\n其中 $w_i$ 是第 $i$ 个指标的权重，$f_i(x)$ 是第 $i$ 个指标的评价函数，满足 $\\sum_{i=1}^{n} w_i = 1$。\n\n![未来展望](https://picsum.photos/700/400?random=8)\n\n未来，随着5G和6G技术的发展，政府需要继续发挥"有为"作用，在保持市场活力的同时，加强政策引导和支持，推动移动通信产业向更高水平发展。',
        type: 'text',
        char_count: 450,
        title: '3 结论与展望',
        title_id: 'title::FINAL::25',
        enabled: true,
        source: 'Auto',
        is_edit: false
      }
    ]
  }
};
