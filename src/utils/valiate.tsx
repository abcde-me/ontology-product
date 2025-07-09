import { useTranslation } from 'react-i18next';

export function Valiate() {
  const { t } = useTranslation('plugin__console-plugin-aidp');
  const requiredRule = {
    required: true,
    message: t('CannotBeEmpty')
  };
  const requiredInputRule = {
    required: true,
    message: t('InputCannotBeEmpty')
  };
  const requiredSelectRule = {
    required: true,
    message: t('SelectCannotBeEmpty')
  };
  const nameRule = (value: any, callback: any) => {
    if (value) {
      const nameReg = /^[\u4e00-\u9fa5A-Za-z][\u4e00-\u9fa5\5A-Za-z0-9-\_\.]*$/;
      const strLen = value.replace(/[^\x00-\xff]/g, 'aa').length;
      if (!nameReg.test(value) || strLen > 64) {
        return callback(t('NameRuleErrorTip'));
      } else {
        if (strLen < 1 || strLen > 64) {
          return callback(t('NameLengthErrorTip'));
        } else {
          return callback();
        }
      }
    }
    return callback();
  };
  const descRule = (value: any, callback: any) => {
    const strLen = value && value.replace(/[^\x00-\xff]/g, 'aa').length;
    if (value) {
      if (strLen < 2 || strLen > 256) {
        return callback(t('DescLengthErrorTip'));
      } else if (/^(http:\/\/|https:\/\/)/.test(value)) {
        return callback(t('DescErrorTip'));
      }
      return callback();
    }
    return callback();
  };
  const macRule = (value: any, callback: any) => {
    if (value) {
      // mac地址只支持一种格式，就是带冒号得形式，不支持减号的形式
      const macReg = /^([0-9a-fA-F]{2})(([/\s:][0-9a-fA-F]{2}){5})$/;
      if (!macReg.test(value)) {
        return callback(t('MacErrorTip'));
      }
      // 不允许输入组播mac地址
      // A：MAC地址的第八位二进制数字为0代表单播地址，为1代表组播地址。 以01-00-5E开头的MAC地址是大家公认的组播MAC地址，但是除了01-00-5E开头的组播MAC地址外，还存在其他的组播MAC地址，即MAC地址中第八位二进制数字为1的MAC地址均为组播MAC地址。更简单的判断方法是，以16进制中第一字节第二个数字是偶数还是奇数来判断是单播地址还是组播地址，第二个数字是偶数，则代表单播地址，即0、2、4、6、8、A、C、E中的一个；如果是奇数的话，则代表组播地址，即1、3、5、7、9、B、D、F中的一个。 举例： MAC地址01-00-5E-01-00-01对应16进制中第一字节第二个数字是1，为奇数，则该MAC地址是一个组播MAC地址
      const h = parseInt(value.slice(0, 2), 16);
      const b: any = h.toString(2);
      if (b % 2 === 1) {
        return callback(t('MultIMacErrorTip'));
      }
      return callback();
    }
  };
  const ipv4Rule = (value: any, callback: any) => {
    if (value) {
      const ipv4Reg =
        /^(127\.0\.0\.1)|(localhost)|(10\.\d{1,3}\.\d{1,3}\.\d{1,3})|(172\.((1[6-9])|(2\d)|(3[01]))\.\d{1,3}\.\d{1,3})|(192\.168\.\d{1,3}\.\d{1,3})$/;
      if (ipv4Reg.test(value)) {
        return callback();
      } else {
        return callback(t('IPv4AddressErrorTip'));
      }
    }
  };
  const ipv4RulePort = (value: any, callback: any) => {
    if (value) {
      const ipv4Reg =
        /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)$/;
      if (ipv4Reg.test(value)) {
        const valueArr = value.split('.');
        // 不能设置组播地址，组播地址范围224.0.0.0以上，0开头的也不行，127开头的也不行
        if (valueArr[0] === 0 || valueArr[0] === 127 || valueArr[0] >= 224) {
          return callback(t('IPv4AddressErrorTip'));
        } else {
          return callback();
        }
      } else {
        return callback(t('IPv4AddressErrorTip'));
      }
    }
  };
  const ipv4GatewayRulePort = (
    value: any,
    callback: any,
    ipv4Addr?: any,
    ipv4Mask?: any
  ) => {
    if (value) {
      const ipv4Reg =
        /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)$/;
      if (ipv4Reg.test(value)) {
        const valueArr = value.split('.');
        // 不能设置组播地址，组播地址范围224.0.0.0以上，0开头的也不行，127开头的也不行
        if (valueArr[0] === 0 || valueArr[0] === 127 || valueArr[0] >= 224) {
          return callback(t('IPv4GatewayErrorTip'));
        } else {
          //校验ip、掩码、网关的合法性
          if (ipv4Addr == ipv4Mask || ipv4Addr == value || ipv4Mask == value) {
            return callback(t('IPv4AddressIPv4MaskIPv4GatewayNotSame')); //3个地址不能相同
          } else {
            let ipv4Addr_arr = [];
            let ipv4Mask_arr = [];
            let value_arr = [];
            ipv4Addr_arr = ipv4Addr.split('.');
            ipv4Mask_arr = ipv4Mask.split('.');
            value_arr = value.split('.');
            const res0 = parseInt(ipv4Addr_arr[0]) & parseInt(ipv4Mask_arr[0]);
            const res1 = parseInt(ipv4Addr_arr[1]) & parseInt(ipv4Mask_arr[1]);
            const res2 = parseInt(ipv4Addr_arr[2]) & parseInt(ipv4Mask_arr[2]);
            const res3 = parseInt(ipv4Addr_arr[3]) & parseInt(ipv4Mask_arr[3]);
            const res0_gw = parseInt(value_arr[0]) & parseInt(ipv4Mask_arr[0]);
            const res1_gw = parseInt(value_arr[1]) & parseInt(ipv4Mask_arr[1]);
            const res2_gw = parseInt(value_arr[2]) & parseInt(ipv4Mask_arr[2]);
            const res3_gw = parseInt(value_arr[3]) & parseInt(ipv4Mask_arr[3]);
            if (
              res0 == res0_gw &&
              res1 == res1_gw &&
              res2 == res2_gw &&
              res3 == res3_gw
            ) {
              return callback();
            } else {
              return callback(t('IPv4AddressIPv4MaskIPv4GatewayNotMatch'));
            }
          }
        }
      } else {
        return callback(t('IPv4GatewayErrorTip'));
      }
    }
  };
  const ipv4MaskRulePort = (value: any, callback: any) => {
    if (value) {
      const ipv4Reg =
        /^(254|252|248|240|224|192|128)\.0\.0\.0|255\.(254|252|248|240|224|192|128|0)\.0\.0|255\.255\.(254|252|248|240|224|192|128|0)\.0|255\.255\.255\.(254|252|248|240|224|192|128|0)$/;
      if (ipv4Reg.test(value)) {
        return callback();
      } else {
        return callback(t('IPv4MaskErrorTip'));
      }
    }
  };
  const ipv4MaskRule = (value: any, callback: any) => {
    const reg =
      /^(?:(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\/([0-9]|[1-2]\d|3[0-2])$/;
    if (value) {
      if (reg.test(value)) {
        callback();
      } else {
        callback(t('IPV4CIDRAddressErrorTip'));
      }
    }
  };
  const ipv6Rule = (value: any, callback: any) => {
    if (value) {
      const ipv6Reg =
        /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?((\/(1[01][0-9]|12[0-8]|[0-9]{1,2})){1}|[0-9]{1})\s*$/;
      if (ipv6Reg.test(value)) {
        if (value.includes('::') && value.includes('/')) {
          const ipAdress = value.split('::')[0].split(':');
          const segment = +value.split('::')[1].substr(1);
          if (ipAdress.length * 16 > segment && value !== '::/0') {
            return callback(t('IPv6AddressInvalid'));
          }
        }
        return callback();
      } else {
        return callback(t('CIDRAddressErrorTip'));
      }
    }
  };
  const dimensionNameRule = (value: any, callback: any) => {
    if (value) {
      const nameReg = /^[\u4e00-\u9fa5_a-zA-Z0-9_]*$/;
      if (!nameReg.test(value)) {
        return callback(
          t('Supports Chinese and English, underline, 1-10 characters')
        );
      } else {
        return callback();
      }
    }
    return callback();
  };
  return {
    requiredRule,
    requiredInputRule,
    requiredSelectRule,
    ipv4MaskRule,
    ipv4MaskRulePort,
    nameRule,
    descRule,
    macRule,
    ipv4Rule,
    ipv4RulePort,
    ipv4GatewayRulePort,
    ipv6Rule,
    dimensionNameRule
  };
}

export function isValidURL(url: string) {
  // 使用正则表达式校验URL
  const urlPattern = new RegExp(
    '^(https?:\\/\\/)?' + // 协议 http:// 或者 https:// （可选）
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // 域名
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) 地址
      '(\\:\\d+)?' + // 端口号（可选）
      '(\\/[-a-z\\d%_.~+]*)*' + // 路径
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // GET查询参数
      '(\\#[-a-z\\d_]*)?$', // 锚点
    'i'
  );
  return !!urlPattern.test(url);
}

/**
 * 连接器名称，数据载入任务名称，工作流名称，数据目录名称，数据卷名称，数据集名称，数据集的标签名称，数据集版本名称的 命名限制如下：
  1. 名称中允许包含中文，英文字符和阿拉伯数。
  2. 名称中允许包含的特殊字符为 ‘-’, '_'
  3. 名称长度不能超过256个字符。
  4. 名称应该以中文、英文、数字开头，不允许以特殊字符开头。
 * @param {string} name 要校验的名称
 * @returns {boolean} 是否符合规范
 */
export function validateName(name) {
  // 规则1: 名称中允许包含中文，英文字符和阿拉伯数字
  // 规则2: 名称中允许包含的特殊字符为 '-', '_'
  const validCharsRegex = /^[\u4e00-\u9fa5a-zA-Z0-9\-_]+$/;
  if (!validCharsRegex.test(name)) {
    return {
      isValid: false,
      errorMessage:
        '名称中只允许包含中文，英文字符，阿拉伯数字及特殊字符（-、_）'
    };
  }

  // 规则3: 名称长度不能超过255个字符（UTF-8编码）
  const encoder = new TextEncoder();
  const byteLength = encoder.encode(name).length;
  if (byteLength > 255) {
    return {
      isValid: false,
      errorMessage: '长度不能超过255个字符'
    };
  }

  // 规则4: 名称应该以中文、英文、数字开头，不允许以特殊字符开头
  const firstCharRegex = /^[\u4e00-\u9fa5a-zA-Z0-9]/;
  if (!firstCharRegex.test(name.charAt(0))) {
    return {
      isValid: false,
      errorMessage: '名称应该以中文、英文、数字开头，不允许以特殊字符开头'
    };
  }

  return {
    isValid: true
  };
}
