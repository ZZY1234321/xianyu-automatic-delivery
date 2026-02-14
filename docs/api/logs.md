# 系统日志 API

日志按日期分目录存储在 `logs/` 目录下。

## 获取日志日期列表

```http
GET /api/logs/dates
```

**响应**:
```json
{
  "dates": ["2024-12-25", "2024-12-24", "2024-12-23"]
}
```

## 获取日志文件列表

```http
GET /api/logs/files/:date
```

**响应**:
```json
{
  "files": [
    {
      "name": "app.log",
      "size": 102400,
      "mtime": 1703520000000
    }
  ]
}
```

## 获取日志内容

```http
GET /api/logs/content/:date/:file?level=ERROR&limit=500
```

**参数**:
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| level | string | ALL | 日志级别筛选 |
| limit | number | 500 | 返回行数限制 |

**level 可选值**: `ALL`, `DEBUG`, `INFO`, `WARN`, `ERROR`

**响应**:
```json
{
  "lines": ["日志行1", "日志行2"],
  "total": 1000,
  "filtered": true
}
```

## 获取当前运行日志

```http
GET /api/logs/current?level=ALL&limit=100
```

获取今天最新的日志文件内容。

**响应**:
```json
{
  "lines": [...],
  "total": 500,
  "file": "app.log",
  "date": "2024-12-25"
}
```
