# 发货流程 API

发货流程用于定义自动发货的处理流程。

## 获取所有流程

```http
GET /api/workflow
```

**响应**:
```json
{
  "workflows": [
    {
      "id": 1,
      "name": "默认流程",
      "description": "流程描述",
      "definition": { ... },
      "isDefault": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## 获取单个流程

```http
GET /api/workflow/:id
```

**响应**:
```json
{
  "workflow": {
    "id": 1,
    "name": "流程名称",
    "description": "描述",
    "definition": {
      "nodes": [...],
      "edges": [...]
    },
    "isDefault": false
  }
}
```

## 创建流程

```http
POST /api/workflow
```

**请求体**:
```json
{
  "name": "流程名称",
  "description": "流程描述",
  "definition": {
    "nodes": [],
    "edges": []
  },
  "isDefault": false
}
```

## 更新流程

```http
PUT /api/workflow/:id
```

**请求体**:
```json
{
  "name": "新名称",
  "description": "新描述",
  "definition": { ... }
}
```

## 删除流程

```http
DELETE /api/workflow/:id
```

::: warning
默认流程不能删除。
:::

## 设为默认流程

```http
POST /api/workflow/:id/default
```

设置后，其他流程的默认状态会被取消。
