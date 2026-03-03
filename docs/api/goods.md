# 商品管理 API

## 获取商品列表

```http
GET /api/goods?accountId=xxx&page=1
```

**参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| accountId | string | 可选，指定账号 |
| page | number | 页码，默认 1 |

不指定 `accountId` 时返回所有在线账号的商品。

**响应**:
```json
{
  "items": [
    {
      "itemId": "商品ID",
      "title": "商品标题",
      "price": "99.00",
      "picUrl": "图片URL",
      "status": "在售",
      "accountId": "账号ID",
      "accountNickname": "账号昵称"
    }
  ],
  "totalCount": 100
}
```

## 获取单个账号商品

```http
GET /api/goods/account/:id?page=1
```

**响应**:
```json
{
  "items": [...],
  "nextPage": 2,
  "totalCount": 50
}
```

## 获取商品详情

```http
GET /api/goods/detail?itemId=xxx&accountId=xxx
```

**参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| itemId | string | 商品ID或商品链接 |
| accountId | string | 账号ID |

**响应**:
```json
{
  "id": "商品ID",
  "title": "商品标题",
  "price": "99.00",
  "picUrl": "图片URL",
  "accountId": "账号ID",
  "skuOptions": [
    {
      "name": "规格名称",
      "value": "规格值",
      "price": "99.00"
    }
  ]
}
```

商品规格信息从商品详情 API 实时获取。
