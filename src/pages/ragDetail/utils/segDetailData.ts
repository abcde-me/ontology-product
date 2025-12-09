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
        text: `| 能量形式   | 定义               | 实例           |
| ------ | ---------------- | ------------ |
| 动能 (K) | 物体运动时具有的能量       | 滚动的球、流动的水    |
| 势能 (U) | 物体因位置或状态而具有的能量   | 被举高的重物、拉伸的弹簧 |
| 热能 (Q) | 物体内部分子无规则运动的动能总和 | 燃料燃烧、摩擦生热电能  |
| 电能     | 电荷运动或电势差产生的能量    | 闪电、电池        |
| 化学能    | 原子、分子间化学键储存的能量   | 食物、汽油、电池     |`, // 文本内容（Markdown格式）
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
        text: '$$y = \\beta_0 + \\beta_1 x_1 + \\beta_2 x_2 + \\epsilon$$', // 文本内容（包含$$用于MathJax识别）
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
