/**
 * 安全中间件
 * 使用 Hono 内置 CSRF 中间件限制 API 只能从同源请求
 */

import { csrf } from 'hono/csrf'
import type { Context, Next } from 'hono'

import { createLogger } from '../../core/logger.js'

const logger = createLogger('Api:Security')

// 白名单路径（不需要验证来源）- 仅开发环境使用
const WHITELIST_PATHS: string[] = []

/**
 * 创建安全中间件
 * 使用 Hono CSRF 中间件限制 API 只能从同源请求
 */
export function createSecurityMiddleware() {
    // Hono CSRF 中间件 - 验证同源请求
    const csrfMiddleware = csrf({
        // 动态验证 Origin（同源或本地开发）
        origin: (origin, c) => {
            const host = c.req.header('host')
            if (!host) return false

            // 如果没有 Origin（可能是移动端或直接访问），允许通过
            if (!origin) {
                // 检查是否是移动端请求（Capacitor 应用）
                const userAgent = c.req.header('user-agent') || ''
                if (userAgent.includes('CapacitorHttp') || userAgent.includes('okhttp')) {
                    return true
                }
                // 允许直接访问（浏览器地址栏）
                return true
            }

            // 提取 origin 的 host 部分
            try {
                const originUrl = new URL(origin)
                const hostUrl = new URL(`http://${host}`)
                
                // 同源检查
                if (originUrl.host === host) return true
                
                // 本地开发允许
                if (originUrl.hostname === 'localhost' || originUrl.hostname === '127.0.0.1') {
                    return true
                }
                
                // 允许局域网 IP 访问（移动端）
                if (hostUrl.hostname === originUrl.hostname) {
                    return true
                }
                
                // 检查是否是私有 IP 地址（局域网）
                const isPrivateIP = (ip: string) => {
                    return ip.startsWith('192.168.') || 
                           ip.startsWith('10.') || 
                           ip.startsWith('172.16.') || 
                           ip.startsWith('172.17.') || 
                           ip.startsWith('172.18.') || 
                           ip.startsWith('172.19.') || 
                           ip.startsWith('172.20.') || 
                           ip.startsWith('172.21.') || 
                           ip.startsWith('172.22.') || 
                           ip.startsWith('172.23.') || 
                           ip.startsWith('172.24.') || 
                           ip.startsWith('172.25.') || 
                           ip.startsWith('172.26.') || 
                           ip.startsWith('172.27.') || 
                           ip.startsWith('172.28.') || 
                           ip.startsWith('172.29.') || 
                           ip.startsWith('172.30.') || 
                           ip.startsWith('172.31.')
                }
                
                // 如果 host 和 origin 都是私有 IP，允许访问
                if (isPrivateIP(hostUrl.hostname) && isPrivateIP(originUrl.hostname)) {
                    return true
                }
            } catch {
                // URL 解析失败，允许通过（可能是移动端）
                return true
            }
            return false
        },
        // 允许同源和直接访问（浏览器地址栏）
        secFetchSite: ['same-origin', 'none', 'cross-site']
    })

    return async (c: Context, next: Next) => {
        const path = c.req.path

        // 白名单路径直接放行
        if (WHITELIST_PATHS.some(p => path.startsWith(p))) {
            return next()
        }

        // GET/HEAD/OPTIONS 请求放行（CSRF 只保护修改操作）
        const method = c.req.method
        if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
            return next()
        }

        // 认证相关路由允许跨域（移动端登录）
        if (path.startsWith('/api/auth') || path.startsWith('/auth')) {
            return next()
        }

        // 使用 CSRF 中间件验证
        try {
            return await csrfMiddleware(c, next)
        } catch (e: any) {
            logger.warn(`拒绝非法请求: ${method} ${path} - ${e.message || 'CSRF验证失败'}`)
            return c.json({ error: 'Forbidden' }, 403)
        }
    }
}

// 兼容旧的导出方式
export const securityMiddleware = createSecurityMiddleware()
