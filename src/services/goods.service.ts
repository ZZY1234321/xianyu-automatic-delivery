/**
 * 商品服务
 */

import { API_ENDPOINTS, API_METHODS, WS_CONFIG } from '../core/constants.js'
import { CookiesManager } from '../core/cookies.manager.js'
import { generateSign } from '../utils/crypto.js'
import { createLogger } from '../core/logger.js'
import { getOrders } from '../db/index.js'
import type { GoodsItem, GoodsListResult, GoodsDetail, GoodsSkuOption } from '../types/index.js'

const logger = createLogger('Svc:Goods')

// 临时：打印商品列表详情
function logGoodsItems(items: GoodsItem[]) {
    items.forEach(item => {
        logger.info(`商品: ID=${item.id}, 名称=${item.title}`)
    })
}

/**
 * 获取商品列表
 */
export async function fetchGoodsList(
    accountId: string,
    userId: string,
    page = 1,
    pageSize = 20
): Promise<GoodsListResult> {
    try {
        const cookiesStr = CookiesManager.getCookies(accountId)
        if (!cookiesStr) {
            logger.error(`[${accountId}] 无法获取 cookies`)
            return { items: [], nextPage: false, totalCount: 0 }
        }

        const timestamp = Date.now().toString()
        const dataVal = JSON.stringify({ userId, pageNumber: page, pageSize })
        const h5Token = CookiesManager.getH5Token(accountId)
        const sign = generateSign(timestamp, h5Token, dataVal)

        const params = new URLSearchParams({
            jsv: '2.7.2',
            appKey: WS_CONFIG.SIGN_APP_KEY,
            t: timestamp,
            sign,
            v: '1.0',
            type: 'originaljson',
            accountSite: 'xianyu',
            dataType: 'json',
            timeout: '20000',
            api: 'mtop.idle.web.xyh.item.list'
        })

        const res = await fetch(`${API_ENDPOINTS.ITEM_LIST}?${params}`, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/x-www-form-urlencoded',
                'origin': 'https://www.goofish.com',
                'referer': 'https://www.goofish.com/',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'cookie': cookiesStr
            },
            body: `data=${encodeURIComponent(dataVal)}`
        })

        CookiesManager.handleResponseCookies(accountId, res)

        const resJson = await res.json()

        if (resJson?.ret?.some((r: string) => r.includes('SUCCESS'))) {
            const data = resJson.data || {}
            const cardList = data.cardList || []

            const items: GoodsItem[] = cardList.map((card: any) => {
                const cardData = card.cardData || {}
                const detailParams = cardData.detailParams || {}
                const picInfo = cardData.picInfo || {}
                const priceInfo = cardData.priceInfo || {}
                
                // 尝试从商品列表数据中提取规格信息
                // 检查商品是否有规格（通过 isSKU 字段）
                // 注意：商品列表API只返回 isSKU 标识，不返回具体的规格列表
                const hasSku = detailParams.isSKU === '1' || detailParams.isSKU === 1
                
                const skuOptions: GoodsSkuOption[] = []
                // 如果商品列表API返回了规格信息，提取它（通常不会返回）
                if (cardData.skuList || detailParams.skuList || cardData.skuInfo) {
                    const skuList = cardData.skuList || detailParams.skuList || cardData.skuInfo || []
                    if (Array.isArray(skuList)) {
                        skuList.forEach((sku: any) => {
                            const skuName = sku.name || sku.value || sku.text || ''
                            if (skuName) {
                                skuOptions.push({
                                    name: skuName,
                                    value: skuName,
                                    price: sku.price || undefined
                                })
                            }
                    })
                }
                }
                
                // 如果商品有规格但列表API没有返回规格列表，尝试从标题中提取
                // 这是备选方案，因为商品详情API可能不存在
                if (hasSku && skuOptions.length === 0) {
                    const title = cardData.title || detailParams.title || ''
                    // 从标题中提取规格信息（如 "100次"、"200次"）
                    const skuPatterns = [
                        /(\d+[次个张份枚条支瓶盒包袋套件台部只]+)/g,  // 中文单位
                        /(\d+[GBMB]+)/gi,  // 存储单位
                        /(\d+[mlgkg]+)/gi,  // 容量/重量单位
                        /(\d+元)/g,  // 价格规格
                        /([一二三四五六七八九十百千万]+[次个张份枚条支瓶盒包袋套件台部只]+)/g  // 中文数字+单位
                    ]
                    
                    skuPatterns.forEach(pattern => {
                        let match
                        while ((match = pattern.exec(title)) !== null) {
                            const value = match[1].trim()
                            if (value && !skuOptions.find(s => s.value === value)) {
                                skuOptions.push({
                                    name: value,
                                    value: value
                                })
                            }
                        }
                    })
                }

                return {
                    id: cardData.id || detailParams.itemId || '',
                    title: cardData.title || detailParams.title || '',
                    price: priceInfo.price || detailParams.soldPrice || '',
                    picUrl: picInfo.picUrl || detailParams.picUrl || '',
                    picWidth: picInfo.width || parseInt(detailParams.picWidth) || 0,
                    picHeight: picInfo.height || parseInt(detailParams.picHeight) || 0,
                    categoryId: cardData.categoryId || 0,
                    itemStatus: cardData.itemStatus ?? 0,
                    hasVideo: picInfo.hasVideo || false,
                    soldPrice: detailParams.soldPrice,
                    postInfo: detailParams.postInfo,
                    skuOptions: skuOptions.length > 0 ? skuOptions : undefined
                }
            })

            logger.info(`[${accountId}] 获取商品列表成功，共 ${items.length} 件商品`)
            logGoodsItems(items)
            return {
                items,
                nextPage: data.nextPage || false,
                totalCount: data.totalCount || items.length
            }
        }

        logger.warn(`[${accountId}] 获取商品列表失败: ${JSON.stringify(resJson?.ret)}`)
        return { items: [], nextPage: false, totalCount: 0 }
    } catch (e) {
        logger.error(`[${accountId}] 获取商品列表异常: ${e}`)
        return { items: [], nextPage: false, totalCount: 0 }
    }
}

/**
 * 从商品链接中解析出商品ID
 * 支持格式：
 * - https://www.goofish.com/item?id=123456
 * - https://m.goofish.com/item?id=123456
 * - https://h5.m.goofish.com/item?id=123456
 */
export function parseItemIdFromUrl(url: string): string | null {
    try {
        const urlObj = new URL(url)
        const itemId = urlObj.searchParams.get('id')
        return itemId
    } catch (e) {
        // 如果不是完整URL，尝试直接匹配
        const match = url.match(/[?&]id=(\d+)/)
        return match ? match[1] : null
    }
}

/**
 * 获取商品列表API的原始响应（用于调试）
 */
export async function fetchGoodsListRaw(
    accountId: string,
    userId: string,
    page = 1,
    pageSize = 20
): Promise<any> {
    try {
        const cookiesStr = CookiesManager.getCookies(accountId)
        if (!cookiesStr) {
            return { error: '未找到账号Cookie' }
        }

        const timestamp = Date.now().toString()
        const dataVal = JSON.stringify({ userId, pageNumber: page, pageSize })
        const h5Token = CookiesManager.getH5Token(accountId)
        const sign = generateSign(timestamp, h5Token, dataVal)

        const params = new URLSearchParams({
            jsv: '2.7.2',
            appKey: WS_CONFIG.SIGN_APP_KEY,
            t: timestamp,
            sign,
            v: '1.0',
            type: 'originaljson',
            accountSite: 'xianyu',
            dataType: 'json',
            timeout: '20000',
            api: 'mtop.idle.web.xyh.item.list'
        })

        const res = await fetch(`${API_ENDPOINTS.ITEM_LIST}?${params}`, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/x-www-form-urlencoded',
                'origin': 'https://www.goofish.com',
                'referer': 'https://www.goofish.com/',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'cookie': cookiesStr
            },
            body: `data=${encodeURIComponent(dataVal)}`
        })

        CookiesManager.handleResponseCookies(accountId, res)
        const resJson = await res.json()
        
        return {
            accountId,
            userId,
            page,
            pageSize,
            apiUrl: `${API_ENDPOINTS.ITEM_LIST}?${params}`,
            requestData: { userId, pageNumber: page, pageSize },
            response: resJson,
            responseData: resJson?.data || null,
            responseDataKeys: resJson?.data ? Object.keys(resJson.data) : [],
            cardList: resJson?.data?.cardList || [],
            // 提取第一个商品的完整结构作为示例
            firstCardStructure: resJson?.data?.cardList?.[0] || null,
            firstCardKeys: resJson?.data?.cardList?.[0] ? Object.keys(resJson.data.cardList[0]) : [],
            firstCardDataKeys: resJson?.data?.cardList?.[0]?.cardData ? Object.keys(resJson.data.cardList[0].cardData) : [],
            firstCardDetailParamsKeys: resJson?.data?.cardList?.[0]?.cardData?.detailParams ? Object.keys(resJson.data.cardList[0].cardData.detailParams) : []
        }
    } catch (e: any) {
        return { 
            error: '获取原始响应失败', 
            message: e?.message || String(e),
            stack: e?.stack 
        }
    }
}

/**
 * 获取商品详情API的原始响应（用于调试）
 */
export async function fetchGoodsDetailRaw(
    accountId: string,
    itemIdOrUrl: string
): Promise<any> {
    try {
        // 解析商品ID
        let itemId = itemIdOrUrl
        if (itemIdOrUrl.includes('goofish.com') || itemIdOrUrl.includes('?')) {
            const parsedId = parseItemIdFromUrl(itemIdOrUrl)
            if (!parsedId) {
                return { error: '无法从链接中解析商品ID' }
            }
            itemId = parsedId
        }

        const cookiesStr = CookiesManager.getCookies(accountId)
        if (!cookiesStr) {
            return { error: '未找到账号Cookie' }
        }

        const timestamp = Date.now().toString()
        const dataVal = JSON.stringify({ itemId })
        const h5Token = CookiesManager.getH5Token(accountId)
        const sign = generateSign(timestamp, h5Token, dataVal)

        const params = new URLSearchParams({
            jsv: '2.7.2',
            appKey: WS_CONFIG.SIGN_APP_KEY,
            t: timestamp,
            sign,
            v: '1.0',
            type: 'originaljson',
            accountSite: 'xianyu',
            dataType: 'json',
            timeout: '20000',
            api: API_METHODS.ITEM_DETAIL
        })

        const res = await fetch(`${API_ENDPOINTS.ITEM_DETAIL}?${params}`, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/x-www-form-urlencoded',
                'origin': 'https://www.goofish.com',
                'referer': 'https://www.goofish.com/',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'cookie': cookiesStr
            },
            body: `data=${encodeURIComponent(dataVal)}`
        })

        CookiesManager.handleResponseCookies(accountId, res)
        const resJson = await res.json()
        
        return {
            itemId,
            apiUrl: `${API_ENDPOINTS.ITEM_DETAIL}?${params}`,
            requestData: { itemId },
            response: resJson,
            responseData: resJson?.data || null,
            responseDataKeys: resJson?.data ? Object.keys(resJson.data) : []
        }
    } catch (e: any) {
        return { 
            error: '获取原始响应失败', 
            message: e?.message || String(e),
            stack: e?.stack 
        }
    }
}

/**
 * 尝试通过商品详情API获取商品信息（包括规格）
 */
async function fetchItemDetailByAPI(
    accountId: string,
    itemId: string
): Promise<{ title?: string; price?: string; picUrl?: string; skuOptions?: GoodsSkuOption[] } | null> {
    try {
        const cookiesStr = CookiesManager.getCookies(accountId)
        if (!cookiesStr) {
            return null
        }

        const timestamp = Date.now().toString()
        const dataVal = JSON.stringify({ itemId })
        const h5Token = CookiesManager.getH5Token(accountId)
        const sign = generateSign(timestamp, h5Token, dataVal)

        const params = new URLSearchParams({
            jsv: '2.7.2',
            appKey: WS_CONFIG.SIGN_APP_KEY,
            t: timestamp,
            sign,
            v: '1.0',
            type: 'originaljson',
            accountSite: 'xianyu',
            dataType: 'json',
            timeout: '20000',
            api: API_METHODS.ITEM_DETAIL
        })

        const res = await fetch(`${API_ENDPOINTS.ITEM_DETAIL}?${params}`, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/x-www-form-urlencoded',
                'origin': 'https://www.goofish.com',
                'referer': 'https://www.goofish.com/',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'cookie': cookiesStr
            },
            body: `data=${encodeURIComponent(dataVal)}`
        })

        CookiesManager.handleResponseCookies(accountId, res)
        const resJson = await res.json()

        if (resJson?.ret?.some((r: string) => r.includes('SUCCESS'))) {
            const data = resJson.data || {}
            const itemDO = data.itemDO || {}
            const skuOptions: GoodsSkuOption[] = []
            
            // 从 itemDO.skuList 或 itemDO.idleItemSkuList 中提取规格信息
            // 这是正确的商品详情API响应格式
            const skuList = itemDO.skuList || itemDO.idleItemSkuList || []
            
            if (Array.isArray(skuList) && skuList.length > 0) {
                skuList.forEach((sku: any) => {
                    // 从 propertyList 中提取规格值
                    const propertyList = sku.propertyList || []
                    if (propertyList.length > 0) {
                        // 提取所有 propertyList 中的 valueText 作为规格值
                        const skuValues: string[] = []
                        propertyList.forEach((prop: any) => {
                            const valueText = prop.valueText || prop.actualValueText || ''
                            if (valueText) {  // 包含所有规格值，包括 "all"
                                skuValues.push(valueText)
                            }
                        })
                        
                        // 如果有规格值，添加到列表
                        if (skuValues.length > 0) {
                            const skuValue = skuValues.join(' / ')  // 多个规格值用 / 连接
                            const skuPrice = sku.priceInCent ? (sku.priceInCent / 100).toString() : (sku.price ? (sku.price / 100).toString() : undefined)
                            
                            // 去重
                            if (!skuOptions.find(s => s.value === skuValue)) {
                                skuOptions.push({
                                    name: skuValue,
                                    value: skuValue,
                                    price: skuPrice
                                })
                            }
                        }
                    }
                })
            }
            
            if (skuOptions.length > 0) {
                logger.info(`[${accountId}] 从商品详情API提取到 ${skuOptions.length} 个规格: ${skuOptions.map(s => s.value).join(', ')}`)
            } else {
                logger.warn(`[${accountId}] 商品详情API未返回规格信息，itemDO字段: ${Object.keys(itemDO).join(', ')}`)
            }

            return {
                title: itemDO.title || '',
                price: itemDO.soldPrice || itemDO.minPrice || '0',
                picUrl: itemDO.imageInfos?.[0]?.url || itemDO.mainPic || '',
                skuOptions: skuOptions.length > 0 ? skuOptions : []
            }
        }
        
        // API调用失败，记录错误信息
        logger.warn(`[${accountId}] 商品详情API调用失败: ${JSON.stringify(resJson?.ret)}`)

        return null
    } catch (e) {
        logger.debug(`[${accountId}] 商品详情API调用失败: ${e}`)
        return null
    }
}

/**
 * 获取商品详情（包括所有规格）
 * 优先尝试通过商品详情API获取，如果失败则从商品列表中查找
 */
export async function fetchGoodsDetail(
    accountId: string,
    itemIdOrUrl: string
): Promise<GoodsDetail | null> {
    try {
        // 解析商品ID
        let itemId = itemIdOrUrl
        if (itemIdOrUrl.includes('goofish.com') || itemIdOrUrl.includes('?')) {
            const parsedId = parseItemIdFromUrl(itemIdOrUrl)
            if (!parsedId) {
                logger.error(`[${accountId}] 无法从链接中解析商品ID: ${itemIdOrUrl}`)
                return null
            }
            itemId = parsedId
        }

        logger.info(`[${accountId}] 获取商品详情: ${itemId}`)

        // 首先尝试通过商品详情API获取
        const apiDetail = await fetchItemDetailByAPI(accountId, itemId)
        if (apiDetail) {
            logger.info(`[${accountId}] 通过商品详情API获取成功: ${itemId}`)
            return {
                id: itemId,
                title: apiDetail.title || `商品ID: ${itemId}`,
                price: apiDetail.price || '0',
                picUrl: apiDetail.picUrl || '',
                skuOptions: apiDetail.skuOptions || [],
                accountId
            }
        }

        // 如果API调用失败，回退到从商品列表中查找
        logger.debug(`[${accountId}] 商品详情API不可用，从商品列表中查找: ${itemId}`)

        // 遍历多页商品列表，查找该商品
        let page = 1
        let item: GoodsItem | undefined = undefined
        const maxPages = 10  // 最多查找10页，避免无限循环

        while (page <= maxPages && !item) {
            const result = await fetchGoodsList(accountId, accountId, page, 100)
            item = result.items.find(i => i.id === itemId)
            
            if (item) {
                break  // 找到了，退出循环
            }
            
            // 如果没有更多页面，停止搜索
            if (!result.nextPage) {
                break
            }
            
            page++
        }

        // 如果还是找不到，返回基本信息（至少返回商品ID）
        if (!item) {
            logger.warn(`[${accountId}] 商品未在商品列表中找到: ${itemId}，返回基本信息`)
            // 返回基本信息，规格信息为空（需要商品详情API支持）
            return {
                id: itemId,
                title: `商品ID: ${itemId}`,
                price: '0',
                picUrl: '',
                skuOptions: [],
                accountId
            }
        }

        // 从商品数据中提取规格信息
        // 优先使用商品列表API返回的规格信息
        const skuOptions: GoodsSkuOption[] = []
        
        // 如果商品列表API返回了规格信息，使用它
        if (item.skuOptions && item.skuOptions.length > 0) {
            skuOptions.push(...item.skuOptions)
            logger.info(`[${accountId}] 从商品列表API获取到 ${skuOptions.length} 个规格`)
        }
        
        // 如果商品列表API没有返回规格，从商品标题中提取规格信息
        // 注意：商品列表API只返回 isSKU 标识，不返回具体的规格列表
        // 需要调用商品详情API才能获取完整的规格信息，但该API可能不存在
        // 因此这里从标题中提取作为备选方案
        // - "100次"、"200次"
        // - "100个"、"200个"
        // - "100张"、"200张"
        // - "100份"、"200份"
        // - "100GB"、"256GB"
        // - "100ml"、"500ml"
        // - "100g"、"500g"
        // - "100元"、"200元"（价格规格）
        const title = item.title || ''
        
        // 匹配数字+单位的格式
        const skuPatterns = [
            /(\d+[次个张份枚条支瓶盒包袋套件台部只]+)/g,  // 中文单位
            /(\d+[GBMB]+)/gi,  // 存储单位
            /(\d+[mlgkg]+)/gi,  // 容量/重量单位
            /(\d+元)/g,  // 价格规格
            /([一二三四五六七八九十百千万]+[次个张份枚条支瓶盒包袋套件台部只]+)/g,  // 中文数字+单位
        ]
        
        skuPatterns.forEach(pattern => {
            const matches = title.match(pattern)
            if (matches) {
                matches.forEach(match => {
                    // 去重
                    if (!skuOptions.find(sku => sku.value === match)) {
                        skuOptions.push({
                            name: match,
                            value: match
                        })
                    }
                })
            }
        })
        
        // 如果标题中包含"规格"、"型号"等关键词，尝试提取后面的内容
        const specPattern = /(?:规格|型号|配置)[:：]?\s*([^\s，,]+)/g
        let specMatch
        while ((specMatch = specPattern.exec(title)) !== null) {
            const specValue = specMatch[1]
            if (specValue && !skuOptions.find(sku => sku.value === specValue)) {
                skuOptions.push({
                    name: specValue,
                    value: specValue
                })
            }
        }

        return {
            id: item.id,
            title: item.title,
            price: item.price,
            picUrl: item.picUrl,
            skuOptions: skuOptions.length > 0 ? skuOptions : [],
            accountId
        }
    } catch (e) {
        logger.error(`[${accountId}] 获取商品详情异常: ${e}`)
        return null
    }
}

/**
 * 从订单数据中提取商品的所有规格选项
 * 这个方法通过分析历史订单来推断商品可能有哪些规格
 */
export async function extractSkuOptionsFromOrders(
    accountId: string,
    itemId: string
): Promise<GoodsSkuOption[]> {
    try {
        // 从数据库查询该商品的所有订单，提取不同的规格
        // 增加limit以获取更多订单
        const orders = getOrders({ accountId, itemId, limit: 500 })

        const skuMap = new Map<string, GoodsSkuOption>()

        orders.forEach(order => {
            if (order.skuText && order.skuText.trim()) {
                const skuValue = order.skuText.trim()
                if (!skuMap.has(skuValue)) {
                    skuMap.set(skuValue, {
                        name: skuValue,
                        value: skuValue,
                        price: order.price || undefined
                    })
                } else {
                    // 如果已存在，但价格不同，更新价格（取较高的价格）
                    const existing = skuMap.get(skuValue)!
                    if (order.price && (!existing.price || parseFloat(order.price) > parseFloat(existing.price || '0'))) {
                        existing.price = order.price
                    }
                }
            }
        })

        const skuCount = skuMap.size
        if (skuCount > 0) {
            logger.info(`[${accountId}] 从 ${orders.length} 个订单中提取到 ${skuCount} 个规格选项: ${Array.from(skuMap.keys()).join(', ')}`)
        } else {
            logger.debug(`[${accountId}] 商品 ${itemId} 共有 ${orders.length} 个订单，但均无规格信息`)
        }
        
        return Array.from(skuMap.values())
    } catch (e) {
        logger.error(`[${accountId}] 从订单提取规格异常: ${e}`)
        return []
    }
}
