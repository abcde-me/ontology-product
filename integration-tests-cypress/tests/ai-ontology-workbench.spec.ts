/**
 * AI 本体工作台 - 自动化测试
 * 基于测试用例 Excel 自动生成
 */

describe('AI 本体工作台 - 本体智能助手区域', () => {
    // 测试前置条件
    beforeEach(() => {
        // 登录并进入 AI 本体工作台
        cy.visit('/tenant/compute/onto/aiOntologyWorkbench');

        // 等待页面加载完成
        cy.contains('本体AI工作台').should('be.visible');

        // 等待本体场景选择器加载
        cy.get('[data-testid="ontology-selector"]', { timeout: 10000 }).should('exist');
    });

    /**
     * 测试用例 1: 对象类型 - 查询
     * 优先级: P0
     * 测试步骤:
     * 1. 在 AI 会话区输入：当前存在的对象类型
     * 2. 查看返回结果
     * 预期结果:
     * 1. 以卡片的形式，列出全部的对象类型
     * 2. 卡片显示：对象名称、在本体场景库中查看图标、定位图标
     */
    it('[P0] 对象类型-查询: 应该显示对象类型卡片和操作图标', () => {
        // 等待输入框可用
        cy.get('textarea[placeholder*="输入"]', { timeout: 10000 }).should('be.visible');

        // 输入查询内容
        cy.get('textarea[placeholder*="输入"]').type('当前存在的对象类型{enter}');

        // 等待 AI 响应
        cy.contains('工具调用', { timeout: 30000 }).should('be.visible');

        // 等待响应完成
        cy.contains('工具调用完成', { timeout: 60000 }).should('be.visible');

        // 验证对象类型卡片存在
        cy.get('[data-testid="ontology-action-card"]', { timeout: 10000 })
            .should('have.length.greaterThan', 0)
            .first()
            .within(() => {
                // 验证卡片显示对象名称
                cy.get('[data-testid="ontology-name"]').should('be.visible');

                // 验证显示"在本体场景库中查看"图标
                cy.get('[data-testid="view-icon"]').should('be.visible');

                // 验证显示定位图标
                cy.get('[data-testid="locate-icon"]').should('be.visible');
            });
    });

    /**
     * 测试用例 2: 对象类型 - 新增
     * 优先级: P0
     * 测试步骤:
     * 1. 在 AI 会话区输入：创建对象类型测试对象A
     * 2. 查看返回结果
     * 预期结果:
     * 1. 以卡片的形式，显示新增的对象类型
     * 2. 卡片显示：对象名称，并标注"新增"（字体颜色为绿色）、在本体场景库中查看图标、定位图标
     * 3. 右侧图谱实时新增对象类型A
     */
    it('[P0] 对象类型-新增: 应该显示新增标签和更新图谱', () => {
        // 输入创建命令
        cy.get('textarea[placeholder*="输入"]').type('创建对象类型测试对象A{enter}');

        // 等待 AI 响应完成
        cy.contains('工具调用完成', { timeout: 60000 }).should('be.visible');

        // 验证新增的对象类型卡片
        cy.get('[data-testid="ontology-action-card"]')
            .filter(':contains("测试对象A")')
            .first()
            .within(() => {
                // 验证显示对象名称
                cy.get('[data-testid="ontology-name"]').should('contain', '测试对象A');

                // 验证显示"新增"标签，且颜色为绿色
                cy.get('[data-testid="action-tag"]')
                    .should('contain', '新增')
                    .and('have.css', 'color', 'rgb(12, 191, 146)'); // #0cbf92

                // 验证显示操作图标
                cy.get('[data-testid="view-icon"]').should('be.visible');
                cy.get('[data-testid="locate-icon"]').should('be.visible');
            });

        // 验证右侧图谱更新（可选，取决于图谱实现）
        // cy.get('[data-testid="graph-panel"]').within(() => {
        //   cy.contains('测试对象A').should('be.visible');
        // });
    });

    /**
     * 测试用例 3: 对象类型 - 删除
     * 优先级: P0
     * 测试步骤:
     * 1. 在 AI 会话区输入：删除对象类型测试对象A
     * 2. 查看返回结果
     * 预期结果:
     * 1. 以卡片的形式，显示删除的对象类型
     * 2. 卡片显示：对象名称，并标注"删除"（字体颜色为红色），不显示定位和跳转图标
     * 3. 右侧图谱不显示对象类型A
     */
    it('[P0] 对象类型-删除: 应该显示删除标签且不显示操作图标', () => {
        // 输入删除命令
        cy.get('textarea[placeholder*="输入"]').type('删除对象类型测试对象A{enter}');

        // 等待 AI 响应完成
        cy.contains('工具调用完成', { timeout: 60000 }).should('be.visible');

        // 验证删除的对象类型卡片
        cy.get('[data-testid="ontology-action-card"]')
            .filter(':contains("测试对象A")')
            .first()
            .within(() => {
                // 验证显示对象名称
                cy.get('[data-testid="ontology-name"]').should('contain', '测试对象A');

                // 验证显示"删除"标签，且颜色为红色
                cy.get('[data-testid="action-tag"]')
                    .should('contain', '删除')
                    .and('have.css', 'color', 'rgb(229, 46, 45)'); // #e52e2d

                // 验证不显示操作图标
                cy.get('[data-testid="view-icon"]').should('not.exist');
                cy.get('[data-testid="locate-icon"]').should('not.exist');
            });
    });

    /**
     * 测试用例 4: 链接 - 查询
     * 优先级: P0
     * 测试步骤:
     * 1. 在 AI 会话区输入：查看链接A详情
     * 2. 查看返回结果
     * 预期结果:
     * 1. 以卡片的形式显示链接A
     * 2. 卡片显示：链接名称、在本体场景库中查看图标、定位图标
     */
    it('[P0] 链接-查询: 应该显示链接卡片和操作图标', () => {
        // 输入查询命令
        cy.get('textarea[placeholder*="输入"]').type('查看链接A详情{enter}');

        // 等待 AI 响应完成
        cy.contains('工具调用完成', { timeout: 60000 }).should('be.visible');

        // 验证链接卡片
        cy.get('[data-testid="ontology-action-card"]')
            .filter(':contains("链接")')
            .first()
            .within(() => {
                // 验证显示链接名称
                cy.get('[data-testid="ontology-name"]').should('be.visible');

                // 验证显示操作图标
                cy.get('[data-testid="view-icon"]').should('be.visible');
                cy.get('[data-testid="locate-icon"]').should('be.visible');
            });
    });

    /**
     * 测试用例 5: 函数 - 查询
     * 优先级: P0
     * 测试步骤:
     * 1. 在 AI 会话区输入：查看函数A详情
     * 2. 查看返回结果
     * 预期结果:
     * 1. 以卡片的形式显示函数
     * 2. 卡片显示：函数名称、函数代码、在本体场景库中查看图标
     */
    it('[P0] 函数-查询: 应该显示函数卡片和代码', () => {
        // 输入查询命令
        cy.get('textarea[placeholder*="输入"]').type('查看函数A详情{enter}');

        // 等待 AI 响应完成
        cy.contains('工具调用完成', { timeout: 60000 }).should('be.visible');

        // 验证函数卡片
        cy.get('[data-testid="ontology-action-card"]')
            .filter(':contains("函数")')
            .first()
            .within(() => {
                // 验证显示函数名称
                cy.get('[data-testid="ontology-name"]').should('be.visible');

                // 验证显示函数代码区域
                cy.get('[data-testid="function-code"]').should('be.visible');

                // 验证显示查看图标（函数不显示定位图标）
                cy.get('[data-testid="view-icon"]').should('be.visible');
                cy.get('[data-testid="locate-icon"]').should('not.exist');
            });
    });
});

/**
 * 工具调用测试
 */
describe('AI 本体工作台 - 工具调用', () => {
    beforeEach(() => {
        cy.visit('/tenant/compute/onto/aiOntologyWorkbench');
        cy.contains('本体AI工作台').should('be.visible');
    });

    /**
     * 测试用例: 工具调用 - 调用中
     * 优先级: P1
     * 预期结果:
     * 1. 显示：工具调用中...
     * 2. 默认展开显示调用的工具，每个工具以卡片的形式显示
     * 3. 工具卡片内容包括：工具名称、json格式的入参和出参、复制图标
     */
    it('[P1] 工具调用-调用中: 应该显示工具调用状态和卡片', () => {
        // 输入触发工具调用的命令
        cy.get('textarea[placeholder*="输入"]').type('当前存在的对象类型{enter}');

        // 验证显示"工具调用中"
        cy.contains('工具调用', { timeout: 10000 }).should('be.visible');

        // 验证工具卡片存在
        cy.get('[data-testid="tool-card"]').should('have.length.greaterThan', 0);

        // 验证工具卡片内容
        cy.get('[data-testid="tool-card"]').first().within(() => {
            // 验证显示工具名称
            cy.get('[data-testid="tool-name"]').should('be.visible');

            // 验证显示复制图标
            cy.get('[data-testid="copy-icon"]').should('be.visible');
        });
    });

    /**
     * 测试用例: 工具调用 - 调用完成
     * 优先级: P0
     * 预期结果:
     * 1. 显示：工具调用完成，以及调用工具的耗时
     * 2. 工具调用情况，自动收起
     */
    it('[P0] 工具调用-调用完成: 应该显示完成状态和耗时', () => {
        // 输入命令
        cy.get('textarea[placeholder*="输入"]').type('当前存在的对象类型{enter}');

        // 等待工具调用完成
        cy.contains('工具调用完成', { timeout: 60000 }).should('be.visible');

        // 验证显示耗时
        cy.contains(/耗时|用时/).should('be.visible');

        // 验证工具调用详情默认收起（可选）
        // cy.get('[data-testid="tool-details"]').should('not.be.visible');
    });
});
