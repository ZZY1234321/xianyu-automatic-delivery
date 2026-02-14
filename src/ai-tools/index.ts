/**
 * AI 工具模块
 * 导出可供 AI 使用的工具函数和定义
 */

export {
    queryBuyerOrders,
    orderQueryToolDefinition,
    type OrderQueryContext,
    type OrderQueryResult
} from './order-query.tool.js'

export {
    getChatHistory,
    type ChatHistoryContext,
    type ChatHistoryMessage
} from './chat-history.tool.js'

import { orderQueryToolDefinition } from './order-query.tool.js'

// 所有可用的工具定义
export const AI_TOOLS = [orderQueryToolDefinition]
