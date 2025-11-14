export const SegDetailData = {
  requestId: '98',
  statusCode: 24,
  code: '100',
  message: 'minim Excepteur irure dolore dolore',
  data: {
    id: 'file_001_chunk_001', // 分段编号
    char_count: 100, // 分段大小
    parent_id: 'file_001_chunk_001', // 父分片ID
    left_chunk_id: 'file_001_chunk_001', // 左邻分片ID
    right_chunk_id: 'file_001_chunk_001', // 右邻分片ID
    materials: [
      {
        id: '1', // 元素ID
        type: 'text', // "text","title","table","image","formula"
        text: '按照本次发行前的股份数计算，对于截止本次发行前本行已经审计的最近一个审计基准日的滚存未分配利润，由本次发行前的本行老股东享有其中的 35%，其余部分由老股东和新股东共享；对于基准日之后实现的可分配利润，则全部由老股东和新股东共享。截至 2006 年 12 月 31 日，按滚存未分配利润计算的应由老', // 文本内容
        positions: [
          {
            bbox: [1, 2, 3, 4],
            text_offset: {
              start: 2450,
              end: 2460
            },
            xpath: '/document/section[2]/p[1]',
            block_index: 5,
            page_id: 1
          }
        ],
        uri: 's3://aimpd-test/01/1.jpg'
      },
      {
        id: '2', // 元素ID
        type: 'image', // "text","title","table","image","formula"
        text: 's3://aimpd-test/01/1.jpg',
        positions: [
          {
            bbox: [1, 2, 3, 4],
            text_offset: {
              start: 2450,
              end: 2460
            },
            xpath: '/document/section[2]/p[1]',
            block_index: 5,
            page_id: 1
          }
        ],
        uri: 's3://aimpd-test/01/1.jpg'
      },
      {
        id: '3', // 元素ID
        type: 'table', // "text","title","table","image","formula"
        text: '{"ID":1,"问题":"整个共和国、城市地区和农村地区家庭在医疗服务和护理上的平均年度支出是多少英镑？","回答":"### 家庭在服务和医疗保健上的平均年度支出 1. **整个共和国家庭在服务和医疗保健上的平均年度支出：** - 2019/2020 年，整个共和国家庭在服务和医疗保健上的平均年度支出为 7,779.3 英镑（信息 1）。 2. **城镇家庭在服务和医疗保健上的平均年度支出：** - 2019/2020 年城镇家庭在服务和医疗保健上的平均年度支出为 6,779.3 埃及镑（信息 1）。 3. **农村家庭在服务和医疗保健上的平均年度支出：** - 2019/2020 年农村家庭在服务和医疗保健上的平均年度支出为 6,113.5 埃及镑（信息 1）。"}', // 文本内容
        positions: [
          {
            bbox: [1, 2, 3, 4],
            text_offset: {
              start: 2450,
              end: 2460
            },
            xpath: '/document/section[2]/p[1]',
            block_index: 5,
            page_id: 1
          }
        ],
        uri: 's3://aimpd-test/01/1.jpg'
      },
      {
        id: '4', // 元素ID
        type: 'formula', // "text","title","table","image","formula"
        text: '$$y = \\beta_0 + \\beta_1 x_1 + \\beta_2 x_2 + \\epsilon$$', // 文本内容
        positions: [
          {
            bbox: [1, 2, 3, 4],
            text_offset: {
              start: 2450,
              end: 2460
            },
            xpath: '/document/section[2]/p[1]',
            block_index: 5,
            page_id: 1
          }
        ],
        uri: 's3://aimpd-test/01/1.jpg'
      }
    ],
    ai_data: {
      summaries: 'exercitation sunt consectetur ex aute', // 总结
      questions: 'in consectetur laboris culpa laborum', // 假设性问题
      keywords: ['实体1', '实体2'], // 实体
      tags: [
        {
          id: 1,
          name: '股票市场'
        },
        {
          id: 2,
          name: '分红'
        }
      ]
    }
  }
};
