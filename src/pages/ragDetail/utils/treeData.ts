/**
 * 根据ragId获取对应的目录树数据
 * ragId=1001: 无目录树
 * ragId=1002: 有目录树
 * ragId=1003: 有目录树(图文混排场景)
 * ragId=1004: 有目录树(PPT场景)
 */
export function getTreeDataByRagId(ragId: string) {
  // ragId=1001 没有目录树
  if (ragId === '1001') {
    return null;
  }

  // ragId=1004 PPT场景的目录树
  if (ragId === '1004') {
    return TreeData_1004;
  }

  // ragId=1002 和 1003 都有目录树
  return TreeData_1002;
}

// ragId=1002 的目录树数据
export const TreeData_1002 = {
  code: 'Success',
  message: '请求成功',
  data: {
    id: 'document_catalogs-5c73018e-c5f8-4743-b9cb-2333339fff07',
    tenant_id: '',
    dataset_id: 'dataset-68471725-5c49-4392-a7ce-2d02d3401160',
    document_id: 'document-8edb84ce-18f8-40b8-bffe-aeb09f5c47f2',
    catalog_content: {
      title: '“有为政府”如何促进中国产业政策演进',
      title_id: 'title::URbXKJ::0',
      position: {
        '0': '[73,109,481,137]'
      },
      short_text_positions: {
        'segment-e41fdb6d-58e2-4a47-9d43-77eb338bc51d': '{"0":[73,141,284,157]}'
      },
      level: 0,
      short_texts: ['基于移动通信产业的案例分析'],
      children: [
        {
          title: '$\\bigcirc$ 张睿涵，王石玉²',
          title_id: 'title::DEM3sb::2',
          position: {
            '0': '[73,169,194,185]'
          },
          short_text_positions: {
            'segment-254cae91-f499-481e-ba8e-7a2e4c1690fa':
              '{"0":[71,190,475,414]}'
          },
          level: 1,
          short_texts: ['（1. 东华大学旭日工商管理学院，上海2'],
          node_id: 2,
          segment_ids: ['segment-254cae91-f499-481e-ba8e-7a2e4c1690fa']
        },
        {
          title: '1 问题提出',
          title_id: 'title::rgKNIY::8',
          position: {
            '0': '[73,460,140,473]'
          },
          short_text_positions: {
            'segment-84896be5-6209-4805-bd27-21e1092996fb':
              '{"0":[72,459,548,778],"1":[54,109,531,774]}',
            'segment-bf0070e2-f861-4e5a-8c84-81bab042738b':
              '{"1":[54,109,531,774]}'
          },
          level: 1,
          short_texts: [
            '国家的发展需“强化国家战略科技力量”，并',
            '本文的数据来源以下三个渠道，以确保对中国'
          ],
          node_id: 8,
          segment_ids: [
            'segment-84896be5-6209-4805-bd27-21e1092996fb',
            'segment-bf0070e2-f861-4e5a-8c84-81bab042738b'
          ]
        },
        {
          title: '2 中国移动通信产业政策节奏分析',
          title_id: 'title::CBuSHP::17',
          position: {
            '1': '[303,302,490,314]'
          },
          short_text_positions: {
            'segment-bfa6bd7e-4bad-436a-96ad-1892fa75f752':
              '{"1":[302,318,531,772],"2":[71,109,548,564]}'
          },
          level: 1,
          short_texts: ['政策目标是政策致力于实现的效果与价值体现'],
          node_id: 17,
          segment_ids: ['segment-bfa6bd7e-4bad-436a-96ad-1892fa75f752']
        },
        {
          title: '3 移动通信产业追赶阶段政策分析',
          title_id: 'title::MbAkXM::33',
          position: {
            '2': '[319,210,507,223]'
          },
          short_text_positions: {
            'segment-115b37a6-d360-4412-b22c-bc01ee3cd8b4':
              '{"2":[318,226,548,360],"3":[54,108,531,758],"4":[71,109,299,214]}'
          },
          level: 1,
          short_texts: ['在1G至3G时代，中国的移动通信产业处于'],
          node_id: 33,
          segment_ids: ['segment-115b37a6-d360-4412-b22c-bc01ee3cd8b4']
        },
        {
          title: '4 移动通信产业并行阶段政策分析',
          title_id: 'title::eudgZ8::42',
          position: {
            '4': '[72,224,260,238]'
          },
          short_text_positions: {
            'segment-ef7e101d-de22-4e4f-885a-92ddbdba6c23':
              '{"4":[71,109,548,635],"5":[54,109,282,199]}'
          },
          level: 1,
          short_texts: ['随着4G时代的到来，中国的移动通信产业开'],
          node_id: 42,
          segment_ids: ['segment-ef7e101d-de22-4e4f-885a-92ddbdba6c23']
        },
        {
          title: '5 移动通信产业领先阶段政策分析',
          title_id: 'title::U89CIb::50',
          position: {
            '5': '[55,210,243,223]'
          },
          short_text_positions: {
            'segment-a06fd1bf-7fa6-4f69-a103-5933352b7a25':
              '{"7":[55,109,531,473],"8":[71,109,299,241]}',
            'segment-cc32f221-604d-4b74-a3b0-364fe34a28ab':
              '{"5":[54,109,531,306],"6":[71,219,548,758],"7":[55,109,531,473]}'
          },
          level: 1,
          short_texts: [
            '进入5G时代，中国的移动通信产业实现了从',
            '在个性特征中，移动通信产业政策共现网络表'
          ],
          node_id: 50,
          segment_ids: [
            'segment-cc32f221-604d-4b74-a3b0-364fe34a28ab',
            'segment-a06fd1bf-7fa6-4f69-a103-5933352b7a25'
          ]
        },
        {
          title: '6 理论构建：基于案例的整合分析框架',
          title_id: 'title::dQKKVp::70',
          position: {
            '8': '[72,250,278,263]'
          },
          short_text_positions: null,
          level: 1,
          node_id: 70,
          segment_ids: null
        },
        {
          title: '6.1 “政策目标－政策工具－政策执行”的三维分析框架',
          title_id: 'title::yTZPuv::71',
          position: {
            '8': '[71,267,258,291]'
          },
          short_text_positions: {
            'segment-2bb10623-0298-4607-bc44-062668fca6ab':
              '{"8":[71,109,548,602]}'
          },
          level: 1,
          short_texts: ['通过案例研究发现，政策目标导向下多种可供'],
          node_id: 71,
          segment_ids: ['segment-2bb10623-0298-4607-bc44-062668fca6ab']
        },
        {
          title: '6.2 理论对话：基于中国情境的产业政策分析与凯恩斯主义的交融',
          title_id: 'title::2EVhgx::78',
          position: {
            '8': '[318,388,529,411]'
          },
          short_text_positions: {
            'segment-5eec0a51-2de3-4abe-a645-c3134b115143':
              '{"8":[318,416,548,598],"9":[54,109,531,778]}'
          },
          level: 1,
          short_texts: ['在探讨“有为政府”如何促进中国产业政策演'],
          node_id: 78,
          segment_ids: ['segment-5eec0a51-2de3-4abe-a645-c3134b115143']
        },
        {
          title: '7 结论',
          title_id: 'title::9wsQ1u::91',
          position: {
            '9': '[302,718,346,730]'
          },
          short_text_positions: {
            'segment-384ec5e1-060b-41e3-9ea0-8ff0d2be3ff3':
              '{"10":[71,108,548,778],"9":[302,734,531,777]}'
          },
          level: 1,
          short_texts: ['本文基于“有为政府”理论，构建政府促进移'],
          node_id: 91,
          segment_ids: ['segment-384ec5e1-060b-41e3-9ea0-8ff0d2be3ff3']
        },
        {
          title: '参考文献：',
          title_id: 'title::7vZRdj::98',
          position: {
            '10': '[319,438,359,449]'
          },
          short_text_positions: {
            'segment-11daf559-5760-4b7c-955b-87d8efbe3947':
              '{"10":[318,453,548,779],"11":[53,104,532,724]}',
            'segment-5c60da5c-4384-454e-a16e-3fad237ff367':
              '{"11":[300,108,532,696],"12":[71,111,549,275]}',
            'segment-a858499f-3d09-451c-8004-38e3b7a0be82':
              '{"11":[53,104,532,724],"12":[71,111,549,229]}'
          },
          level: 1,
          short_texts: [
            '[1] 叶堂林，毛若冲，李国梁.城市群内',
            ' 基于有为政府和有效市场互动的企业创新质',
            ' 上海经济研究，2022（1）：61- '
          ],
          node_id: 98,
          segment_ids: [
            'segment-11daf559-5760-4b7c-955b-87d8efbe3947',
            'segment-a858499f-3d09-451c-8004-38e3b7a0be82',
            'segment-5c60da5c-4384-454e-a16e-3fad237ff367'
          ]
        },
        {
          title:
            '(8) How the "Effective Government" Promotes the Evolution of China\'s Industrial Policies ',
          title_id: 'title::fkHRyC::105',
          position: {
            '12': '[72,329,487,340]'
          },
          short_text_positions: {
            'segment-e2f622cf-da59-4e23-9ffa-5a3745db2cb4':
              '{"12":[91,344,545,402]}'
          },
          level: 1,
          short_texts: ['A Case Study Based o'],
          node_id: 105,
          segment_ids: ['segment-e2f622cf-da59-4e23-9ffa-5a3745db2cb4']
        },
        {
          title: 'Abstract ID: 1672-6162(2024)01-0094-EA ',
          title_id: 'title::gAloCM::113',
          position: {
            '12': '[72,405,272,416]'
          },
          short_text_positions: {
            'segment-0117c9b1-01ab-4f1d-8464-837bc19e58b4':
              '{"12":[69,420,549,752]}',
            'segment-43b98288-0416-4ea0-8cdf-4643ea7e2007':
              '{"12":[69,420,549,752]}'
          },
          level: 1,
          short_texts: ['Abstract: This artic', ' It reveals the key '],
          node_id: 113,
          segment_ids: [
            'segment-43b98288-0416-4ea0-8cdf-4643ea7e2007',
            'segment-0117c9b1-01ab-4f1d-8464-837bc19e58b4'
          ]
        }
      ],
      node_id: 0,
      segment_ids: ['segment-e41fdb6d-58e2-4a47-9d43-77eb338bc51d']
    },
    created_at: '2025-11-04T10:59:34.1+08:00',
    updated_at: '2025-11-04T10:59:34.1+08:00',
    indexing_status: 'completed'
  }
};

// ragId=1004 的PPT目录树数据
export const TreeData_1004 = {
  code: 'Success',
  message: '请求成功',
  data: {
    id: 'document_catalogs-ppt-001',
    tenant_id: '',
    dataset_id: 'dataset-68471725-5c49-4392-a7ce-2d02d3401160',
    document_id: 'document-ppt-001',
    catalog_content: {
      title: '2024年度工作总结与展望1',
      title_id: 'title::ppt::root',
      position: {},
      short_text_positions: {},
      level: 0,
      short_texts: [],
      children: [
        {
          title: '第一章 财务成果',
          title_id: 'title::ppt::chapter1',
          position: {},
          short_text_positions: {
            'segment-ppt-002': '{}'
          },
          level: 1,
          short_texts: ['本年度实现营业收入1,234.56万元'],
          node_id: 1,
          segment_ids: ['segment-ppt-002']
        },
        {
          title: '第二章 项目成果',
          title_id: 'title::ppt::chapter2',
          position: {},
          short_text_positions: {
            'segment-ppt-003': '{}'
          },
          level: 1,
          short_texts: ['完成了5个重点项目'],
          node_id: 2,
          segment_ids: ['segment-ppt-003']
        },
        {
          title: '第三章 未来展望',
          title_id: 'title::ppt::chapter3',
          position: {},
          short_text_positions: {},
          level: 1,
          short_texts: [],
          node_id: 3,
          children: [
            {
              title: '3.1 2025年目标',
              title_id: 'title::ppt::4',
              position: {},
              short_text_positions: {
                'segment-ppt-004': '{}'
              },
              level: 2,
              short_texts: ['2025年将继续深化改革'],
              node_id: 4,
              segment_ids: ['segment-ppt-004']
            },
            {
              title: '3.2 团队建设',
              title_id: 'title::ppt::5',
              position: {},
              short_text_positions: {
                'segment-ppt-005': '{}'
              },
              level: 2,
              short_texts: ['加强团队建设'],
              node_id: 5,
              segment_ids: ['segment-ppt-005']
            }
          ]
        }
      ],
      node_id: 0,
      segment_ids: ['segment-ppt-001']
    },
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    indexing_status: 'completed'
  }
};

// 保留原有的TreeData导出以保持向后兼容
export const TreeData = TreeData_1002;
