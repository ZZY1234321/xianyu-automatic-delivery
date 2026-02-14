/**
 * 认证路由
 */

import { Hono } from 'hono'
import crypto from 'crypto'

import { db } from '../../db/connection.js'

// 认证配置
const AUTH_CONFIG = {
    username: 'CDYBC',
    password: 'wodemima1'
}

// 生成 token
function generateToken(): string {
    return crypto.randomBytes(32).toString('hex')
}

// 保存 token 到数据库
function saveToken(token: string): void {
    db.prepare('INSERT OR REPLACE INTO auth_tokens (token, created_at) VALUES (?, CURRENT_TIMESTAMP)').run(token)
}

// 验证 token（从数据库查询）
export function verifyToken(token: string): boolean {
    const result = db.prepare('SELECT token FROM auth_tokens WHERE token = ?').get(token)
    return !!result
}

// 删除 token
function deleteToken(token: string): void {
    db.prepare('DELETE FROM auth_tokens WHERE token = ?').run(token)
}

export function createAuthRoutes() {
    const router = new Hono()

    // 登录
    router.post('/login', async (c) => {
        const body = await c.req.json()
        const { username, password } = body

        if (username === AUTH_CONFIG.username && password === AUTH_CONFIG.password) {
            const token = generateToken()
            saveToken(token)
            return c.json({ success: true, token })
        }

        return c.json({ success: false, error: '账号或密码错误' }, 401)
    })

    // 检查登录状态
    router.get('/check', (c) => {
        const token = c.req.header('Authorization')?.replace('Bearer ', '')
        if (token && verifyToken(token)) {
            return c.json({ authenticated: true })
        }
        return c.json({ authenticated: false }, 401)
    })

    // 登出
    router.post('/logout', (c) => {
        const token = c.req.header('Authorization')?.replace('Bearer ', '')
        if (token) {
            deleteToken(token)
        }
        return c.json({ success: true })
    })

    return router
}
