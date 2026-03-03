# 闲鱼智能助手

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

> ## 📦 框架来源
> 
> 本项目基于 [AutoMangBoSow](https://github.com/CDYBY/AutoMangBoSow) 框架开发

> ## 📜 免责声明
> **本项目仅供学习交流使用，禁止用于任何商业或非法用途。使用本项目所产生的一切后果由使用者自行承担，与项目作者无关。**

## 📖 简介

闲鱼智能助手是一个功能完善的闲鱼自动化管理工具，支持自动回复、自动发货、订单管理、多账号管理等核心功能。支持 Web 端和 Android 移动端两种使用方式。

## ✨ 功能特性

- 🤖 **AI 智能回复** - 集成 OpenAI 兼容 API（原生支持 OpenClaw），智能理解买家意图并自动回复
- 📦 **自动发货** - 虚拟商品自动发货，支持库存管理、API 取货
- 💬 **会话管理** - 实时同步闲鱼消息，多账号会话管理，消息历史记录
- 🛒 **订单管理** - 订单状态同步，一键发货，免拼发货支持
- 👥 **多账号支持** - 多个闲鱼账号同时在线，独立配置，统一管理
- 🔧 **可视化工作流** - 基于思维导图的发货流程编辑器，灵活配置业务逻辑
- 📊 **系统监控** - 实时日志查看，账号状态监控
- 📱 **移动端支持** - 支持 Android APK 打包，可在手机上直接使用

## 🛠️ 技术栈

### 后端
- **运行时**: Node.js
- **语言**: TypeScript
- **框架**: Hono
- **数据库**: SQLite

### 前端
- **框架**: Angular 21
- **样式**: Tailwind CSS + DaisyUI
- **状态管理**: Angular Signals

### 移动端
- **框架**: Capacitor 6
- **平台**: Android

### 其他
- **工作流引擎**: simple-mind-map
- **进程管理**: PM2

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装与运行

```bash
# 克隆项目
git clone git@github.com:ZZY1234321/xianyu-automatic-delivery.git
cd xianyu-automatic-delivery

# 安装依赖
npm install
cd frontend && npm install && cd ..

# 开发模式运行
npm run dev
```

访问 `http://localhost:3099` 进入管理界面。

## 📦 生产部署

### 电脑端（Web）

```bash
# 构建前端
cd frontend
npm run build:web

# 启动服务
cd ..
npm start
```

### 手机端（Android APK）

1. **前置要求**：安装 [Android Studio](https://developer.android.com/studio)

2. **构建并打包**：
   ```bash
   ./build-android.sh
   # 然后在 Android Studio 中构建 APK
   ```

3. **配置服务器**：安装 APK 后，在应用的"系统设置"中配置后端服务器地址

## ❓ 常见问题

**Q: 电脑端和手机端可以同时使用吗？**  
A: 可以！两者完全独立，可以同时运行。

**Q: 数据是共享的吗？**  
A: 是的，两者连接同一个后端服务器，数据完全共享。

**Q: 手机端需要重新编译才能更新吗？**  
A: 是的，需要重新打包 APK。但功能更新只需要重新构建和打包即可。

**Q: 可以只更新电脑端或只更新手机端吗？**  
A: 可以！两者完全独立构建，互不影响。

## 📁 项目结构

```
AutoMangBoSow/
├── frontend/                    # 前端项目
│   ├── src/                     # 源代码（电脑端和手机端共用）
│   ├── android/                 # Android 项目（Capacitor 生成）
│   ├── dist/                    # 构建输出
│   │   └── frontend/
│   │       └── browser/         # Web 构建输出
│   ├── capacitor.config.ts      # Capacitor 配置
│   └── package.json
├── src/                         # 后端代码
│   ├── api/                     # HTTP API 路由
│   ├── services/                # 业务服务层
│   ├── db/                      # 数据库操作
│   └── websocket/               # WebSocket 客户端
├── public/                      # 静态文件
├── docs/                        # VitePress 文档
├── data/                        # SQLite 数据库文件
├── build-android.sh             # Android 构建脚本
└── package.json
```

## 📄 License

[GPL-3.0](LICENSE) © 2025

## 🙏 致谢

感谢 [AutoMangBoSow](https://github.com/CDYBY/AutoMangBoSow) 项目提供的优秀框架基础。
