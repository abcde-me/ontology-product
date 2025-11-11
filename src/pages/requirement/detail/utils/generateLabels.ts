import { v4 as uuidV4 } from 'uuid';
import { LabelShape } from '../../type';
import { getRandomHexColorStrict } from '../../common';

// 初始化label数据
export const generateInitialData = [
  {
    label_id: uuidV4(),
    label_name_cn: '',
    label_name_en: '',
    label_shape: LabelShape.RECTANGLE,
    label_colour: getRandomHexColorStrict(),
    label_info_attribute_groups: [],
    label_mapping: ''
  }
];

// 提交label数据
export const generateLabels = (data: any[]) => {
  return data.map((item) => {
    return {
      ...item,
      order_num: data?.length + 1,
      label_info_attribute_groups: item.label_info_attribute_groups.map(
        (group) => {
          return {
            ...group,
            order_num: item?.label_info_attribute_groups?.length + 1,
            label_info_attribute: group.label_info_attribute?.map(
              (attribute) => {
                return {
                  ...attribute,
                  order_num: group?.label_info_attribute?.length + 1,
                  attribute_name_en: attribute.attribute_name_en.replace(
                    /\s+/g,
                    '_'
                  )
                };
              }
            )
          };
        }
      )
    };
  });
};

// 模型标签形状映射：将API返回的字符串形状转换为数字
export const LABEL_MAPPING = {
  bbox: 3, // 矩形
  rectangle: 3, // 矩形
  polygon: 4, // 多边形
  points: 1, // 点
  point: 1, // 点
  polyline: 2, // 线
  line: 2, // 线
  ellipse: 5 // 椭圆
};
