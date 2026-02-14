# 自动回复 API

## AI 设置

### 获取 AI 设置

```http
GET /api/autoreply/ai
```

**响应**:
```json
{
  "baseUrl": "https://api.openai.com/v1",
  "apiKey": "******",
  "hasApiKey": true,
  "model": "gpt-4o-mini",
  "systemPrompt": "系统提示词"
}
```

### 保存 AI 设置

```http
PUT /api/autoreply/ai
```

**请求体**:
```json
{
  "baseUrl": "API地址",
  "apiKey": "API密钥",
  "model": "模型名称",
  "systemPrompt": "系统提示词"
}
```

### 测试 AI 连接

```http
POST /api/autoreply/ai/test
```

### 获取默认提示词

```http
GET /api/autoreply/ai/default-prompt
```

## 规则管理

### 获取所有规则

```http
GET /api/autoreply
```

**响应**:
```json
{
  "rules": [
    {
      "id": 1,
      "name": "规则名称",
      "enabled": true,
      "priority": 0,
      "matchType": "contains",
      "matchPattern": "匹配内容",
      "replyContent": "回复内容",
      "accountId": null,
      "excludeMatch": false
    }
  ]
}
```

### 获取单个规则

```http
GET /api/autoreply/:id
```

### 创建规则

```http
POST /api/autoreply
```

**请求体**:
```json
{
  "name": "规则名称",
  "enabled": true,
  "priority": 0,
  "matchType": "contains",
  "matchPattern": "匹配内容",
  "replyContent": "回复内容",
  "accountId": null,
  "excludeMatch": false
}
```

**matchType 类型**:
| 值 | 说明 |
|----|------|
| exact | 精确匹配 |
| contains | 包含匹配 |
| regex | 正则匹配 |
| ai | AI 智能回复 |

### 更新规则

```http
PUT /api/autoreply/:id
```

### 删除规则

```http
DELETE /api/autoreply/:id
```

### 切换规则状态

```http
POST /api/autoreply/:id/toggle
```
