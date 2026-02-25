# GoofishCBot

[![GitHub Pages](https://img.shields.io/badge/docs-GitHub%20Pages-blue)](https://haiyewei.github.io/GoofishCredentialsBot)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

> ## 📦 框架来源
> 
> 本项目基于 [AutoMangBoSow](https://github.com/CDYBY/AutoMangBoSow) 框架开发

> ## ⚠️ 警告
> **各个功能正在测试中，请勿上线正式环境！除非你能自己修复问题。**

> ## 📜 免责声明
> **本项目仅供学习交流使用，禁止用于任何商业或非法用途。使用本项目所产生的一切后果由使用者自行承担，与项目作者无关。**

闲鱼卡密机器人 - 自动回复、自动发货、订单管理、多账号支持

## ✨ 功能特性

- 🤖 **AI 智能回复** - 集成 OpenAI 兼容 API，智能理解买家意图并自动回复
- 📦 **自动发货** - 虚拟商品自动发货，支持库存管理、API 取货
- 💬 **会话管理** - 实时同步闲鱼消息，多账号会话管理，消息历史记录
- 🛒 **订单管理** - 订单状态同步，一键发货，免拼发货支持
- 👥 **多账号支持** - 多个闲鱼账号同时在线，独立配置，统一管理
- 🔧 **可视化工作流** - 基于思维导图的发货流程编辑器，灵活配置业务逻辑
- 📊 **系统监控** - 实时日志查看，账号状态监控

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 后端 | Node.js + TypeScript + Hono + SQLite |
| 前端 | Angular 21 + Tailwind CSS + DaisyUI |
| 工作流 | simple-mind-map |
| 部署 | PM2 |

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装

```bash
# 克隆项目
git clone https://github.com/haiyewei/GoofishCredentialsBot.git
cd GoofishCredentialsBot

# 安装依赖
npm install
cd frontend && npm install && cd ..
```

### 运行

```bash
# 开发模式
npm run dev

# 生产部署
npm run server

# PM2 部署
npm run pm2:start
npm run pm2:stop
npm run pm2:logs
```

访问 `http://localhost:3000` 进入管理界面。

## 📖 文档

详细文档请访问：[https://haiyewei.github.io/GoofishCredentialsBot](https://haiyewei.github.io/GoofishCredentialsBot)

- [快速开始](https://haiyewei.github.io/GoofishCredentialsBot/guide/getting-started)
- [功能说明](https://haiyewei.github.io/GoofishCredentialsBot/guide/features)
- [API 文档](https://haiyewei.github.io/GoofishCredentialsBot/api/)

## 📁 项目结构

```
├── src/                # 后端源码
│   ├── api/            # HTTP API
│   ├── services/       # 业务服务
│   ├── db/             # 数据库
│   └── websocket/      # WebSocket 客户端
├── frontend/           # 前端源码 (Angular)
├── docs/               # VitePress 文档
└── data/               # SQLite 数据库
```

## 📄 License

[GPL-3.0](LICENSE) © 2025 haiyewei
