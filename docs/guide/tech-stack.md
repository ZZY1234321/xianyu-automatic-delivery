# 技术栈

## 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | 18+ | 运行时 |
| TypeScript | 5.7 | 类型安全 |
| Hono | 4.11 | Web 框架 |
| better-sqlite3 | 12.5 | SQLite 数据库 |
| OpenAI SDK | 6.15 | AI 对话接口 |
| ws | 8.18 | WebSocket 客户端 |
| PM2 | 6.0 | 进程管理 |

## 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| Angular | 21 | 前端框架 |
| TypeScript | 5.9 | 类型安全 |
| Tailwind CSS | 4.1 | 样式框架 |
| DaisyUI | 5.5 | UI 组件库 |
| Monaco Editor | 0.55 | 代码编辑器 |
| Lucide Angular | 0.562 | 图标库 |
| simple-mind-map | 0.14 | 思维导图（发货流程编辑器） |
| RxJS | 7.8 | 响应式编程 |

## 开发工具

| 工具 | 用途 |
|------|------|
| tsx | TypeScript 执行和热重载 |
| VitePress | 文档站点 |
| Angular CLI | 前端构建 |

## 数据存储

- **SQLite**: 本地数据库，存储账号、规则、订单等数据
- **文件系统**: 日志文件按日期分目录存储

## 通信协议

- **HTTP REST API**: 前后端通信
- **WebSocket**: 
  - 闲鱼消息通道（后端 → 闲鱼服务器）
  - 实时推送（后端 → 前端）
