# 订单管理 API

## 获取订单列表

```http
GET /api/orders?accountId=xxx&status=2&limit=50&offset=0
```

**参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| accountId | string | 可选，筛选账号 |
| status | number | 可选，订单状态 |
| limit | number | 每页数量，默认 50 |
| offset | number | 偏移量，默认 0 |

**订单状态**:
| 值 | 说明 |
|----|------|
| 1 | 待付款 |
| 2 | 待发货 |
| 3 | 待收货 |
| 4 | 已完成 |
| 5 | 已关闭 |

**响应**:
```json
{
  "orders": [...],
  "total": 100
}
```

## 获取订单详情

```http
GET /api/orders/:orderId
```

## 刷新订单详情

```http
POST /api/orders/:orderId/refresh
```

从闲鱼服务器获取最新订单信息。

## 通过账号获取订单

```http
POST /api/orders/fetch
```

**请求体**:
```json
{
  "accountId": "账号ID",
  "orderId": "订单ID"
}
```

## 确认发货

```http
POST /api/orders/:orderId/ship
```

仅待发货状态的订单可执行。

## 免拼发货

```http
POST /api/orders/:orderId/freeship
```

虚拟商品免拼发货。

## 删除订单记录

```http
DELETE /api/orders/:orderId
```

仅删除本地记录，不影响闲鱼订单。
