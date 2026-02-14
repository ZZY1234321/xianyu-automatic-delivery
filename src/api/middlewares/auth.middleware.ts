/**
 * 认证中间件
 */

import type { Context, Next } from 'hono'
import { verifyToken } from '../routes/auth.route.js'

export async function authMiddleware(c: Context, next: Next) {
    const token = c.req.header('Authorization')?.replace('Bearer ', '')

    if (!token || !verifyToken(token)) {
        return c.json({ error: '未登录或登录已过期' }, 401)
    }

    await next()
}
