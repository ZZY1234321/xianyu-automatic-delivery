import { createLogger, cleanOldLogs, setLogLevel, LogLevel } from './core/logger.js'
import { ClientManager } from './websocket/index.js'
import { initDatabase, closeDatabase } from './db/index.js'
import { startServer, setClientManager, messageStore, conversationStore } from './api/index.js'
import { fetchUserHead, handleOrderMessage, fetchAndUpdateOrderDetail } from './services/index.js'
import { SERVER_CONFIG, LOG_CONFIG } from './core/constants.js'

const logger = createLogger('App')

// 保存 clientManager 引用供异步函数使用
let clientManager: ClientManager

async function main() {
    // 设置日志级别
    setLogLevel(LOG_CONFIG.LEVEL as LogLevel)

    // 清理过期日志
    cleanOldLogs(LOG_CONFIG.RETENTION_DAYS)

    logger.info('启动闲鱼多账号WebSocket客户端...')

    // 初始化数据库
    initDatabase()

    // 创建客户端管理器
    clientManager = new ClientManager(async (accountId, msg) => {
        logger.info(`收到新消息: ${msg.senderName}: ${msg.content}`)
        messageStore.add(msg)
        conversationStore.addIncoming(accountId, msg)

        // 处理订单状态消息
        if (msg.isOrderMessage) {
            if (msg.orderId) {
                logger.info(`[订单消息] 账号=${accountId}, 订单ID=${msg.orderId}, 状态=${msg.orderStatus || msg.content}, 会话ID=${msg.chatId}`)
                handleOrderMessage(accountId, msg.orderId, msg.chatId)
                // 异步获取订单详情
                fetchOrderDetailAsync(accountId, msg.orderId)
            } else {
                logger.warn(`[订单消息] 账号=${accountId}, 消息内容="${msg.content}", 但未提取到订单ID，可能格式异常`)
            }
        }

        // 异步获取用户头像（不阻塞消息处理）
        fetchUserAvatarAsync(accountId, msg.chatId, msg.senderId)
    })

    // 设置 API 客户端管理器引用
    setClientManager(clientManager)

    // 启动 API 服务器
    startServer(SERVER_CONFIG.PORT)

    // 从数据库加载并启动所有启用的账号
    await clientManager.startAll()

    // 优雅退出
    process.on('SIGINT', () => {
        logger.info('收到退出信号，正在断开连接...')
        clientManager.stopAll()
        closeDatabase()
        process.exit(0)
    })

    process.on('SIGTERM', () => {
        logger.info('收到终止信号，正在断开连接...')
        clientManager.stopAll()
        closeDatabase()
        process.exit(0)
    })

    logger.info('系统已启动，等待消息...')
}

main().catch((e) => {
    logger.error(`程序异常: ${e}`)
    process.exit(1)
})

// 异步获取用户头像
async function fetchUserAvatarAsync(accountId: string, chatId: string, userId: string) {
    try {
        const { userHead } = await fetchUserHead(accountId, userId)

        if (userHead?.avatar) {
            conversationStore.updateUserAvatar(accountId, chatId, userHead.avatar)
        }
    } catch (e) {
        logger.debug(`获取用户头像失败: ${e}`)
    }
}

// 异步获取订单详情
async function fetchOrderDetailAsync(accountId: string, orderId: string) {
    try {
        logger.info(`[订单详情] 开始获取订单详情: 订单ID=${orderId}, 账号=${accountId}`)
        const client = clientManager.getClient(accountId)
        if (!client) {
            logger.warn(`[订单详情] 获取失败: 账号 ${accountId} 客户端不存在或未连接`)
            return
        }
        
        const detail = await fetchAndUpdateOrderDetail(client, orderId)
        if (detail) {
            logger.info(`[订单详情] 订单详情获取成功: ${orderId}`)
        } else {
            logger.warn(`[订单详情] 订单详情获取失败或为空: ${orderId}`)
        }
    } catch (e) {
        logger.error(`[订单详情] 获取订单详情异常: ${orderId} - ${e}`)
    }
}
