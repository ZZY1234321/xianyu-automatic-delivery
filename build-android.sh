#!/bin/bash

# Android APK 构建脚本
# 使用方法: ./build-android.sh

set -e

echo "🚀 开始构建 Android APK..."

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 进入前端目录
cd frontend

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 检查是否已添加 Android 平台
if [ ! -d "android" ]; then
    echo "📱 初始化 Capacitor..."
    npx cap init "闲鱼智能助手" "com.guangfengjiyue.xianyu" --web-dir="dist/frontend/browser"
    
    echo "📱 添加 Android 平台..."
    npx cap add android
fi

# 构建前端
echo "🔨 构建前端应用..."
npm run build:mobile

# 打开 Android Studio
echo "📱 打开 Android Studio..."
echo "✅ 构建完成！"
echo ""
echo "📝 下一步："
echo "1. 在 Android Studio 中等待项目加载完成"
echo "2. Build → Build Bundle(s) / APK(s) → Build APK(s)"
echo "3. APK 文件位置: android/app/build/outputs/apk/release/app-release.apk"
echo ""
echo "💡 提示: 如果 Android Studio 没有自动打开，运行: npm run cap:android"

npx cap open android
