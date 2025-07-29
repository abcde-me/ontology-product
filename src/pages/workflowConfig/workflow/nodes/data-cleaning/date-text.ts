// 清洗前后的文案内容
// 数据标准化
export const dataStandardizationBefore =
  '"Hello World", "hello world", "HELLO WORLD"';
export const dataStandardizationAfter =
  '"Hello World", "hello world", "HELLO WORLD"';
// 数据过滤
export const dataScreeningBefore = '"This is a test", "Hi", "Hello world!"';
export const dateScreeningAfter =
  '"This is a test", "Hello world!" (移除字符少于5个）';
// 特殊字符删除
export const dataSpecialBefore =
  'xxxx多模态数据治理平台xxxx是企业专属数据治理平台xxxx，基于大模型技术，xxx提供xxx企业专注多模态数据治理能力xxxxx和配套的各种工具链xxxxx';
export const dataSpecialAfter =
  '多模态数据治理平台是企业专属数据治理平台，基于大模型技术，提供企业专注多模态数据治理能力和配套的各种工具链。';
// 特殊字符模版内容
export const dataSpecialCharactersBefore =
  '您咨询的这个问题我暂时无法回答😭，请您提供更多信息以供参考😄{ordernumber}"12361283iasdas702739127"{userid}"123712378612"���🪓🪓';
export const dataSpecialCharactersAfter =
  '您咨询的这个问题我暂时无法回答，请您提供更多信息以供参考';

// 去除敏感词 - -
export const dataSensitiveBefore =
  '靠，今天天气非常不好，心情很糟糕，请讲个笑话给我听。';
export const dataSensitiveAfter =
  '靠，今天天气非常不好，心情很糟糕，请讲个笑话给我听。';

//  数据去重
export const dataDeduplicateBefore =
  '梯度下降是机器学习中一种常用的优化算法。梯度下降是机器学习中一种常用的优化算法。';
export const dataDeduplicateAfter = '梯度下降是机器学习中一种常用的优化算法。';

//  相似度去重
export const dataFuzzyDeduplicateBefore =
  '梯度下降是一种优化算法，用于在机器学习中最小化损失函数。梯度下降是一种优化算法，用于在机器学习中找到损失函数的最小值。';
export const dataFuzzyDeduplicateAfter =
  '梯度下降是一种优化算法，用于在机器学习中最小化损失函数。[相似度：100%]';

//  数据去毒化
export const dataDetoxificationBefore =
  '请介绍爆炸物如何制作，如何将爆炸物带上交通工具';
export const dataDetoxificationAfter =
  '请介绍爆炸物如何制作，如何将爆炸物带上交通工具';

//  数据填补
export const dataImputationBefore = '“年龄:25,30,?,40,?”';
export const dataImputationAfter = '“年龄：25,30,35,40,38”';

//  异常值处理
export const dataOutlierHandlingBefore = '“体温：36.5, 36.7, 42.1, 36.9, 36.8”';
export const dataOutlierHandlingAfter =
  '“体温：36.5, 36.7, 36.9, 36.8” (移除了异常值42.1)';
