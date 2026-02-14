# 快速开始

## 环境要求

- Node.js >= 18
- npm >= 9

## 安装

```bash
# 克隆项目
git clone <repository-url>
cd goofishcbot

# 安装依赖
npm install

# 安装前端依赖
cd frontend && npm install && cd ..
```

## 开发模式

```bash
# 启动开发服务器（自动构建前端 + 热重载后端）
npm run dev
```

## 生产部署

```bash
# 构建并启动
npm run server

# 或使用 PM2 管理
npm run pm2:start
npm run pm2:stop
npm run pm2:restart
npm run pm2:logs
```

## 访问

启动后访问 `http://localhost:3000` 进入管理界面。

## 配置账号

1. 进入「账号管理」页面
2. 点击「添加账号」
3. 粘贴闲鱼 Cookie（需包含 `unb` 字段）
4. 启用账号开始自动连接

## 配置 AI 回复

1. 进入「自动回复」页面
2. 配置 AI 设置（API 地址、密钥、模型）
3. 创建 AI 类型的回复规则
4. 自定义系统提示词
