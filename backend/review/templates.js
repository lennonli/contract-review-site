/**
 * 合同审查模板 - 预设规则
 * Contract Review Templates - Predefined Rules
 */

/**
 * 私募股权合同模板
 */
export const privateEquityTemplate = {
    id: 'private_equity',
    name: '私募股权合同 (Private Equity Agreement)',
    description: '适用于私募股权投资协议的审查',

    reviewPoints: [
        {
            category: '投资条款',
            items: [
                '投资金额、估值、股权比例是否明确',
                '投资款支付时间、条件、方式是否合理',
                '股权交割条件是否完备',
                '对赌条款是否合法有效'
            ]
        },
        {
            category: '权利义务',
            items: [
                '股东权利（表决权、优先权、信息权）是否完整',
                '管理层义务（竞业禁止、保密义务）是否明确',
                '董事会席位分配是否合理',
                '重大事项决策机制是否清晰'
            ]
        },
        {
            category: '退出机制',
            items: [
                'IPO退出条款是否明确',
                '回购条款触发条件、价格、时间是否合理',
                '优先清算权比例是否符合行业惯例',
                '拖售权、共同出售权条款是否平衡'
            ]
        },
        {
            category: '风险控制',
            items: [
                '陈述与保证条款是否全面',
                '违约责任是否对等',
                '争议解决方式是否合理',
                '保密条款是否充分'
            ]
        }
    ],

    riskKeywords: [
        '对赌', '回购', '清算优先权', '反稀释', '拖售',
        '竞业禁止', '知识产权', '担保', '违约金', '仲裁'
    ],

    complianceChecks: [
        '是否符合《公司法》关于股权转让的规定',
        '是否符合《私募投资基金监督管理暂行办法》',
        '对赌条款是否违反《九民纪要》相关规定',
        '是否涉及外商投资需审批事项'
    ]
};

/**
 * 融资协议模板
 */
export const financingTemplate = {
    id: 'financing',
    name: '融资协议 (Financing Agreement)',
    description: '适用于企业融资协议的审查',

    reviewPoints: [
        {
            category: '融资条款',
            items: [
                '融资金额、用途、期限是否明确',
                '利率、费用、还款方式是否合理',
                '提款条件、提款期是否清晰',
                '提前还款条款是否公平'
            ]
        },
        {
            category: '担保条款',
            items: [
                '担保方式、担保物是否明确',
                '担保范围是否过度',
                '担保登记手续是否完备',
                '反担保条款是否合理'
            ]
        },
        {
            category: '财务约束',
            items: [
                '财务指标要求是否可实现',
                '财务报告义务是否过重',
                '资金使用限制是否合理',
                '分红限制条款是否适当'
            ]
        },
        {
            category: '违约与救济',
            items: [
                '违约事件定义是否明确',
                '交叉违约条款范围是否恰当',
                '违约金计算是否合理',
                '加速到期条款是否公平'
            ]
        }
    ],

    riskKeywords: [
        '担保', '抵押', '质押', '违约', '加速到期',
        '交叉违约', '财务指标', '利率', '罚息', '提前还款'
    ],

    complianceChecks: [
        '是否符合《民法典》担保制度规定',
        '利率是否符合LPR相关规定',
        '是否涉及关联交易需履行审批程序',
        '担保是否需国资监管部门审批'
    ]
};

/**
 * 尽调协议模板
 */
export const dueDiligenceTemplate = {
    id: 'due_diligence',
    name: '尽职调查协议 (Due Diligence Agreement)',
    description: '适用于并购、投资前尽职调查协议的审查',

    reviewPoints: [
        {
            category: '调查范围',
            items: [
                '调查事项清单是否完整',
                '调查时间、地点、方式是否明确',
                '资料提供义务是否清晰',
                '现场调查安排是否合理'
            ]
        },
        {
            category: '保密义务',
            items: [
                '保密信息范围是否明确',
                '保密期限是否合理',
                '保密例外情形是否完备',
                '违反保密的责任是否充分'
            ]
        },
        {
            category: '信息真实性',
            items: [
                '被调查方陈述与保证是否全面',
                '信息不实的责任是否明确',
                '信息更新义务是否约定',
                '重大事项披露标准是否清晰'
            ]
        },
        {
            category: '费用与终止',
            items: [
                '尽调费用承担是否合理',
                '协议终止条件是否明确',
                '资料返还义务是否清晰',
                '终止后保密义务是否延续'
            ]
        }
    ],

    riskKeywords: [
        '保密', '商业秘密', '披露', '陈述与保证', '重大事项',
        '费用', '终止', '资料返还', '竞业', '排他期'
    ],

    complianceChecks: [
        '是否符合《反不正当竞争法》关于商业秘密保护的规定',
        '是否符合《数据安全法》《个人信息保护法》相关要求',
        '涉及国家秘密的信息是否有特殊保护措施',
        '境外投资者调查是否需外商投资安全审查'
    ]
};

/**
 * 获取模板
 * @param {string} templateId - 模板ID
 * @returns {object|null}
 */
export function getTemplate(templateId) {
    const templates = {
        private_equity: privateEquityTemplate,
        financing: financingTemplate,
        due_diligence: dueDiligenceTemplate
    };

    return templates[templateId] || null;
}

/**
 * 获取所有模板列表
 * @returns {Array}
 */
export function getAllTemplates() {
    return [
        privateEquityTemplate,
        financingTemplate,
        dueDiligenceTemplate
    ];
}
