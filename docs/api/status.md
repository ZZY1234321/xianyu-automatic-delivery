# 系统状态 API

## 健康检查

```http
GET /api/status/health
```

**响应**:
```json
{
  "status": "ok",
  "timestamp": 1703520000000
}
```

## 获取系统状态

```http
GET /api/status/status
```

**响应**:
```json
{
  "clients": {
    "账号ID1": {
      "connected": true,
      "lastHeartbeat": 1703520000000
    },
    "账号ID2": {
      "connected": false,
      "lastHeartbeat": null
    }
  },
  "activeCount": 1,
  "messageCount": 1000
}
```

**字段说明**:
| 字段 | 说明 |
|------|------|
| clients | 各账号连接状态 |
| activeCount | 当前在线账号数 |
| messageCount | 累计消息数 |
