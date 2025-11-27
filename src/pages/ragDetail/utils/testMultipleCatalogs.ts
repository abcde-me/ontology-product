/**
 * Test script to verify that multiple catalogs are properly handled
 * This simulates the API response with 3 catalog nodes
 */

import type { ApiCatalogNode, DirectoryNode } from '../types';

/**
 * Mock API response with 3 catalog nodes (matching the user's example)
 */
export const mockApiResponseWithMultipleCatalogs = {
  code: '',
  message: 'ok',
  data: {
    catalogs: [
      {
        level: 0,
        type: 'Title' as const,
        chunk_id: 'f554d658-1767-41dc-bc15-a9755fae00cf',
        content: 'INTERNAL USE ONLY',
        positions: [
          {
            page_id: 2,
            bbox: null
          }
        ],
        children: [
          {
            level: 1,
            type: 'Text' as const,
            chunk_id: '22eaa716-7122-4638-8f71-5298c5a60170',
            content:
              'INTERNAL USE ONLY福利来啦！INTERNAL USE ONLY所有用车场景均可在企业滴滴完成，一站式服务INTERNAL USE ONLY',
            positions: [
              {
                page_id: 2,
                bbox: [0, 0, 360, 360]
              }
            ],
            children: []
          }
        ]
      },
      {
        level: 0,
        type: 'Title' as const,
        chunk_id: '4d0d3d34-9912-430d-8c4d-7daba147621b',
        content: '01',
        positions: [
          {
            page_id: 3,
            bbox: null
          }
        ],
        children: [
          {
            level: 1,
            type: 'Text' as const,
            chunk_id: 'd4115648-e796-4b65-b062-674462d9385d',
            content: '01用车制度及场景说明',
            positions: [
              {
                page_id: 3,
                bbox: [1662840, 515880, 1636200, 2116080]
              }
            ],
            children: []
          }
        ]
      },
      {
        level: 0,
        type: 'Title' as const,
        chunk_id: 'fd67ddcb-951f-4445-ba46-caa403679874',
        content: '用车制度说明-制度明细',
        positions: [
          {
            page_id: 4,
            bbox: null
          }
        ],
        children: [
          {
            level: 1,
            type: 'Text' as const,
            chunk_id: '58f42fab-ab75-43e2-b3cc-6af6486fea79',
            content: '用车制度说明-制度明细',
            positions: [
              {
                page_id: 4,
                bbox: [379440, 879480, 520560, 5216400]
              }
            ],
            children: []
          },
          {
            level: 1,
            type: 'Table' as const,
            chunk_id: 'e4e4f7d7-f521-486b-9f99-d94e09b791d0',
            content: 'table content',
            positions: [
              {
                page_id: 4,
                bbox: [1187280, 368280, 5115240, 11461680]
              }
            ],
            children: []
          }
        ]
      }
    ]
  },
  requestId: 'AIMDP-360dfffc-4f7c-460c-ad48-17b1dff96e06',
  status: 200
};

/**
 * Simulate the old behavior (only taking first catalog)
 */
export function simulateOldBehavior(
  catalogData: ApiCatalogNode[]
): DirectoryNode[] {
  if (Array.isArray(catalogData) && catalogData.length > 0) {
    // OLD: Only take the first element
    return [catalogData[0]] as any;
  }
  return [];
}

/**
 * Simulate the new behavior (converting all catalogs)
 */
export function simulateNewBehavior(
  catalogData: ApiCatalogNode[]
): DirectoryNode[] {
  if (Array.isArray(catalogData) && catalogData.length > 0) {
    // NEW: Convert all elements
    return catalogData as any;
  }
  return [];
}

/**
 * Test function to demonstrate the fix
 */
export function testMultipleCatalogsHandling() {
  const catalogs = mockApiResponseWithMultipleCatalogs.data.catalogs;

  console.log('📊 Testing Multiple Catalogs Handling');
  console.log('=====================================');
  console.log(`Total catalogs in API response: ${catalogs.length}`);

  console.log('\n❌ OLD BEHAVIOR (only first catalog):');
  const oldResult = simulateOldBehavior(catalogs);
  console.log(`   Result count: ${oldResult.length}`);
  console.log(`   First catalog: ${oldResult[0]?.content}`);

  console.log('\n✅ NEW BEHAVIOR (all catalogs):');
  const newResult = simulateNewBehavior(catalogs);
  console.log(`   Result count: ${newResult.length}`);
  newResult.forEach((catalog, index) => {
    console.log(`   Catalog ${index + 1}: ${catalog.content}`);
  });

  console.log('\n📈 Improvement:');
  console.log(`   Before: ${oldResult.length} catalog displayed`);
  console.log(`   After: ${newResult.length} catalogs displayed`);
  console.log(
    `   Increase: ${newResult.length - oldResult.length} additional catalogs`
  );
}
