# GitHub 推送指南

## 当前状态

- ✅ 项目已创建并初始化 Git
- ✅ 代码已提交到本地仓库
- ✅ 远程仓库已配置：`https://github.com/camus57/league-akari-web.git`
- ❌ 需要 GitHub 认证才能推送

## 推送方法（选择一种）

### 方法一：使用 Personal Access Token (推荐)

1. **创建 Token**
   - 访问 https://github.com/settings/tokens
   - 点击 "Generate new token (classic)"
   - 勾选权限：`repo` (全部), `workflow`
   - 生成后复制 Token（只显示一次！）

2. **使用 Token 推送**
   ```bash
   cd /home/admin/openclaw/workspace/league-akari-web
   
   # 方法 A: 直接在 URL 中使用 Token（一次性）
   git push https://camus57:YOUR_TOKEN@github.com/camus57/league-akari-web.git main
   
   # 方法 B: 配置凭证存储（推荐）
   git config --global credential.helper store
   git push
   # 输入用户名：camus57
   # 密码：粘贴你的 Token
   ```

### 方法二：配置 SSH 密钥

1. **生成 SSH 密钥**
   ```bash
   ssh-keygen -t ed25519 -C "camus57@users.noreply.github.com"
   # 一路回车即可
   ```

2. **添加公钥到 GitHub**
   ```bash
   cat ~/.ssh/id_ed25519.pub
   # 复制输出的内容
   ```
   - 访问 https://github.com/settings/keys
   - 点击 "New SSH key"
   - 粘贴公钥内容，保存

3. **更改远程仓库为 SSH**
   ```bash
   cd /home/admin/openclaw/workspace/league-akari-web
   git remote set-url origin git@github.com:camus57/league-akari-web.git
   git push -u origin main
   ```

### 方法三：使用 GitHub CLI

1. **安装 gh**
   ```bash
   # Ubuntu/Debian
   sudo apt update && sudo apt install gh
   
   # 或者下载：https://github.com/cli/cli/releases
   ```

2. **登录并推送**
   ```bash
   gh auth login
   # 选择 GitHub.com -> HTTPS -> 登录浏览器
   
   cd /home/admin/openclaw/workspace/league-akari-web
   git push -u origin main
   ```

## 快速推送命令（如果有 Token）

```bash
cd /home/admin/openclaw/workspace/league-akari-web

# 替换 YOUR_TOKEN 为你的 Personal Access Token
export GITHUB_TOKEN="YOUR_TOKEN"
git remote set-url origin https://camus57:${GITHUB_TOKEN}@github.com/camus57/league-akari-web.git
git push -u origin main
```

## 推送成功后

1. 访问 https://github.com/camus57/league-akari-web
2. 进入 **Settings** → **Pages**
3. 在 **Build and deployment** 下：
   - Source: 选择 **GitHub Actions**
4. 等待部署完成（约 1-2 分钟）
5. 访问你的网站：`https://camus57.github.io/league-akari-web/`

## 当前提交记录

```bash
cd /home/admin/openclaw/workspace/league-akari-web
git log --oneline
```

最新提交：
- `6d33477` docs: 更新部署文档，添加国服使用说明
- `ab653af` feat: 添加国服战绩查询功能
- `92b8310` feat: 初始版本 - LeagueAkari 网页版战绩查询

## 需要帮助？

如果你已经有 GitHub Token，告诉我，我可以帮你执行推送命令。
或者你可以手动执行上述命令完成推送。
