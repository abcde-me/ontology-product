import { isArray, isObject, isString } from '../../utils/is';

describe('is', () => {
  it('isArray isObject isString', () => {
    expect(isArray(['test'])).toBeTruthy();
    expect(isObject({ test: 'test' })).toBeTruthy();
    expect(isString('test')).toBeTruthy();
  });
});
