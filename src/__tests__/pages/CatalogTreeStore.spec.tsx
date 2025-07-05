import { CatalogTreeStore } from '../../pages/dataCatalog/store/CatalogTreeStore';
import { TreeDataType } from '@arco-design/web-react/es/Tree/interface';

// Mock DataCatalog
const mockDataCatalog = {} as any;

describe('CatalogTreeStore', () => {
  let store: CatalogTreeStore;

  beforeEach(() => {
    store = new CatalogTreeStore(mockDataCatalog);
  });

  describe('searchTreeData', () => {
    const mockTreeData: TreeDataType[] = [
      {
        key: '1',
        title: 'Root Node 1',
        children: [
          {
            key: '1-volume',
            title: 'volume',
            children: [
              {
                key: '11',
                title: 'test-data',
                isLastLeaf: true
              },
              {
                key: '12',
                title: 'user-info',
                isLastLeaf: true
              }
            ]
          }
        ]
      },
      {
        key: '2',
        title: 'Root Node 2',
        children: [
          {
            key: '2-volume',
            title: 'volume',
            children: [
              {
                key: '21',
                title: 'product-data',
                isLastLeaf: true
              },
              {
                key: '22',
                title: 'test-results',
                isLastLeaf: true
              }
            ]
          }
        ]
      }
    ];

    it('should return all data when search value is empty', () => {
      const result = store.searchTreeData(mockTreeData, '');
      expect(result.filteredData).toEqual(mockTreeData);
      expect(result.expandedKeys).toEqual([]);
    });

    it('should return all data when search value is only whitespace', () => {
      const result = store.searchTreeData(mockTreeData, '   ');
      expect(result.filteredData).toEqual(mockTreeData);
      expect(result.expandedKeys).toEqual([]);
    });

    it('should filter and return matching root nodes', () => {
      const result = store.searchTreeData(mockTreeData, 'Root Node 1');
      expect(result.filteredData).toHaveLength(1);
      expect(result.filteredData[0].key).toBe('1');
      expect(result.expandedKeys).toContain('1');
    });

    it('should filter and return matching leaf nodes with parent structure', () => {
      const result = store.searchTreeData(mockTreeData, 'test-data');
      expect(result.filteredData).toHaveLength(1);
      expect(result.filteredData[0].key).toBe('1');
      expect(result.filteredData[0].children).toHaveLength(1);
      expect(result.filteredData[0].children![0].children).toHaveLength(1);
      expect(result.filteredData[0].children![0].children![0].title).toBe(
        'test-data'
      );
      expect(result.expandedKeys).toContain('1');
      expect(result.expandedKeys).toContain('1-volume');
    });

    it('should be case insensitive', () => {
      const result = store.searchTreeData(mockTreeData, 'TEST-DATA');
      expect(result.filteredData).toHaveLength(1);
      expect(result.filteredData[0].children![0].children![0].title).toBe(
        'test-data'
      );
    });

    it('should return multiple matching nodes', () => {
      const result = store.searchTreeData(mockTreeData, 'test');
      expect(result.filteredData).toHaveLength(2);
      // Should find both "test-data" and "test-results"
      const allLeafTitles = result.filteredData.flatMap(
        (node) =>
          node.children?.flatMap(
            (child) => child.children?.map((leaf) => leaf.title) || []
          ) || []
      );
      expect(allLeafTitles).toContain('test-data');
      expect(allLeafTitles).toContain('test-results');
    });

    it('should return unique expanded keys', () => {
      const result = store.searchTreeData(mockTreeData, 'volume');
      // Should expand both root nodes since they both have "volume" children
      expect(result.expandedKeys).toContain('1');
      expect(result.expandedKeys).toContain('2');
      expect(result.expandedKeys).toContain('1-volume');
      expect(result.expandedKeys).toContain('2-volume');
      // Check that keys are unique
      const uniqueKeys = Array.from(new Set(result.expandedKeys));
      expect(result.expandedKeys).toHaveLength(uniqueKeys.length);
    });

    it('should return empty result when no matches found', () => {
      const result = store.searchTreeData(mockTreeData, 'nonexistent');
      expect(result.filteredData).toHaveLength(0);
      expect(result.expandedKeys).toHaveLength(0);
    });
  });
});
