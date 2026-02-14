# 会话消息 API

## 获取对话列表

```http
GET /api/conversations?limit=20&offset=0
```

**参数**:
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| limit | number | 20 | 每页数量 |
| offset | number | 0 | 偏移量 |

**响应**:
```json
{
  "conversations": [
    {
      "accountId": "账号ID",
      "chatId": "会话ID",
      "userId": "对方用户ID",
      "nickname": "对方昵称",
      "avatar": "头像",
      "lastMessage": "最后一条消息",
      "lastTime": 1703520000000,
      "unreadCount": 0
    }
  ],
  "total": 100,
  "limit": 20,
  "offset": 0
}
```

## 获取对话详情

```http
GET /api/conversations/:accountId/:chatId?limit=50&beforeId=xxx
```

**参数**:
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| limit | number | 50 | 消息数量 |
| beforeId | number | - | 加载此 ID 之前的消息 |

**响应**:
```json
{
  "accountId": "账号ID",
  "chatId": "会话ID",
  "messages": [
    {
      "id": 1,
      "content": "消息内容",
      "fromMe": false,
      "timestamp": 1703520000000
    }
  ]
}
```

## 标记已读

```http
POST /api/conversations/:accountId/:chatId/read
```

## 发送消息

```http
POST /api/messages/send
```

**请求体**:
```json
{
  "accountId": "账号ID",
  "chatId": "会话ID",
  "toUserId": "接收者ID",
  "text": "消息内容"
}
```

## 获取用户头像

```http
GET /api/conversations/user/:userId/avatar?accountId=xxx
```
