/**
 * API 相关常量
 */

// 生产环境使用相对路径，开发环境使用完整URL
// 如果是在开发环境（Angular dev server 4200端口），使用完整URL
// 否则使用相对路径（生产环境或通过后端代理访问）
export const API_BASE = typeof window !== 'undefined' && window.location.port === '4200'
    ? 'http://localhost:3099'
    : '';
