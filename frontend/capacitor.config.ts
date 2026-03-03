import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.guangfengjiyue.xianyu',
  appName: '闲鱼智能助手',
  webDir: 'dist/frontend/browser/browser',
  server: {
    // 开发时可以使用本地服务器
    // url: 'http://localhost:3099',
    // cleartext: true
  },
  android: {
    allowMixedContent: true,
    buildOptions: {
      keystorePath: undefined, // 签名密钥路径（打包时设置）
      keystoreAlias: undefined, // 密钥别名
      keystoreAliasPassword: undefined,
      keystorePassword: undefined
    }
  }
};

export default config;
