# 账号管理 API

## 获取所有账号

```http
GET /api/accounts
```

**响应**:
```json
{
  "accounts": [
    {
      "id": "用户ID",
      "nickname": "昵称",
      "avatar": "头像URL",
      "remark": "备注",
      "enabled": true,
      "cookies": "xxx...",
      "status": "connected"
    }
  ]
}
```

## 获取单个账号

```http
GET /api/accounts/:id
```

## 添加/更新账号

```http
POST /api/accounts
```

**请求体**:
```json
{
  "cookies": "闲鱼Cookie字符串",
  "remark": "备注",
  "enabled": true
}
```

::: tip
Cookie 必须包含 `unb` 字段，系统会自动提取用户 ID 并获取用户信息。
:::

## 删除账号

```http
DELETE /api/accounts/:id
```

## 启用/禁用账号

```http
PATCH /api/accounts/:id/enabled
```

**请求体**:
```json
{
  "enabled": true
}
```

## 启动账号

```http
POST /api/accounts/:id/start
```

启动 WebSocket 连接。

## 停止账号

```http
POST /api/accounts/:id/stop
```

断开 WebSocket 连接。

## 重启账号

```http
POST /api/accounts/:id/restart
```

## 刷新用户信息

```http
POST /api/accounts/:id/refresh-info
```

重新获取用户昵称和头像。
