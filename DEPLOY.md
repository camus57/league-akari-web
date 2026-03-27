# LeagueAkari Web - 部署说明

## ⚠️ 重要说明：国服 API 限制

由于腾讯游戏的反爬虫措施，**国服战绩查询功能需要后端代理服务器**才能正常工作。

### 问题原因
- 腾讯 API (`apps.game.qq.com`) 有严格的 CORS 限制
- 需要特定的 Referer 和 User-Agent 头
- 纯前端无法直接访问

### 解决方案

#### 方案 1: 使用提供的 Node.js 代理服务器（推荐）

1. **安装依赖**
   ```bash
   cd league-akari-web
   npm install express axios cors
   ```

2. **启动代理服务器**
   ```bash
   node proxy-server.js
   ```

3. **修改 API 配置**
   编辑 `src/services/cnApi.js`，将 API 请求指向代理服务器：
   ```javascript
   const API_BASE = 'http://localhost:3001/proxy'
   ```

4. **重新构建**
   ```bash
   npm run build
   ```

#### 方案 2: 仅使用国际服功能

如果不需要国服功能，可以直接部署到 GitHub Pages，国际服功能完全可用。

#### 方案 3: 使用第三方 API

考虑使用已公开的英雄联盟 API 服务（如 OP.GG、U.GG 等的非官方 API）。

---

## 国际服部署（无需后端）

### GitHub Pages 部署

1. **推送代码**
   ```bash
   git push origin main
   ```

2. **启用 Pages**
   - 访问 https://github.com/YOUR_USERNAME/league-akari-web/settings/pages
   - Source: GitHub Actions

3. **访问网站**
   ```
   https://YOUR_USERNAME.github.io/league-akari-web/
   ```

### Vercel / Netlify 部署

1. 连接 GitHub 仓库
2. 自动构建部署
3. 获得 HTTPS 域名

---

## 完整后端部署（支持国服）

### Docker 部署

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .

EXPOSE 3000 3001

CMD ["sh", "-c", "node proxy-server.js & npm start"]
```

### 环境变量

```bash
# 代理服务器配置
PORT=3001
ALLOWED_ORIGINS=https://your-domain.com

# Riot API Key（国际服）
RIOT_API_KEY=your_api_key
```

---

## 测试

### 本地测试

```bash
# 启动开发服务器（带代理）
npm run dev

# 访问 http://localhost:5173/league-akari-web/
```

### 测试国服功能

1. 确保代理服务器运行
2. 选择「国服」选项卡
3. 选择大区
4. 输入召唤师名称
5. 点击查询

---

## 故障排除

### 国服查询失败

**错误**: "查询失败：Failed to fetch"

**原因**: 代理服务器未运行或配置错误

**解决**:
1. 检查代理服务器是否运行：`node proxy-server.js`
2. 检查 `src/services/cnApi.js` 中的 API_BASE 配置
3. 检查浏览器控制台错误

### 国际服查询失败

**错误**: "API Key 无效"

**解决**:
1. 访问 https://developer.riotgames.com/
2. 重新获取 API Key
3. 注意 Key 的速率限制

### 构建失败

```bash
# 清理并重新安装
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## API 参考

### 国服 API 端点

```
GET /cmc/zmMcnTargetContentList
参数：r0, page, num, target, source, cid, name

GET /cmc/matchlist
参数：cid, uid, begidx, cnt

GET /cmc/rank
参数：cid, uid
```

### 国际服 API 端点

```
GET /riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}
GET /lol/summoner/v4/summoners/by-puuid/{puuid}
GET /lol/match/v5/matches/by-puuid/{puuid}/ids
GET /lol/match/v5/matches/{matchId}
```

---

## 许可证

MIT

## 免责声明

本项目仅供学习研究使用，不是 Riot Games 或腾讯的官方产品。
