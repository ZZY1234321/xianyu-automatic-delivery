# 自动发货 API

## 规则管理

### 获取所有规则

```http
GET /api/autosell
```

**响应**:
```json
{
  "rules": [
    {
      "id": 1,
      "name": "规则名称",
      "enabled": true,
      "deliveryType": "stock",
      "stockCount": 100,
      "usedCount": 10
    }
  ]
}
```

### 获取单个规则

```http
GET /api/autosell/:id
```

### 创建规则

```http
POST /api/autosell
```

### 更新规则

```http
PUT /api/autosell/:id
```

### 删除规则

```http
DELETE /api/autosell/:id
```

### 切换规则状态

```http
POST /api/autosell/:id/toggle
```

## 库存管理

### 获取规则库存

```http
GET /api/autosell/:id/stock?includeUsed=false
```

**参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| includeUsed | boolean | 是否包含已使用的库存 |

**响应**:
```json
{
  "items": [
    {
      "id": 1,
      "content": "卡密内容",
      "used": false,
      "usedAt": null
    }
  ],
  "stats": {
    "total": 100,
    "used": 10
  }
}
```

### 添加库存

```http
POST /api/autosell/:id/stock
```

**请求体**:
```json
{
  "contents": ["卡密1", "卡密2", "卡密3"]
}
```

### 清空库存

```http
DELETE /api/autosell/:id/stock?onlyUsed=false
```

**参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| onlyUsed | boolean | 仅清空已使用的库存 |

## 发货记录

### 获取发货记录

```http
GET /api/autosell/logs?ruleId=1&orderId=xxx&accountId=xxx&limit=50&offset=0
```

**参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| ruleId | number | 筛选规则 |
| orderId | string | 筛选订单 |
| accountId | string | 筛选账号 |
| limit | number | 每页数量 |
| offset | number | 偏移量 |
