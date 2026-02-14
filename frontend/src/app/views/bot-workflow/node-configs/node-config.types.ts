// 节点配置数据类型
export interface NodeConfigData {
    text: string;
    nodeType: string;
    // 发货节点
    deliveryMode: string;
    deliveryContent: string;
    // 延迟节点
    delayMs: number;
    delayMode: string;
    delayMinMs: number;
    delayMaxMs: number;
    delayUnit: string;
    // 条件节点
    expression: string;
    // 等待回复节点
    keywords: string;
    matchMode: string;
    promptMessage: string;
    // 通知节点
    message: string;
}

// 思维导图节点类型
export interface MindMapNode {
    data: {
        text: string;
        uid?: string;
        nodeType?: string;
        config?: Record<string, any>;
        fillColor?: string;
        borderColor?: string;
        fontColor?: string;
    };
    children?: MindMapNode[];
}

// 节点类型配置
export const NODE_TYPES = {
    trigger: { label: '触发', color: '#22c55e', desc: '订单支付成功时触发' },
    condition: { label: '条件判断', color: '#ec4899', desc: '根据条件分支' },
    delivery: { label: '发货', color: '#f59e0b', desc: '发送发货内容' },
    ship: { label: '标记发货', color: '#8b5cf6', desc: '标记订单已发货' },
    delay: { label: '延迟', color: '#6b7280', desc: '延迟执行' },
    autoreply: { label: '等待回复', color: '#3b82f6', desc: '发送消息并等待买家确认' },
    notify: { label: '通知', color: '#06b6d4', desc: '发送通知消息' }
} as const;

// 关键词匹配模式
export const MATCH_MODES = [
    { value: 'exact', label: '精确匹配', desc: '回复内容必须完全等于关键词' },
    { value: 'contains', label: '模糊匹配', desc: '回复内容包含关键词即可' }
];

// 延迟模式
export const DELAY_MODES = [
    { value: 'fixed', label: '固定时间', desc: '固定延迟指定时间' },
    { value: 'random', label: '浮动时间', desc: '在时间范围内随机延迟，模拟真人操作' }
];

// 时间单位
export const TIME_UNITS = [
    { value: 'ms', label: '毫秒', factor: 1 },
    { value: 's', label: '秒', factor: 1000 }
];

// 条件表达式模板
export const CONDITION_TEMPLATES = [
    { label: '商品价格', expr: 'order.price', ops: ['>', '<', '>=', '<=', '=='] },
    { label: '商品数量', expr: 'order.quantity', ops: ['>', '<', '>=', '<=', '=='] },
    { label: '商品名称包含', expr: 'order.goodsName.includes("")', ops: [] },
    { label: '买家留言包含', expr: 'order.buyerMessage.includes("")', ops: [] },
    { label: '商品ID', expr: 'order.goodsId', ops: ['==', '!='] },
    { label: '买家昵称', expr: 'order.buyerNick', ops: ['==', '!=', 'includes'] }
];
