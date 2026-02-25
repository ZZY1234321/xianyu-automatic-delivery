/**
 * 自动发货服务
 */

import { createLogger } from '../core/logger.js'
import {
    getEnabledAutoSellRules,
    getStockStats,
    consumeStock,
    addDeliveryLog,
    hasDelivered
} from '../db/index.js'
import type { AutoSellRule, DeliveryResult, ApiConfig } from '../types/index.js'

const logger = createLogger('Svc:AutoSell')

/**
 * 从对象中按路径获取值
 * @param obj 对象
 * @param path 路径，如 "data.key" 或 "data.login_id"
 */
function getValueByPath(obj: any, path: string): any {
    const fields = path.split('.')
    let result = obj
    for (const field of fields) {
        result = result?.[field]
    }
    return result
}

/**
 * 替换模板中的变量
 * @param template 模板字符串，如 "账号:{{data.login_id}} 密码:{{data.key}}"
 * @param data 数据对象
 */
function renderTemplate(template: string, data: any): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
        const value = getValueByPath(data, path.trim())
        return value !== undefined ? String(value) : match
    })
}

/**
 * 通过 API 获取发货内容
 */
async function fetchFromApi(config: ApiConfig, context: Record<string, string>): Promise<string> {
    let url = config.url
    let body = config.body

    // 替换请求中的变量
    for (const [key, value] of Object.entries(context)) {
        const placeholder = `{{${key}}}`
        url = url.replace(new RegExp(placeholder, 'g'), value)
        if (body) {
            body = body.replace(new RegExp(placeholder, 'g'), value)
        }
    }

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...config.headers
    }

    const response = await fetch(url, {
        method: config.method,
        headers,
        body: config.method === 'POST' ? body : undefined
    })

    if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // 优先使用模板渲染（支持多字段）
    if (config.responseTemplate) {
        const rendered = renderTemplate(config.responseTemplate, data)
        // 检查是否有未替换的变量
        if (/\{\{[^}]+\}\}/.test(rendered)) {
            logger.warn(`模板中存在未替换的变量: ${rendered}`)
        }
        return rendered
    }

    // 单字段提取（兼容旧配置）
    if (config.responseField) {
        const result = getValueByPath(data, config.responseField)
        if (result === undefined) {
            throw new Error(`响应中未找到字段: ${config.responseField}`)
        }
        return String(result)
    }

    return typeof data === 'string' ? data : JSON.stringify(data)
}


/**
 * 执行发货
 */
async function executeDelivery(
    rule: AutoSellRule,
    orderId: string,
    context: Record<string, string>
): Promise<DeliveryResult> {
    switch (rule.deliveryType) {
        case 'fixed':
            if (!rule.deliveryContent) {
                return { success: false, error: '未配置发货内容' }
            }
            return { success: true, content: rule.deliveryContent }

        case 'stock': {
            const stock = consumeStock(rule.id, orderId)
            if (!stock) {
                return { success: false, error: '库存不足' }
            }
            return { success: true, content: stock.content }
        }

        case 'api': {
            if (!rule.apiConfig) {
                return { success: false, error: '未配置 API' }
            }
            try {
                const content = await fetchFromApi(rule.apiConfig, context)
                return { success: true, content }
            } catch (e: any) {
                return { success: false, error: e.message }
            }
        }

        default:
            return { success: false, error: '未知发货类型' }
    }
}

/**
 * 自动发货上下文
 */
export interface AutoSellContext {
    orderId: string
    accountId: string
    itemId?: string
    buyerUserId?: string
    chatId?: string
    skuText?: string  // 规格信息，如 "100次"、"200次"
}

/**
 * 处理订单自动发货
 */
export async function processAutoSell(
    accountId: string,
    orderId: string,
    itemId?: string,
    triggerOn: 'paid' | 'confirmed' = 'paid',
    extraContext?: Partial<AutoSellContext>
): Promise<DeliveryResult & { ruleName?: string }> {
    // 检查是否已发货
    if (hasDelivered(orderId)) {
        logger.info(`订单 ${orderId} 已发货，跳过`)
        return { success: false, error: '订单已发货' }
    }

    // 获取匹配的规则
    const rules = getEnabledAutoSellRules(accountId, itemId)
    const skuText = (extraContext?.skuText || '').trim()
    
    logger.info(`[自动发货] 订单 ${orderId}, 商品ID=${itemId}, 规格="${skuText}", 触发时机=${triggerOn}, 候选规则数=${rules.length}`)
    
    // 匹配规则：触发时机匹配，且规格匹配（如果规则指定了规格）
    const matchedRule = rules.find(r => {
        if (r.triggerOn !== triggerOn) {
            logger.debug(`[自动发货] 规则 "${r.name}" 触发时机不匹配: ${r.triggerOn} !== ${triggerOn}`)
            return false
        }
        
        // 如果规则指定了规格，则订单规格必须匹配
        if (r.skuText) {
            const ruleSkuText = r.skuText.trim()
            const orderSkuText = skuText.trim()
            
            // 严格匹配
            if (orderSkuText !== ruleSkuText) {
                logger.debug(`[自动发货] 规则 "${r.name}" 规格不匹配: 规则规格="${ruleSkuText}" !== 订单规格="${orderSkuText}"`)
                return false
            }
            logger.info(`[自动发货] 规则 "${r.name}" 规格匹配成功: "${ruleSkuText}"`)
        } else {
            logger.debug(`[自动发货] 规则 "${r.name}" 未指定规格，匹配所有规格`)
        }
        
        return true
    })

    if (!matchedRule) {
        logger.warn(`[自动发货] 订单 ${orderId} 无匹配的自动发货规则。候选规则: ${rules.map(r => `"${r.name}"(规格:${r.skuText || '不限'},触发:${r.triggerOn})`).join(', ')}`)
        return { success: false, error: '无匹配规则' }
    }
    
    logger.info(`[自动发货] 订单 ${orderId} 匹配到规则: "${matchedRule.name}" (ID: ${matchedRule.id})`)

    // 检查库存类型的库存是否充足
    if (matchedRule.deliveryType === 'stock') {
        const stats = getStockStats(matchedRule.id)
        if (stats.available <= 0) {
            logger.warn(`规则 "${matchedRule.name}" 库存不足`)
            return { success: false, error: '库存不足', ruleName: matchedRule.name }
        }
    }

    // 构建上下文，支持更多变量
    // skuText 已在上面声明，这里直接使用
    // 尝试从规格文本中提取数字（如 "100次" -> "100"）
    const skuNumberMatch = skuText.match(/(\d+)/)
    const skuNumber = skuNumberMatch ? skuNumberMatch[1] : ''

    const context: Record<string, string> = {
        orderId,
        accountId,
        itemId: itemId || '',
        buyerUserId: extraContext?.buyerUserId || '',
        chatId: extraContext?.chatId || '',
        skuText,        // 完整规格文本，如 "100次"
        skuNumber       // 从规格提取的数字，如 "100"
    }
    const result = await executeDelivery(matchedRule, orderId, context)

    // 记录发货日志
    addDeliveryLog({
        ruleId: matchedRule.id,
        orderId,
        accountId,
        deliveryType: matchedRule.deliveryType,
        content: result.content || '',
        status: result.success ? 'success' : 'failed',
        errorMessage: result.error
    })

    if (result.success) {
        logger.info(`订单 ${orderId} 自动发货成功: ${matchedRule.name}`)
    } else {
        logger.error(`订单 ${orderId} 自动发货失败: ${result.error}`)
    }

    return { ...result, ruleName: matchedRule.name }
}

/**
 * 获取规则的库存状态
 */
export function getRuleStockStatus(ruleId: number) {
    return getStockStats(ruleId)
}
