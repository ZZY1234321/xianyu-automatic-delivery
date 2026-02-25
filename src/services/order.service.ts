/**
 * 订单服务
 * 简化版：订单ID唯一，通过API获取订单详情
 */

import { createLogger } from '../core/logger.js'
import {
    getOrders,
    getOrderCount,
    getOrderById,
    upsertOrder,
    updateOrderStatus,
    getEnabledAutoSellRules
} from '../db/index.js'
import { OrderStatus, ORDER_STATUS_TEXT } from '../types/order.types.js'
import { startWorkflowExecution } from './workflow.service.js'
import type { OrderRecord, OrderListParams, OrderDetailData } from '../types/order.types.js'
import type { GoofishClient } from '../websocket/client.js'

const logger = createLogger('Svc:Order')

// 获取订单列表
export function getOrderList(params: OrderListParams) {
    const orders = getOrders(params)
    const total = getOrderCount(params)
    return {
        orders,
        total,
        limit: params.limit || 50,
        offset: params.offset || 0
    }
}

// 获取单个订单
export function getOrder(orderId: string): OrderRecord | null {
    return getOrderById(orderId)
}

// 处理订单消息：仅记录订单ID，详情通过API获取
export function handleOrderMessage(accountId: string, orderId: string, chatId?: string): void {
    logger.info(`[订单处理] 收到订单消息: 订单ID=${orderId}, 账号=${accountId}, 会话ID=${chatId || '无'}`)

    // 检查订单是否已存在
    const existing = getOrderById(orderId)
    if (!existing) {
        // 创建订单占位记录
        upsertOrder({
            orderId,
            accountId,
            status: 0,
            statusText: '获取中...',
            chatId
        })
        logger.info(`[订单处理] 新订单记录已创建: ${orderId}, 账号=${accountId}`)
    } else {
        logger.debug(`[订单处理] 订单已存在: ${orderId}, 当前状态=${existing.statusText}`)
        // 更新 chatId（如果之前没有）
        if (chatId && !existing.chatId) {
            upsertOrder({
                ...existing,
                chatId
            })
            logger.info(`[订单处理] 更新订单会话ID: ${orderId}`)
        }
    }
}

// 通过 API 获取订单详情并更新数据库
export async function fetchAndUpdateOrderDetail(
    client: GoofishClient,
    orderId: string
): Promise<OrderDetailData | null> {
    try {
        const detail = await client.fetchOrderDetail(orderId)
        if (!detail?.data) {
            logger.warn(`订单详情响应为空: ${orderId}`)
            return null
        }

        const data = detail.data

        // 解析订单信息
        const orderInfoVO = data.components?.find((c: any) => c.render === 'orderInfoVO')?.data
        const itemInfo = orderInfoVO?.itemInfo
        const orderInfoList = orderInfoVO?.orderInfoList || []

        // 提取字段
        const buyerNickname = orderInfoList.find((i: any) => i.title === '买家昵称')?.value
        const orderTime = orderInfoList.find((i: any) => i.title === '下单时间')?.value
        const payTime = orderInfoList.find((i: any) => i.title === '付款时间')?.value
        const shipTime = orderInfoList.find((i: any) => i.title === '发货时间')?.value
        const completeTime = orderInfoList.find((i: any) => i.title === '成交时间')?.value

        const itemIdStr = data.itemId ? String(data.itemId) : undefined
        const buyerUserIdStr = data.peerUserId ? String(data.peerUserId) : undefined
        const status = data.status
        const statusText = data.utArgs?.orderMainTitle || ORDER_STATUS_TEXT[status] || '未知状态'

        // 记录订单状态信息以便调试
        logger.info(`[订单详情] 订单ID=${orderId}, 状态码=${status}, 状态文本=${statusText}, 旧状态=${getOrderById(orderId)?.status || '无'}`)

        const itemTitle = itemInfo?.title
        const itemPicUrl = itemInfo?.itemMainPictCdnUrl
        const price = itemInfo?.price || orderInfoVO?.priceInfo?.amount?.value
        
        // 尝试从多个位置提取规格信息
        let skuText: string | null = null
        
        // 1. 从 itemInfo 中提取
        skuText = itemInfo?.skuInfo || itemInfo?.skuText || itemInfo?.sku || itemInfo?.skuName || null
        
        // 如果提取到的规格包含冒号（如"测试:这是一个测试"），只取冒号后的部分
        if (skuText && skuText.includes(':')) {
            const parts = skuText.split(':')
            skuText = parts[parts.length - 1].trim()  // 取最后一部分
        }
        
        // 2. 如果 itemInfo 中没有，尝试从 orderInfoList 中查找
        if (!skuText) {
            const skuItem = orderInfoList.find((i: any) => 
                i.title === '规格' || 
                i.title === '商品规格' || 
                i.title === 'SKU' ||
                i.title?.includes('规格')
            )
            skuText = skuItem?.value || null
            // 如果提取到的规格包含冒号，只取冒号后的部分
            if (skuText && skuText.includes(':')) {
                const parts = skuText.split(':')
                skuText = parts[parts.length - 1].trim()
            }
        }
        
        // 3. 如果还没有，尝试从 itemInfo 的其他字段中提取
        if (!skuText && itemInfo) {
            // 尝试从 itemInfo 的所有字段中查找可能包含规格信息的字段
            for (const key in itemInfo) {
                const value = itemInfo[key]
                if (typeof value === 'string' && value.trim() && 
                    (key.toLowerCase().includes('sku') || 
                     key.toLowerCase().includes('spec') ||
                     key.toLowerCase().includes('规格'))) {
                    skuText = value.trim()
                    break
                }
            }
        }
        
        // 4. 如果还是没有，尝试从商品标题中提取（作为最后的手段）
        if (!skuText && itemTitle) {
            // 从标题中提取可能的规格信息（如 "100次"、"200次"）
            const skuMatch = itemTitle.match(/(\d+[次个张份枚条支瓶盒包袋套件台部只GBMBmlgkg元]+)/)
            if (skuMatch) {
                skuText = skuMatch[1]
            }
        }

        // 记录详细的规格提取日志
        if (skuText) {
            logger.info(`订单详情: ${orderId}, 状态=${statusText}, 商品=${itemTitle}, 规格=${skuText}`)
        } else {
            logger.warn(`订单详情: ${orderId}, 状态=${statusText}, 商品=${itemTitle}, 未找到规格信息`)
            // 记录 itemInfo 的结构以便调试
            if (itemInfo) {
                logger.debug(`itemInfo 字段: ${Object.keys(itemInfo).join(', ')}`)
            }
        }

        // 获取旧订单状态
        const oldOrder = getOrderById(orderId)
        const oldStatus = oldOrder?.status

        upsertOrder({
            orderId,
            accountId: client.accountId,
            itemId: itemIdStr,
            itemTitle,
            itemPicUrl,
            price,
            skuText,
            buyerUserId: buyerUserIdStr,
            buyerNickname,
            status,
            statusText,
            orderTime,
            payTime,
            shipTime,
            completeTime
        })

        // 检查是否需要触发自动发货
        // 注意：订单详情API返回的status可能不是标准的OrderStatus枚举值
        // 需要根据statusText来判断状态
        const isPendingShipment = status === OrderStatus.PENDING_SHIPMENT || 
                                  statusText?.includes('待发货') || 
                                  statusText?.includes('请尽快发货') ||
                                  statusText?.includes('买家已付款')
        const isPendingReceipt = status === OrderStatus.PENDING_RECEIPT || 
                                 statusText?.includes('待收货')
        
        if (isPendingShipment && oldStatus !== OrderStatus.PENDING_SHIPMENT) {
            // 订单变为待发货状态，触发自动发货
            logger.info(`[订单状态变更] 订单 ${orderId} 变为待发货状态，触发自动发货`)
            await triggerAutoSell(client, orderId, itemIdStr, buyerUserIdStr, 'paid')
        } else if (isPendingReceipt && oldStatus !== OrderStatus.PENDING_RECEIPT) {
            // 订单变为待收货状态，触发确认收货后的自动发货
            logger.info(`[订单状态变更] 订单 ${orderId} 变为待收货状态，触发自动发货`)
            await triggerAutoSell(client, orderId, itemIdStr, buyerUserIdStr, 'confirmed')
        } else {
            logger.debug(`[订单状态] 订单 ${orderId} 状态未变更或不需要触发自动发货: status=${status}, statusText=${statusText}, oldStatus=${oldStatus}`)
        }

        return data
    } catch (e) {
        logger.error(`获取订单详情失败: ${orderId} - ${e}`)
        return null
    }
}

/**
 * 触发自动发货（通过流程引擎）
 */
async function triggerAutoSell(
    client: GoofishClient,
    orderId: string,
    itemId: string | undefined,
    buyerUserId: string | undefined,
    triggerOn: 'paid' | 'confirmed'
): Promise<void> {
    try {
        // 从订单记录获取 chatId 和 skuText
        const order = getOrderById(orderId)
        const chatId = order?.chatId || undefined
        const skuText = order?.skuText || undefined

        logger.info(`[触发自动发货] 订单 ${orderId}, 商品ID=${itemId}, 规格="${skuText || '无'}", 触发时机=${triggerOn}`)

        // 获取匹配的规则
        const rules = getEnabledAutoSellRules(client.accountId, itemId)
        logger.info(`[触发自动发货] 找到 ${rules.length} 个候选规则`)

        // 匹配规则：触发时机匹配，且规格匹配（如果规则指定了规格）
        const matchedRule = rules.find(r => {
            if (r.triggerOn !== triggerOn) {
                logger.debug(`[触发自动发货] 规则 "${r.name}" 触发时机不匹配: ${r.triggerOn} !== ${triggerOn}`)
                return false
            }
            
            // 如果规则指定了规格，则订单规格必须匹配
            if (r.skuText) {
                const ruleSkuText = r.skuText.trim()
                const orderSkuText = (skuText || '').trim()
                
                if (orderSkuText !== ruleSkuText) {
                    logger.debug(`[触发自动发货] 规则 "${r.name}" 规格不匹配: 规则规格="${ruleSkuText}" !== 订单规格="${orderSkuText}"`)
                    return false
                }
                logger.info(`[触发自动发货] 规则 "${r.name}" 规格匹配成功: "${ruleSkuText}"`)
            } else {
                logger.debug(`[触发自动发货] 规则 "${r.name}" 未指定规格，匹配所有规格`)
            }
            
            return true
        })

        if (!matchedRule) {
            logger.warn(`[触发自动发货] 订单 ${orderId} 无匹配的自动发货规则。候选规则: ${rules.map(r => `"${r.name}"(规格:${r.skuText || '不限'},触发:${r.triggerOn})`).join(', ')}`)
            return
        }

        logger.info(`[触发自动发货] 订单 ${orderId} 匹配到规则: "${matchedRule.name}" (ID: ${matchedRule.id})`)

        // 启动流程执行
        const result = await startWorkflowExecution(matchedRule.workflowId, {
            orderId,
            accountId: client.accountId,
            itemId,
            ruleId: matchedRule.id,
            client,
            buyerUserId,
            chatId,
            skuText
        })

        if (!result.success) {
            if (result.error !== '流程已在执行中') {
                logger.warn(`[触发自动发货] 流程启动失败: ${orderId} - ${result.error}`)
            }
        } else {
            logger.info(`[触发自动发货] 流程已启动: ${orderId}, 规则: ${matchedRule.name}`)
        }
    } catch (e) {
        logger.error(`[触发自动发货] 异常: ${orderId} - ${e}`)
    }
}
