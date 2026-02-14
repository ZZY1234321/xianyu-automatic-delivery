# 功能概览

GoofishCBot 前端基于 Angular 21 构建，提供完整的管理界面。

## 页面列表

| 页面 | 路由 | 功能 |
|------|------|------|
| [仪表盘](/guide/features/dashboard) | `/dashboard` | 系统概览、账号状态监控 |
| [账号管理](/guide/features/accounts) | `/accounts` | 闲鱼账号增删改查、启停控制 |
| [商品管理](/guide/features/goods) | `/goods` | 查看账号下的商品列表 |
| [订单管理](/guide/features/orders) | `/orders` | 订单列表、发货操作 |
| [会话管理](/guide/features/conversations) | `/conversations` | 实时消息、对话历史 |
| [自动回复](/guide/features/autoreply) | `/autoreply` | 回复规则配置、AI 设置 |
| [自动发货](/guide/features/autosell) | `/autosell` | 发货规则、库存管理 |
| [发货流程](/guide/features/workflow) | `/workflow` | 可视化流程编辑器 |
| [系统日志](/guide/features/logs) | `/logs` | 实时日志、历史日志查看 |
| [系统设置](/guide/features/settings) | `/setting` | 主题切换、AI 配置 |

## 技术特性

- 响应式布局，支持桌面端和移动端
- WebSocket 实时数据推送
- 基于 Signal 的状态管理
- DaisyUI 组件库 + Tailwind CSS
