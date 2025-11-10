/**
 * Mock data for trace log
 */

export interface TraceLogStatistics {
  totalNodes: number;
  successNodes: number;
  totalTime: string;
}

export interface NodeDetail {
  id: string;
  index: number;
  name: string;
  status: 'success' | 'failed';
  duration: string;
  startTime: string;
  input: any;
  output: any;
}

export const mockTraceLogStatistics: TraceLogStatistics = {
  totalNodes: 10,
  successNodes: 2,
  totalTime: '10min'
};

export const mockNodeDetails: NodeDetail[] = [
  {
    id: '1',
    index: 1,
    name: '开始',
    status: 'success',
    duration: '50s',
    startTime: '2025-12-12:12:12',
    input: {
      document_id: 'cnooc_tech_001',
      title: '井筒完整性管理技术规范',
      structure: {
        sections: [
          {
            level: 1,
            title: '井筒完整性检测',
            content:
              '井筒完整性管理是确保油气井安全运行的关键技术。本规范适用于海上油气田开发过程中的井筒完整性管理工作，包括井筒设计、施工、运行和维护等各个阶段。井筒完整性检测是保障油气井长期安全运行的重要手段，通过定期检测可以及时发现井筒存在的问题，采取相应的修复措施，避免井筒失效导致的安全事故和环境污染。',
            subsections: [
              {
                level: 2,
                title: '检测方法',
                content:
                  '检测方法包括超声波检测、磁粉检测、渗透检测等多种技术手段。超声波检测利用超声波在材料中的传播特性来检测缺陷，具有检测精度高、适用范围广的特点。磁粉检测主要用于检测铁磁性材料表面和近表面的缺陷，操作简便、成本低廉。渗透检测适用于检测非多孔性材料表面开口缺陷，灵敏度高、直观性强。',
                images: [
                  {
                    id: 'img_001',
                    caption: '图1-1 井筒完整性检测设备布局',
                    position: { x: 120, y: 200, width: 400, height: 300 }
                  }
                ],
                tables: [
                  {
                    id: 'table_001',
                    caption: '表1-1 常用检测方法对比',
                    headers: ['检测方法', '适用范围', '优点', '缺点'],
                    rows: [
                      [
                        '超声波检测',
                        '金属、非金属材料',
                        '精度高、穿透力强',
                        '需要耦合剂'
                      ],
                      [
                        '磁粉检测',
                        '铁磁性材料',
                        '操作简便、成本低',
                        '仅适用于表面缺陷'
                      ],
                      [
                        '渗透检测',
                        '非多孔性材料',
                        '灵敏度高、直观',
                        '仅检测表面开口缺陷'
                      ]
                    ]
                  }
                ]
              },
              {
                level: 2,
                title: '检测周期',
                content:
                  '根据井筒的使用年限、工作环境和历史检测记录，制定合理的检测周期。新井投产后第一年内应进行首次全面检测，之后每3-5年进行一次常规检测。对于高风险井筒，应缩短检测周期至1-2年。',
                parameters: {
                  new_well_first_inspection: '投产后1年内',
                  routine_inspection_interval: '3-5年',
                  high_risk_inspection_interval: '1-2年',
                  special_inspection_triggers: [
                    '发现异常',
                    '重大工况变化',
                    '事故后'
                  ]
                }
              }
            ]
          },
          {
            level: 1,
            title: '井筒完整性评估',
            content:
              '井筒完整性评估是对井筒当前状态进行综合分析和判断的过程，包括数据收集、缺陷识别、风险评估和处理建议等环节。',
            subsections: [
              {
                level: 2,
                title: '评估标准',
                content:
                  '评估标准应符合国家和行业相关规范要求，结合现场实际情况制定。主要包括井筒结构完整性、密封性能、承压能力等方面的评估指标。'
              }
            ]
          }
        ]
      }
    },
    output: {
      document_id: 'cnooc_tech_001',
      title: '井筒完整性管理技术规范',
      processing_status: 'completed',
      extracted_sections: 2,
      extracted_subsections: 3,
      extracted_images: 1,
      extracted_tables: 1,
      quality_score: 0.95,
      structure: {
        sections: [
          {
            level: 1,
            title: '井筒完整性检测',
            content:
              '井筒完整性管理是确保油气井安全运行的关键技术。本规范适用于海上油气田开发过程中的井筒完整性管理工作，包括井筒设计、施工、运行和维护等各个阶段。',
            subsections: [
              {
                level: 2,
                title: '检测方法',
                content:
                  '检测方法包括超声波检测、磁粉检测、渗透检测等多种技术手段。',
                images: [
                  {
                    id: 'img_001',
                    caption: '图1-1 井筒完整性检测设备布局',
                    position: { x: 120, y: 200, width: 400, height: 300 },
                    extracted: true,
                    ocr_text: '检测设备布局示意图'
                  }
                ]
              }
            ]
          }
        ],
        metadata: {
          total_pages: 120,
          processed_pages: 120,
          processing_time: '50s',
          confidence_level: 'high'
        }
      }
    }
  },
  {
    id: '2',
    index: 2,
    name: '文档解析',
    status: 'success',
    duration: '50s',
    startTime: '2025-12-12:12:12',
    input: {
      document_id: 'cnooc_tech_001',
      title: '井筒完整性管理技术规范',
      file_path:
        '/data/documents/oil_gas_industry/wellbore_integrity_management/technical_specifications/version_2025/cnooc_tech_001_wellbore_integrity_management_technical_specification_final_approved_version.pdf',
      structure: {
        sections: [
          {
            level: 1,
            title: '井筒完整性检测',
            content:
              '井筒完整性管理是确保油气井安全运行的关键技术。本规范适用于海上油气田开发过程中的井筒完整性管理工作，包括井筒设计、施工、运行和维护等各个阶段。',
            subsections: [
              {
                level: 2,
                title: '检测方法',
                content:
                  '检测方法包括超声波检测、磁粉检测、渗透检测等多种技术手段。每种检测方法都有其特定的适用范围和技术要求。',
                long_description:
                  'This is a very long description that should trigger horizontal scrolling when displayed in the JSON viewer. It contains detailed technical information about wellbore integrity inspection methods including ultrasonic testing, magnetic particle testing, penetrant testing and other advanced non-destructive testing techniques used in offshore oil and gas field development.'
              }
            ]
          }
        ],
        metadata: {
          author: 'CNOOC Technical Standards Committee',
          version: '2025.1.0',
          approval_date: '2025-01-15',
          effective_date: '2025-03-01',
          review_cycle: '3 years',
          related_standards: [
            'GB/T 19624-2019',
            'SY/T 6276-2014',
            'API RP 90',
            'ISO 16530-1:2017'
          ]
        }
      }
    },
    output: {
      document_id: 'cnooc_tech_001',
      title: '井筒完整性管理技术规范',
      parsed: true,
      sections_count: 10,
      images_count: 5,
      tables_count: 3,
      processing_details: {
        total_pages: 120,
        processed_successfully: 120,
        failed_pages: 0,
        extraction_quality: 'high',
        confidence_score: 0.98,
        processing_timestamp: '2025-12-12T12:12:00Z',
        processor_version: 'v2.5.3',
        long_file_path:
          '/output/processed_documents/oil_gas_industry/wellbore_integrity_management/technical_specifications/version_2025/cnooc_tech_001_wellbore_integrity_management_technical_specification_final_approved_version_processed_2025_12_12.json'
      }
    }
  },
  {
    id: '3',
    index: 3,
    name: '增强',
    status: 'failed',
    duration: '50s',
    startTime: '2025-12-12:12:12',
    input: {
      document_id: 'cnooc_tech_001',
      title: '井筒完整性管理技术规范',
      structure: {
        sections: [
          {
            level: 1,
            title: '井筒完整性检测',
            content: '井筒完整性管理是确保油气井安全运行的关键技术...',
            subsections: [
              {
                level: 2,
                title: '检测方法',
                content:
                  '检测方法包括超声波检测、磁粉检测、渗透检测等多种技术手段...',
                images: [
                  {
                    id: 'img_001',
                    caption: '图1-1 井筒完整性检测设备布局',
                    position: { x: 120, y: 200, width: 400, height: 300 }
                  }
                ]
              }
            ]
          }
        ]
      }
    },
    output: {
      error: 'Enhancement failed',
      message: 'Failed to process document enhancement'
    }
  }
];
