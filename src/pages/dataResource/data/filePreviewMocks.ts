const toDataUrl = (content: string, mime: string): string =>
  `data:${mime},${encodeURIComponent(content)}`;

/** 车辆运维数据字典（PDF 预览 HTML） */
const VEHICLE_DATA_DICTIONARY_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <title>车辆运维数据字典</title>
  <style>
    body { font-family: "PingFang SC", "Microsoft YaHei", sans-serif; margin: 24px; color: #1d2129; line-height: 1.6; }
    h1 { font-size: 20px; margin: 0 0 8px; }
    .meta { color: #86909c; font-size: 13px; margin-bottom: 24px; }
    h2 { font-size: 16px; margin: 24px 0 12px; color: #165dff; border-left: 3px solid #165dff; padding-left: 8px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px; }
    th, td { border: 1px solid #e5e6eb; padding: 8px 10px; text-align: left; }
    th { background: #f7f8fa; font-weight: 600; }
    .tag { display: inline-block; padding: 0 6px; border-radius: 4px; background: #e8f3ff; color: #165dff; font-size: 12px; }
  </style>
</head>
<body>
  <h1>车辆运维数据字典</h1>
  <div class="meta">版本：V2.1 &nbsp;|&nbsp; 更新日期：2025-11-08 &nbsp;|&nbsp; 适用系统：本体平台 · 车辆运维场景</div>

  <h2>1. 车辆对象 vehicle</h2>
  <table>
    <tr><th>字段名</th><th>中文名</th><th>类型</th><th>说明</th><th>示例</th></tr>
    <tr><td>vehicle_id</td><td>车辆编号</td><td>字符串</td><td>主键，全局唯一</td><td>V001</td></tr>
    <tr><td>plate_number</td><td>车牌号</td><td>字符串</td><td>注册登记号牌</td><td>京A12345</td></tr>
    <tr><td>vehicle_type</td><td>车型</td><td>枚举</td><td>轿车 / 货车 / 特种车</td><td>货车</td></tr>
    <tr><td>status</td><td>运行状态</td><td>枚举</td><td>运行 / 维修中 / 停用 / 报废</td><td>运行</td></tr>
    <tr><td>mileage</td><td>累计里程</td><td>数值(km)</td><td>当前里程表读数</td><td>128450</td></tr>
    <tr><td>last_maintenance</td><td>上次维保日期</td><td>日期</td><td>最近一次完成维保的日期</td><td>2025-10-15</td></tr>
    <tr><td>assigned_unit</td><td>所属单位</td><td>字符串</td><td>车辆归属组织</td><td>第一运输中队</td></tr>
  </table>

  <h2>2. 维修记录 maintenance_record</h2>
  <table>
    <tr><th>字段名</th><th>中文名</th><th>类型</th><th>说明</th></tr>
    <tr><td>record_id</td><td>记录编号</td><td>字符串</td><td>主键</td></tr>
    <tr><td>vehicle_id</td><td>关联车辆</td><td>外键</td><td>指向 vehicle.vehicle_id</td></tr>
    <tr><td>fault_type</td><td>故障类型</td><td>枚举</td><td>发动机 / 制动 / 电气 / 轮胎 / 其他</td></tr>
    <tr><td>fault_desc</td><td>故障描述</td><td>文本</td><td>故障现象与诊断说明</td></tr>
    <tr><td>repair_result</td><td>维修结果</td><td>枚举</td><td>已修复 / 待配件 / 无法修复</td></tr>
    <tr><td>repair_cost</td><td>维修费用</td><td>数值(元)</td><td>含税金额</td></tr>
    <tr><td>repair_date</td><td>维修日期</td><td>日期</td><td>工单完成日期</td></tr>
  </table>

  <h2>3. 驾驶员 driver</h2>
  <table>
    <tr><th>字段名</th><th>中文名</th><th>类型</th><th>说明</th></tr>
    <tr><td>driver_id</td><td>驾驶员编号</td><td>字符串</td><td>主键</td></tr>
    <tr><td>name</td><td>姓名</td><td>字符串</td><td>驾驶员姓名</td></tr>
    <tr><td>license_type</td><td>准驾车型</td><td>字符串</td><td>A1 / B2 / C1 等</td></tr>
    <tr><td>phone</td><td>联系电话</td><td>字符串</td><td>脱敏存储</td></tr>
    <tr><td>bound_vehicle_id</td><td>绑定车辆</td><td>外键</td><td>当前指派车辆，可为空</td></tr>
  </table>

  <h2>4. 对象关系说明</h2>
  <p><span class="tag">vehicle —维护—&gt; maintenance_record</span> 一辆车对应多条维修记录</p>
  <p><span class="tag">driver —驾驶—&gt; vehicle</span> 驾驶员与车辆为动态绑定关系</p>
</body>
</html>`;

/** 装备态势示意图（PNG 预览 SVG） */
const EQUIPMENT_SITUATION_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" width="960" height="540">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="960" height="540" fill="url(#bg)"/>
  <text x="480" y="36" text-anchor="middle" fill="#e2e8f0" font-size="20" font-family="PingFang SC, Microsoft YaHei, sans-serif">联合作战装备态势示意图</text>
  <text x="480" y="58" text-anchor="middle" fill="#94a3b8" font-size="12" font-family="PingFang SC, Microsoft YaHei, sans-serif">2025-11-20 08:55 · 区域：东部战区某演训场</text>

  <rect x="40" y="80" width="880" height="420" rx="8" fill="#111827" stroke="#334155" stroke-width="1"/>
  <line x1="40" y1="290" x2="920" y2="290" stroke="#1e3a5f" stroke-width="1" stroke-dasharray="6 4"/>
  <line x1="480" y1="80" x2="480" y2="500" stroke="#1e3a5f" stroke-width="1" stroke-dasharray="6 4"/>

  <circle cx="200" cy="180" r="36" fill="#1d4ed8" stroke="#60a5fa" stroke-width="2" filter="url(#glow)"/>
  <text x="200" y="176" text-anchor="middle" fill="#fff" font-size="11" font-family="sans-serif">055型</text>
  <text x="200" y="192" text-anchor="middle" fill="#bfdbfe" font-size="10" font-family="sans-serif">驱逐舰</text>

  <circle cx="480" cy="160" r="32" fill="#7c3aed" stroke="#c4b5fd" stroke-width="2" filter="url(#glow)"/>
  <text x="480" y="156" text-anchor="middle" fill="#fff" font-size="11" font-family="sans-serif">歼-16</text>
  <text x="480" y="172" text-anchor="middle" fill="#ddd6fe" font-size="10" font-family="sans-serif">战斗机</text>

  <circle cx="760" cy="200" r="30" fill="#059669" stroke="#6ee7b7" stroke-width="2" filter="url(#glow)"/>
  <text x="760" y="196" text-anchor="middle" fill="#fff" font-size="11" font-family="sans-serif">99A</text>
  <text x="760" y="212" text-anchor="middle" fill="#a7f3d0" font-size="10" font-family="sans-serif">主战坦克</text>

  <circle cx="320" cy="380" r="28" fill="#dc2626" stroke="#fca5a5" stroke-width="2" filter="url(#glow)"/>
  <text x="320" y="376" text-anchor="middle" fill="#fff" font-size="11" font-family="sans-serif">红旗-9</text>
  <text x="320" y="392" text-anchor="middle" fill="#fecaca" font-size="10" font-family="sans-serif">防空导弹</text>

  <circle cx="620" cy="360" r="26" fill="#d97706" stroke="#fcd34d" stroke-width="2" filter="url(#glow)"/>
  <text x="620" y="356" text-anchor="middle" fill="#fff" font-size="11" font-family="sans-serif">指挥所</text>
  <text x="620" y="372" text-anchor="middle" fill="#fde68a" font-size="10" font-family="sans-serif">C2节点</text>

  <circle cx="160" cy="420" r="22" fill="#475569" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="160" y="424" text-anchor="middle" fill="#e2e8f0" font-size="10" font-family="sans-serif">雷达站</text>

  <line x1="200" y1="180" x2="480" y2="160" stroke="#38bdf8" stroke-width="1.5" marker-end="url(#arrow)"/>
  <line x1="480" y1="160" x2="760" y2="200" stroke="#38bdf8" stroke-width="1.5"/>
  <line x1="620" y1="360" x2="480" y2="160" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="4 3"/>
  <line x1="620" y1="360" x2="320" y2="380" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="4 3"/>
  <line x1="620" y1="360" x2="760" y2="200" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="4 3"/>
  <line x1="160" y1="420" x2="320" y2="380" stroke="#64748b" stroke-width="1"/>

  <rect x="60" y="460" width="12" height="12" rx="2" fill="#1d4ed8"/><text x="80" y="470" fill="#cbd5e1" font-size="11" font-family="sans-serif">海军平台</text>
  <rect x="160" y="460" width="12" height="12" rx="2" fill="#7c3aed"/><text x="180" y="470" fill="#cbd5e1" font-size="11" font-family="sans-serif">空中平台</text>
  <rect x="260" y="460" width="12" height="12" rx="2" fill="#059669"/><text x="280" y="470" fill="#cbd5e1" font-size="11" font-family="sans-serif">地面平台</text>
  <rect x="360" y="460" width="12" height="12" rx="2" fill="#dc2626"/><text x="380" y="470" fill="#cbd5e1" font-size="11" font-family="sans-serif">武器系统</text>
  <rect x="460" y="460" width="12" height="12" rx="2" fill="#d97706"/><text x="480" y="470" fill="#cbd5e1" font-size="11" font-family="sans-serif">指挥节点</text>
  <line x1="580" y1="466" x2="610" y2="466" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="4 3"/><text x="618" y="470" fill="#cbd5e1" font-size="11" font-family="sans-serif">指挥链路</text>
  <line x1="700" y1="466" x2="730" y2="466" stroke="#38bdf8" stroke-width="1.5"/><text x="738" y="470" fill="#cbd5e1" font-size="11" font-family="sans-serif">协同打击链</text>
</svg>`;

export const SEED_PREVIEW_TEXT: Record<string, string> = {
  'file-1': `车辆运维数据字典 V2.1

【车辆对象 vehicle】
- vehicle_id：车辆编号（主键）
- plate_number：车牌号，字符串
- vehicle_type：车型，枚举（轿车/货车/特种车）
- status：运行状态，枚举（运行/维修中/停用/报废）
- mileage：累计里程，数值(km)
- last_maintenance：上次维保日期
- assigned_unit：所属单位

【维修记录 maintenance_record】
- record_id：记录编号（主键）
- vehicle_id：关联车辆
- fault_type：故障类型（发动机/制动/电气/轮胎/其他）
- fault_desc：故障描述
- repair_result：维修结果（已修复/待配件/无法修复）
- repair_cost：维修费用(元)
- repair_date：维修日期

【驾驶员 driver】
- driver_id：驾驶员编号
- name：姓名
- license_type：准驾车型
- bound_vehicle_id：绑定车辆`,

  'file-4': `object_id,object_type,object_name,plate_number,status,mileage,last_maintenance,assigned_unit,fault_count
V001,vehicle,运输卡车-01,京A12345,运行,128450,2025-10-15,第一运输中队,2
V002,vehicle,指挥车-02,京B67890,维修中,86520,2025-09-20,指挥保障连,5
V003,vehicle,装甲运兵-03,京C11223,运行,45230,2025-11-01,装甲运输营,1
V004,vehicle,通信中继-04,京D44556,停用,210800,2025-06-08,通信连,8
D001,driver,张伟,,在岗,,,第一运输中队,
D002,driver,李强,,在岗,,,指挥保障连,
M001,maintenance_record,发动机异响检修,,已修复,,2025-10-18,V002,`,
  'file-5': `联合作战场景拓扑说明

一、场景概述
本文件描述东部战区某演训场联合作战场景的拓扑结构，涵盖指挥控制、海空陆跨域平台、武器系统及地理节点。

二、核心对象类型
1. 指挥节点（C2）：联合作战指挥所，负责下达任务与资源调度。
2. 作战单元（military_unit）：营/连级编制单位，执行具体作战任务。
3. 海军平台（naval_platform）：如 055 型驱逐舰，承担区域防空与对海打击。
4. 空中平台（air_platform）：如 歼-16 战斗机，承担制空与对地支援。
5. 地面平台（ground_platform）：如 99A 主战坦克，承担地面突击。
6. 武器系统（weapon）：如 红旗-9 防空导弹，可独立部署或由平台挂载。
7. 地理节点（geographic_location）：演训区域、目标点及控制区。

三、关系链路
- 指挥链路：指挥所 → 作战单元 → 各域平台（虚线表示 C2 指挥关系）
- 协同打击链：空中平台 → 地面/海上目标（实线表示火力协同）
- 装备关系：平台 —挂载— 武器系统
- 部署关系：武器/雷达 —部署于—  geographic_location

四、态势图图例
- 蓝色：海军平台  |  紫色：空中平台  |  绿色：地面平台
- 红色：武器系统  |  橙色：指挥节点  |  灰色：传感/雷达节点
- 黄色虚线：指挥链路  |  蓝色实线：协同打击链

五、告警规则（拓扑着色）
节点边框高亮表示当前告警级别：绿色=正常，黄色=注意，红色=威胁。`
};

export const SEED_PREVIEW_URL: Record<string, string> = {
  'file-1': toDataUrl(VEHICLE_DATA_DICTIONARY_HTML, 'text/html;charset=utf-8'),
  'file-6': toDataUrl(EQUIPMENT_SITUATION_SVG, 'image/svg+xml')
};

/** 图片类 mock 的可读描述，供信息提取使用 */
export const SEED_PREVIEW_IMAGE_DESCRIPTION: Record<string, string> = {
  'file-6': `装备态势示意图内容描述：
- 标题：联合作战装备态势示意图，东部战区某演训场
- 节点：055型驱逐舰、歼-16战斗机、99A主战坦克、红旗-9防空导弹、指挥所C2节点、雷达站
- 关系：指挥所与各平台间为指挥链路（黄色虚线）；空中平台与地面/海上平台间为协同打击链（蓝色实线）；雷达站与防空导弹为探测-拦截关联
- 图例：蓝=海军、紫=空中、绿=地面、红=武器、橙=指挥、灰=雷达`
};
