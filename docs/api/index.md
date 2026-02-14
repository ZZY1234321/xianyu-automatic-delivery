# API 概述

闲鱼卡密机器人后端基于 Hono 框架提供 RESTful API。

## 基础信息

- **Base URL**: `http://localhost:3000/api`
- **Content-Type**: `application/json`

## API 模块

| 模块 | 路径前缀 | 说明 |
|------|----------|------|
| [账号管理](/api/accounts) | `/api/accounts` | 闲鱼账号 CRUD、启停控制 |
| [会话消息](/api/conversations) | `/api/conversations` | 对话列表、消息收发 |
| [商品管理](/api/goods) | `/api/goods` | 商品列表查询 |
| [订单管理](/api/orders) | `/api/orders` | 订单查询、发货操作 |
| [自动回复](/api/autoreply) | `/api/autoreply` | 回复规则、AI 设置 |
| [自动发货](/api/autosell) | `/api/autosell` | 发货规则、库存管理 |
| [发货流程](/api/workflow) | `/api/workflow` | 发货流程配置 |
| [系统日志](/api/logs) | `/api/logs` | 日志查询 |
| [系统状态](/api/status) | `/api/status` | 健康检查、运行状态 |

## 响应格式

成功响应：
```json
{
  "success": true,
  "data": { ... }
}
```

错误响应：
```json
{
  "error": "错误信息"
}
```

## HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |
