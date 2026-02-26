# React + Arco Design 参数详情页面生成 Prompt

## 基础版 Prompt

使用 React + TypeScript + Arco Design 生成一个参数详情展示页面。

页面结构如下：

1. 外层使用 div 组件作为容器。
2. 顶部区域为“基本信息”：
   - 展示字段：
     - 显示名称
     - 面板ID
     - 描述说明
     - 基本信息模块的label样式为

   ```scss
   font-family: PingFang SC;
   font-weight: 400;
   font-size: 14px;
   line-height: 22px;
   ```

   - 两列布局。

3. 中间为“输入详情”模块：
   - 标题为“输入详情”
   - 使用 Table 组件
   - 列包括：
     - 入参名称
     - 入参类型
   - 支持分页（Pagination），每页 5 条
   - 表格无勾选，无操作列

4. 下方为“输出详情”模块：
   - 标题为“输出详情”
   - 同样使用 Table
   - 列包括：
     - 出参名称
     - 出参类型
   - 支持分页

5. 样式要求：

- 外层白色卡片容器
- 使用加粗文本
- 表格为轻量风格，无边框强调
- 分页放在右下角
- 每个模块有分割线
- 分区标题的样式如下：

```scss
font-family: PingFang SC;
font-weight: 600;
font-size: 14px;
line-height: 22px;
vertical-align: middle;
```

功能要求：

- 输入参数和输出参数分开管理
- 支持分页状态独立
- 表格高度自适应
- 空数据时显示 Empty 状态

代码风格：

- 使用 useState 管理分页
- 列定义单独抽离
- 类型定义完整
- 不使用 class 组件
- className 格式为中划线+小写字母组合

6. 所有数据使用 mock 数据。
7. 使用函数组件 + hooks。
8. 代码完整可直接运行。
9. 代码注释补全
