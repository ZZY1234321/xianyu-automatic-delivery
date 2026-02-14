/**
 * API 相关常量
 */

// 生产环境使用相对路径，开发环境使用完整URL
export const API_BASE = typeof window !== 'undefined' && window.location.port === '4200'
    ? 'http://localhost:3000'
    : '';
