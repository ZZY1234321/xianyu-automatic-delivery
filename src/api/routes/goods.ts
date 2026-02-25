import { Hono } from 'hono'

import { getAllAccounts, getAccount } from '../../db/index.js'
import { fetchGoodsList, fetchGoodsDetail, parseItemIdFromUrl, fetchGoodsDetailRaw, fetchGoodsListRaw } from '../../services/index.js'
import type { ClientManager } from '../../websocket/client.manager.js'

export function createGoodsRoutes(getClientManager: () => ClientManager | null) {
    const router = new Hono()

    // 获取所有账号的商品列表（只获取在线账号）
    router.get('/', async (c) => {
        const accountId = c.req.query('accountId')
        const page = parseInt(c.req.query('page') || '1')

        if (accountId) {
            const account = getAccount(accountId)
            if (!account) {
                return c.json({ error: 'Account not found' }, 404)
            }
            const result = await fetchGoodsList(accountId, accountId, page)

            return c.json({
                items: result.items.map(item => ({ ...item, accountId })),
                nextPage: result.nextPage,
                totalCount: result.totalCount
            })
        }

        // 获取所有账号，但只处理在线的
        const accounts = getAllAccounts()
        const clientManager = getClientManager()
        const allItems: any[] = []
        let totalCount = 0

        for (const account of accounts) {
            // 检查账号是否在线
            const client = clientManager?.getClient(account.id)
            if (!client || !client.isConnected()) {
                continue // 跳过离线账号
            }

            const result = await fetchGoodsList(account.id, account.id, page)

            const itemsWithAccount = result.items.map(item => ({
                ...item,
                accountId: account.id,
                accountNickname: account.nickname
            }))
            allItems.push(...itemsWithAccount)
            totalCount += result.totalCount
        }

        return c.json({
            items: allItems,
            totalCount
        })
    })

    // 获取单个账号的商品列表
    router.get('/account/:id', async (c) => {
        const id = c.req.param('id')
        const page = parseInt(c.req.query('page') || '1')

        const account = getAccount(id)
        if (!account) {
            return c.json({ error: 'Account not found' }, 404)
        }

        const result = await fetchGoodsList(id, id, page)

        return c.json({
            items: result.items,
            nextPage: result.nextPage,
            totalCount: result.totalCount
        })
    })

    // 获取商品详情（包括所有规格）
    router.get('/detail', async (c) => {
        const accountId = c.req.query('accountId')
        const itemIdOrUrl = c.req.query('itemId') || c.req.query('url')
        const debug = c.req.query('debug') === 'true' // 调试模式：返回原始API响应

        if (!accountId || !itemIdOrUrl) {
            return c.json({ error: '缺少 accountId 或 itemId/url 参数' }, 400)
        }

        const account = getAccount(accountId)
        if (!account) {
            return c.json({ error: 'Account not found' }, 404)
        }

        // 如果是调试模式，返回原始API响应
        if (debug) {
            const rawResponse = await fetchGoodsDetailRaw(accountId, itemIdOrUrl)
            return c.json({ 
                success: true, 
                rawResponse,
                message: '这是原始API响应，请查看 rawResponse 字段中的数据结构'
            })
        }

        const detail = await fetchGoodsDetail(accountId, itemIdOrUrl)
        if (!detail) {
            return c.json({ error: '商品未找到或获取失败' }, 404)
        }

        // 直接从商品详情API获取规格，不再从历史订单中提取
        // 如果商品详情API没有返回规格信息，则返回空数组
        if (!detail.skuOptions) {
            detail.skuOptions = []
        }

        return c.json({ success: true, detail })
    })

    // 解析商品链接，提取商品ID
    router.post('/parse-url', async (c) => {
        const body = await c.req.json()
        const { url } = body

        if (!url) {
            return c.json({ error: '缺少 url 参数' }, 400)
        }

        const itemId = parseItemIdFromUrl(url)
        if (!itemId) {
            return c.json({ error: '无法从链接中解析商品ID' }, 400)
        }

        return c.json({ success: true, itemId })
    })

    // 调试端点：输出商品列表API的原始响应（用于查看数据结构）
    router.get('/debug/list', async (c) => {
        const accountId = c.req.query('accountId')
        const page = parseInt(c.req.query('page') || '1')

        if (!accountId) {
            return c.json({ error: '缺少 accountId 参数' }, 400)
        }

        const account = getAccount(accountId)
        if (!account) {
            return c.json({ error: 'Account not found' }, 404)
        }

        const rawResponse = await fetchGoodsListRaw(accountId, accountId, page)
        return c.json({ 
            success: true, 
            rawResponse,
            message: '这是商品列表API的原始响应，请查看 rawResponse 字段中的数据结构，特别是 cardList 中的每个 card 的 cardData 和 detailParams'
        })
    })

    return router
}
