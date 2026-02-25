import { serve } from '@hono/node-server'
import { createNodeWebSocket } from '@hono/node-ws'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from '@hono/node-server/serve-static'
import fs from 'fs'
import path from 'path'

import { createLogger } from '../core/logger.js'
import { SERVER_CONFIG, ENV } from '../core/constants.js'
import { securityMiddleware, authMiddleware } from './middlewares/index.js'
import {
    createAccountRoutes,
    createGoodsRoutes,
    createMessageRoutes,
    createStatusRoutes,
    createConversationRoutes,
    createLogsRoutes,
    createAutoReplyRoutes,
    createOrderRoutes,
    createAutoSellRoutes,
    createWorkflowRoutes
} from './routes/index.js'
import { createAuthRoutes } from './routes/auth.route.js'
import { createDevMessageRoutes } from './routes/dev-messages.route.js'
import { createWSPushHandler } from './routes/ws-push.route.js'
import type { ClientManager } from '../websocket/client.manager.js'

const logger = createLogger('Api:Server')
const apiLogger = createLogger('Api:Request')

let clientManager: ClientManager | null = null

export function setClientManager(cm: ClientManager) {
    clientManager = cm
}

function getClientManager() {
    return clientManager
}

// WebSocket 相关
let upgradeWebSocket: ReturnType<typeof createNodeWebSocket>['upgradeWebSocket'] | null = null
let injectWebSocket: ReturnType<typeof createNodeWebSocket>['injectWebSocket'] | null = null

export function createApp() {
    const app = new Hono()

    // 创建 WebSocket 支持
    const nodeWS = createNodeWebSocket({ app })
    upgradeWebSocket = nodeWS.upgradeWebSocket
    injectWebSocket = nodeWS.injectWebSocket

    app.use('*', cors())

    // 认证路由（不需要认证）
    app.route('/api/auth', createAuthRoutes())

    // 安全中间件 - 限制 API 只能从前端请求（排除 WebSocket）
    app.use('/api/*', securityMiddleware)

    // 认证中间件 - 保护 API 路由（排除认证路由和调试路由）
    app.use('/api/*', async (c, next) => {
        // 排除认证相关路由
        if (c.req.path.startsWith('/api/auth')) {
            return next()
        }
        // 排除调试路由（方便开发调试）
        if (c.req.path.includes('/debug/')) {
            return next()
        }
        return authMiddleware(c, next)
    })

    // API 日志 - 只记录非 GET 请求，减少日志量
    app.use('/api/*', async (c, next) => {
        await next()
        if (c.req.method !== 'GET') {
            apiLogger.info(`${c.req.method} ${c.req.path}`)
        }
    })

    // WebSocket 推送端点
    app.get('/ws', upgradeWebSocket(() => createWSPushHandler(getClientManager)))

    // 挂载路由模块
    const statusRoutes = createStatusRoutes(getClientManager)
    app.route('/', statusRoutes)
    app.route('/api', statusRoutes)

    app.route('/api/accounts', createAccountRoutes(getClientManager))
    app.route('/api/goods', createGoodsRoutes(getClientManager))
    app.route('/api/messages', createMessageRoutes(getClientManager))
    app.route('/api/conversations', createConversationRoutes())
    app.route('/api/logs', createLogsRoutes())
    app.route('/api/autoreply', createAutoReplyRoutes())
    app.route('/api/orders', createOrderRoutes(getClientManager))
    app.route('/api/autosell', createAutoSellRoutes())
    app.route('/api/workflows', createWorkflowRoutes())

    // 开发环境才注册调试路由
    if (ENV.IS_DEV) {
        app.route('/api/dev/messages', createDevMessageRoutes())
        logger.info('开发模式：已启用调试路由 /api/dev/messages')
    }

    // 兼容旧的发送消息接口
    app.post('/api/send', async (c) => {
        if (!clientManager) {
            return c.json({ error: 'ClientManager not initialized' }, 500)
        }
        const body = await c.req.json()
        const { accountId, chatId, toUserId, text } = body
        if (!accountId || !chatId || !toUserId || !text) {
            return c.json({ error: 'Missing accountId, chatId, toUserId or text' }, 400)
        }
        const client = clientManager.getClient(accountId)
        if (!client) {
            return c.json({ error: 'Account not connected' }, 400)
        }
        const success = await client.sendMessage(chatId, toUserId, text)
        return c.json({ success })
    })

    // 兼容旧的账号商品接口
    app.get('/api/accounts/:id/goods', async (c) => {
        const id = c.req.param('id')
        const page = c.req.query('page') || '1'
        const url = new URL(c.req.url)
        url.pathname = `/api/goods/account/${id}`
        return c.redirect(url.pathname + `?page=${page}`)
    })

    // 静态文件服务
    setupStaticFiles(app)

    return app
}

function setupStaticFiles(app: Hono) {
    const staticDir = path.join(process.cwd(), SERVER_CONFIG.STATIC_DIR)

    if (fs.existsSync(staticDir)) {
        app.use('/*', serveStatic({ root: `./${SERVER_CONFIG.STATIC_DIR}` }))

        app.get('*', (c) => {
            const indexPath = path.join(staticDir, 'index.html')
            if (fs.existsSync(indexPath)) {
                const html = fs.readFileSync(indexPath, 'utf-8')
                return c.html(html)
            }
            return c.text('Frontend not built', 404)
        })

        logger.info(`静态文件服务已启用: ${staticDir}`)
    } else {
        logger.warn(`静态目录不存在: ${staticDir}，请先构建前端`)
    }
}

export function startServer(port = SERVER_CONFIG.PORT) {
    const app = createApp()

    const server = serve({ fetch: app.fetch, port, hostname: '0.0.0.0' }, () => {
        logger.info(`服务器启动在端口 ${port}`)
        logger.info(`访问 http://localhost:${port} 打开管理面板`)
    })

    // 注入 WebSocket 支持
    if (injectWebSocket) {
        injectWebSocket(server)
        logger.info('WebSocket 推送已启用')
    }
}
