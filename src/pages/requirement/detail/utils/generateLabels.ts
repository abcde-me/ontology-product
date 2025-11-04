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
