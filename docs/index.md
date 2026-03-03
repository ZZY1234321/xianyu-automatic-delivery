---
layout: home

hero:
  name: "闲鱼智能助手"
  text: "xianyu-automatic-delivery"
  tagline: 专业的闲鱼自动化管理解决方案 · AI 智能回复 · 自动发货 · 多账号管理
  image:
    src: /logo.svg
    alt: 闲鱼智能助手 Logo
  actions:
    - theme: brand
      text: 🚀 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 📚 查看文档
      link: /guide/features
    - theme: alt
      text: ⭐ GitHub
      link: https://github.com/ZZY1234321/xianyu-automatic-delivery
      target: _blank

features:
  - icon: 🤖
    title: AI 智能回复
    details: 集成 OpenAI 兼容 API，原生支持 OpenClaw。智能理解买家意图，自动生成个性化回复，提升交易转化率
  - icon: 📦
    title: 自动发货
    details: 虚拟商品全自动发货，支持库存管理、API 取货、规格筛选。订单到达即发货，零人工干预
  - icon: 💬
    title: 实时会话管理
    details: WebSocket 实时同步闲鱼消息，多账号会话统一管理，完整消息历史记录，支持关键词搜索
  - icon: 🛒
    title: 订单管理
    details: 订单状态实时同步，一键发货，免拼发货支持。支持商品规格识别，订单筛选和统计
  - icon: 👥
    title: 多账号支持
    details: 多个闲鱼账号同时在线，独立配置，统一管理。每个账号独立的状态监控和日志记录
  - icon: 🔧
    title: 可视化工作流
    details: 基于思维导图的发货流程编辑器，灵活配置复杂业务逻辑。支持条件判断、API 调用、消息发送等节点
  - icon: 📊
    title: 系统监控
    details: 实时日志查看，账号连接状态监控，系统运行状态一目了然。支持日志级别筛选和搜索
  - icon: 📱
    title: 跨平台支持
    details: Web 端和 Android 移动端双平台支持。数据完全同步，随时随地管理你的闲鱼店铺
---

## 🎯 核心优势

<div class="feature-grid">

### ⚡ 高效自动化
- **零人工干预**：从消息回复到订单发货，全流程自动化
- **智能识别**：AI 自动理解买家意图，精准回复
- **批量处理**：支持批量发货、批量回复，提升效率

### 🔒 安全可靠
- **本地部署**：数据完全本地存储，隐私安全有保障
- **稳定运行**：基于成熟的 Node.js 和 Angular 框架
- **错误恢复**：完善的错误处理和日志记录机制

### 🎨 易于使用
- **直观界面**：现代化的 UI 设计，操作简单直观
- **快速配置**：几分钟即可完成初始配置
- **详细文档**：完整的使用文档和 API 说明

</div>

## 📖 快速导航

<div class="quick-nav">

[**🚀 快速开始**](/guide/getting-started)  
了解如何安装和运行项目

[**📚 功能说明**](/guide/features)  
查看所有功能的详细说明

[**🔧 项目结构**](/guide/project-structure)  
了解项目的代码组织结构

[**🛠️ 技术栈**](/guide/tech-stack)  
查看使用的技术栈和工具

[**📡 API 文档**](/api/)  
查看后端 API 接口文档

</div>

<style>
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.feature-grid h3 {
  margin-top: 0;
  color: var(--vp-c-brand-1);
  font-size: 1.2rem;
}

.feature-grid ul {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.feature-grid li {
  margin: 0.5rem 0;
  line-height: 1.6;
}

.quick-nav {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}

.quick-nav a {
  display: block;
  padding: 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.3s ease;
  background: var(--vp-c-bg-soft);
}

.quick-nav a:hover {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-soft-up);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
