# LeagueAkari Web - 英雄联盟战绩查询

一个基于 Riot API 的网页版英雄联盟战绩查询工具。

## 功能

- 🔍 通过 Riot ID 查询召唤师信息
- 📊 查看近期比赛历史
- 🏆 显示排位赛信息
- 🌏 支持多个赛区

## 技术栈

- Vue 3 + Vite
- Tailwind CSS
- Riot Games API v5

## 快速开始

### 获取 API Key

1. 访问 [Riot Developer Portal](https://developer.riotgames.com/)
2. 登录你的 Riot 账号
3. 点击 "Personal API Key" 获取开发用 Key

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 部署到 GitHub Pages

```bash
# 构建
npm run build

# 推送到 GitHub
git add .
git commit -m "deploy: 初始版本"
git push origin main
```

然后在 GitHub 仓库设置中启用 GitHub Pages。

## API 说明

### 端点路由

- **美洲**: americas.api.riotgames.com
- **欧洲**: europe.api.riotgames.com
- **亚洲**: asia.api.riotgames.com
- **韩国**: kr.api.riotgames.com
- **日本**: jp.api.riotgames.com

### 查询流程

1. 使用 Riot ID (gameName#tagLine) 调用 Account API 获取 PUUID
2. 使用 PUUID 调用 Summoner API 获取召唤师信息
3. 使用 PUUID 调用 Match API 获取比赛列表
4. 使用 Match ID 获取详细比赛信息

## 注意事项

- 开发环境 API Key 有速率限制 (20 请求/秒)
- 生产环境需要申请 Production Key
- 需要遵守 Riot API 使用政策

## 许可证

MIT

## 免责声明

本项目不是 Riot Games 的官方产品，也不受 Riot Games 认可或支持。
League of Legends 和 Riot Games 是 Riot Games, Inc. 的商标或注册商标。
