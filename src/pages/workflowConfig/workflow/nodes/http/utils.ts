import { type BodyPayload, BodyPayloadValueType } from './types'

export const transformToBodyPayload = (old: string, hasKey: boolean): BodyPayload => {
  if (!hasKey) {
    return [
      {
        type: BodyPayloadValueType.text,
        value: old,
      },
    ]
  }
  const bodyPayload = old.split('\n').map((item) => {
    const [key, value] = item.split(':')
    return {
      key: key || '',
      type: BodyPayloadValueType.text,
      value: value || '',
    }
  })
  return bodyPayload
}

// "kkk{{#1748413764880.sss#}}{{#1748413764880.tttt#}}ddd"
// ['kkk',['1748413764880', 'sss'],['1748413764880', 'tttt'],'ddd']
export function parseSpecialString(str: string) {
    const result = [] as any[];
    let currentIndex = 0;
    
    // 正则表达式匹配 {{#数字.字母#}} 格式
    const regex = /\{\{#([a-zA-Z0-9]+)\.([a-zA-Z0-9]+)#\}\}/g;
    let match: any;
    
    while ((match = regex.exec(str)) !== null) {
        // 添加匹配前的普通文本
        if (currentIndex < match.index) {
            result.push(str.slice(currentIndex, match.index));
        }
        
        // 添加匹配到的数字和字母部分
        result.push([match[1], match[2]]);
        
        // 更新当前索引
        currentIndex = match.index + match[0].length;
    }
    
    // 添加最后剩余的普通文本
    if (currentIndex < str.length) {
        result.push(str.slice(currentIndex));
    }
    
    return result;
}
