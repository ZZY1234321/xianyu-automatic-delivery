# 项目结构

```
goofishcbot/
├── src/                      # 后端源码
│   ├── api/                  # HTTP API
│   │   ├── routes/           # 路由定义
│   │   ├── middlewares/      # 中间件
│   │   ├── server.ts         # Hono 服务器
│   │   ├── conversation.store.ts
│   │   └── message.store.ts
│   ├── services/             # 业务服务层
│   │   ├── ai.service.ts     # AI 对话服务
│   │   ├── autoreply.service.ts
│   │   ├── autosell.service.ts
│   │   ├── conversation.service.ts
│   │   ├── goods.service.ts
│   │   ├── message.service.ts
│   │   ├── order.service.ts
│   │   └── workflow.service.ts
│   ├── db/                   # 数据库层
│   │   ├── connection.ts     # SQLite 连接
│   │   ├── migrations.ts     # 数据库迁移
│   │   └── *.repository.ts   # 数据仓库
│   ├── websocket/            # WebSocket 客户端
│   │   ├── client.manager.ts # 客户端管理器
│   │   ├── client.ts         # 单个客户端
│   │   ├── message.parser.ts # 消息解析
│   │   ├── message.receiver.ts
│   │   └── message.sender.ts
│   ├── ai-tools/             # AI 工具函数
│   ├── core/                 # 核心模块
│   │   ├── constants.ts
│   │   ├── cookies.manager.ts
│   │   ├── event-emitter.ts
│   │   └── logger.ts
│   ├── types/                # TypeScript 类型定义
│   ├── utils/                # 工具函数
│   └── index.ts              # 入口文件
│
├── frontend/                 # 前端源码 (Angular)
│   └── src/
│       └── app/
│           ├── components/   # 公共组件
│           │   ├── code-editor/
│           │   ├── sidebar/
│           │   ├── stats-card/
│           │   └── topbar/
│           ├── views/        # 页面视图
│           │   ├── system-dashboard/    # 仪表盘
│           │   ├── goofish-accounts/    # 账号管理
│           │   ├── goofish-goods/       # 商品管理
│           │   ├── goofish-orders/      # 订单管理
│           │   ├── goofish-conversations/ # 会话管理
│           │   ├── bot-autoreply/       # 自动回复
│           │   ├── bot-autosell/        # 自动发货
│           │   ├── bot-workflow/        # 发货流程
│           │   ├── system-logs/         # 系统日志
│           │   └── system-setting/      # 系统设置
│           ├── layouts/      # 布局组件
│           ├── core/         # 核心模块
│           │   ├── services/ # 服务
│           │   ├── types/    # 类型
│           │   └── utils/    # 工具
│           └── shared/       # 共享模块
│
├── data/                     # SQLite 数据库文件
├── logs/                     # 日志文件
├── public/                   # 前端构建输出
├── docs/                     # VitePress 文档
└── package.json
```

## 后端架构

采用分层架构：

- **API 层** (`src/api/`): HTTP 路由和中间件
- **服务层** (`src/services/`): 业务逻辑
- **数据层** (`src/db/`): 数据库操作
- **WebSocket 层** (`src/websocket/`): 闲鱼消息通道

## 前端架构

基于 Angular 21 的单页应用：

- **视图层** (`views/`): 各功能页面
- **组件层** (`components/`): 可复用 UI 组件
- **服务层** (`core/services/`): API 调用和状态管理
- **布局层** (`layouts/`): 响应式布局（桌面/移动端）
