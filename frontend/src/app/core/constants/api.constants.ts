/**
 * API 相关常量
 */

// 检测是否在 Capacitor 环境中（移动端）
const isCapacitor = typeof window !== 'undefined' && (window as any).Capacitor;

// 移动端 API 地址配置（可以在 Capacitor 配置中设置，或使用环境变量）
// 默认值：如果部署在服务器上，需要修改为服务器地址
const MOBILE_API_BASE = (window as any).MOBILE_API_BASE || 
                        localStorage.getItem('api_base_url') || 
                        'http://localhost:3099';

// 生产环境使用相对路径，开发环境使用完整URL
// 如果是在开发环境（Angular dev server 4200端口），使用完整URL
// 如果是移动端（Capacitor），使用配置的移动端 API 地址
// 否则使用相对路径（生产环境或通过后端代理访问）
export const API_BASE = (() => {
    if (isCapacitor) {
        // 移动端：使用配置的服务器地址
        return MOBILE_API_BASE;
    }
    if (typeof window !== 'undefined' && window.location.port === '4200') {
        // 开发环境
        return 'http://localhost:3099';
    }
    // 生产环境：使用相对路径
    return '';
})();

// 导出 API 基础地址设置函数（用于移动端动态配置）
export function setMobileApiBase(url: string) {
    localStorage.setItem('api_base_url', url);
    // 重新加载页面以应用新配置
    window.location.reload();
}

// 检测是否在移动端环境（更可靠的检测方式）
function isMobileEnvironment(): boolean {
    if (typeof window === 'undefined') return false;
    
    // 方法1: 检测 Capacitor（最可靠）
    if ((window as any).Capacitor) {
        console.log('[API配置] 检测到 Capacitor 环境');
        return true;
    }
    
    // 方法2: 检测协议（capacitor:// 或 file://）
    const protocol = window.location.protocol;
    if (protocol === 'capacitor:' || protocol === 'file:' || protocol === 'http:' || protocol === 'https:') {
        // 如果不在浏览器中（没有 window.location.hostname 或 hostname 为空），可能是打包应用
        if (!window.location.hostname || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            // 检查是否有 Android/iOS 标识
            const ua = navigator.userAgent || '';
            if (/android/i.test(ua) || /iPad|iPhone|iPod/.test(ua)) {
                console.log('[API配置] 检测到移动端环境（通过协议和 UA）');
                return true;
            }
        }
    }
    
    // 方法3: 检测是否在 Android WebView 中
    if ((window as any).Android) {
        console.log('[API配置] 检测到 Android WebView');
        return true;
    }
    
    // 方法4: 如果 localStorage 中有 api_base_url 配置，且不是 localhost，认为是移动端
    const savedApiBase = localStorage.getItem('api_base_url');
    if (savedApiBase && !savedApiBase.includes('localhost') && !savedApiBase.includes('127.0.0.1')) {
        console.log('[API配置] 检测到移动端配置');
        return true;
    }
    
    return false;
}

// 获取当前 API 基础地址（动态读取，支持运行时配置）
export function getApiBase(): string {
    const isMobile = isMobileEnvironment();
    
    if (isMobile) {
        // 移动端：动态读取配置
        let mobileBase = (window as any).MOBILE_API_BASE || 
                        localStorage.getItem('api_base_url') || 
                        '';
        
        // 如果配置为空或者是 localhost，提示需要配置
        if (!mobileBase || mobileBase.includes('localhost') || mobileBase.includes('127.0.0.1')) {
            console.warn('[API配置] ⚠️ 移动端未配置服务器地址或使用了 localhost，请配置正确的服务器地址');
            // 仍然返回配置的值，但会在登录时显示错误提示
            if (!mobileBase) {
                mobileBase = 'http://localhost:3099'; // 默认值，但会失败
            }
        }
        
        // 调试日志
        console.log('[API配置] 移动端环境:', {
            isCapacitor: !!(window as any).Capacitor,
            userAgent: navigator.userAgent?.substring(0, 50),
            protocol: window.location.protocol,
            hostname: window.location.hostname,
            mobileBase,
            localStorage: localStorage.getItem('api_base_url')
        });
        
        return mobileBase;
    }
    
    if (typeof window !== 'undefined' && window.location.port === '4200') {
        // 开发环境
        return 'http://localhost:3099';
    }
    
    // 生产环境：使用相对路径
    return '';
}
