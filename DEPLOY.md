# LeagueAkari Web 部署指南

## 项目已完成构建 ✅

项目已成功构建，输出目录：`dist/`

## 部署到 GitHub 的步骤

### 1. 创建 GitHub 仓库

1. 访问 https://github.com/new
2. 仓库名称：`league-akari-web`
3. 设置为 **Public**
4. **不要** 勾选 "Add a README file"
5. 点击 "Create repository"

### 2. 初始化并推送代码

在项目目录下执行以下命令：

```bash
cd /home/admin/openclaw/workspace/league-akari-web

# 初始化 Git
git init

# 添加所有文件
git add .

# 提交
git commit -m "feat: 初始版本 - LeagueAkari 网页版战绩查询"

# 添加远程仓库 (替换 YOUR_USERNAME 为你的 GitHub 用户名)
git remote add origin https://github.com/YOUR_USERNAME/league-akari-web.git

# 推送
git branch -M main
git push -u origin main
```

### 3. 启用 GitHub Pages

1. 进入仓库的 **Settings** → **Pages**
2. 在 **Build and deployment** 部分：
   - Source: 选择 **GitHub Actions**
3. 等待部署完成（约 1-2 分钟）

### 4. 访问网站

部署完成后，你的网站将在以下地址可用：
```
https://YOUR_USERNAME.github.io/league-akari-web/
```

## 使用说明

### 国服查询（无需 API Key）

1. 选择 **国服** 选项卡
2. 选择大区（如：艾欧尼亚、黑色玫瑰等）
3. 输入召唤师名称
4. 点击查询

### 国际服查询

1. 选择 **国际服** 选项卡
2. 访问 [Riot Developer Portal](https://developer.riotgames.com/)
3. 登录获取 **Personal API Key**
4. 在网站上输入：
   - Riot ID (格式：游戏名#标签，例如：Faker#KR1)
   - 选择赛区
   - 输入 API Key
5. 点击查询

## 注意事项

- **国服**：无需 API Key，直接查询全部 34 个大区
- **国际服 API Key 限制**: 开发用 Key 有速率限制 (20 请求/秒，100 请求/2 分钟)
- **不要将 API Key 提交到 Git**: `.env` 文件已在 `.gitignore` 中
- **生产环境**: 如需正式部署，请申请 Production API Key

## 自定义配置

如需修改部署路径，编辑 `vite.config.js` 中的 `base` 选项：

```js
export default defineConfig({
  base: '/你的仓库名/',  // 例如：'/league-akari-web/'
  // ...
})
```

## 功能特性

- ✅ **国服支持** - 全部 34 个大区，无需 API Key
- ✅ **国际服支持** - 韩服、日服、欧服、美服、亚服
- ✅ 显示召唤师信息和等级
- ✅ 显示排位赛段位和胜率
- ✅ 展示近期比赛详情（国服 10 场，国际服 5 场）
- ✅ 显示英雄、KDA、装备、补刀、伤害等数据
- ✅ 响应式设计，支持移动端
- ✅ 一键切换国服/国际服

## 技术栈

- Vue 3 + Vite
- Tailwind CSS
- Axios
- Riot Games API v5
