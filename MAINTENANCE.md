# MAINTENANCE — Quartz 博客站维护手册

> 本文件是这个站点的完整维护说明，供后期（AI 或人）快速上手。
> 写于 2026-09-30。若操作与本文件冲突，以实际文件为准并更新本文件。

---

## 1. 项目概览

| 项 | 值 |
|---|---|
| 线上地址 | https://neptune003.github.io/Note/ |
| 本地预览 | http://localhost:8080 （需手动启动，见 §5） |
| 项目路径 | `E:\Fileee\Workkkk\GithubQuartz\Note` |
| GitHub 仓库 | https://github.com/NEPTUNE003/Note （账号 NEPTUNE003） |
| 默认分支 | `main` |
| 框架 | Quartz **v5.0.0**（上游 https://github.com/jackyzha0/quartz ，分支 `v5`） |
| 内容 | 7 篇 Markdown 笔记（6 篇正文 + 1 篇首页），分 3 个组 |
| 运行环境 | Windows 11 · Node **v24.16.0** · npm 11.13.0 · Git 2.53（Quartz 5 要求 Node ≥22，勿降级） |

**架构一句话**：本地写 Markdown → `git push` → GitHub Actions 自动构建 → GitHub Pages 托管，全程免费、无需登录任何控制台。

---

## 2. 目录结构

```
E:\Fileee\Workkkk\GithubQuartz\
├── MAINTENANCE.md          ← 本文件（若放在仓库外）
└── Note\                   ← 项目根 = git 仓库根
    ├── content/            ★ 所有笔记都在这里，唯一需要经常动的目录
    │   ├── index.md        ← 首页（目录页，链接是手写的，新增分组要更新它）
    │   ├── C++/C++.md
    │   ├── FreeRTOS/FreeRTOS.md
    │   └── 嵌入式/         ← 4 篇：嵌入式软件分层、通信协议、存储单位、存储器分类
    ├── quartz.config.yaml  ★ 站点配置（标题/主题色/字体/baseUrl/插件）
    ├── quartz.config.default.yaml  ← 框架默认配置（不要动，会被升级覆盖）
    ├── .github/workflows/deploy.yml ★ CI/CD 部署流水线
    ├── quartz/             ← 框架源码（TSX 组件、SCSS 样式），改外观时动这里
    │   ├── components/     ← 布局组件（Header/Footer/Explorer…）
    │   ├── styles/         ← 样式，其中 custom.scss 是留给自定义 CSS 的
    │   └── bootstrap-cli.mjs + bootstrap-worker.mjs  ← ⚠️ 必须保持 755 可执行位，见 §7.1
    ├── docs/               ← Quartz 官方文档（本地可查，勿删）
    ├── public/             ← 构建产物（自动生成，已 gitignore）
    ├── node_modules/       ← 依赖（自动生成，已 gitignore）
    └── .quartz/plugins/    ← 已编译插件（自动生成，已 gitignore）
```

**规则**：写笔记只碰 `content/`；改外观碰 `quartz.config.yaml` 和 `quartz/`；其余尽量别动。

---

## 3. 日常操作速查

### 3.1 上传一篇新笔记（最常用）

```bash
# 1. 把 xxx.md 复制进 content\ 对应分组（文件夹 = 分组）
#    例：content\嵌入式\新笔记.md
#    例：想新建分组 → 直接建文件夹 content\算法\

# 2.（可选）本地预览，见 §5

# 3. 发布
cd E:\Fileee\Workkkk\GithubQuartz\Note
git add .
git commit -m "add: 笔记标题"
git push
```

约 1 分钟后 Actions 自动部署完成（可在 https://github.com/NEPTUNE003/Note/actions 查看进度）。

- **分组 = 文件夹**：笔记放哪个文件夹，网站上就出现在哪个分组，没有其他设置。
- **新增顶层分组时**：还要手动在 `content/index.md` 里加一行链接（首页目录是手写的），否则首页看不到入口（分组页本身仍可通过左侧文件树访问）。
- 一步到位的偷懒写法：`npx quartz sync`（自动 add + commit + push）。

### 3.2 整理/移动笔记（改分组）

```bash
git mv 'content/旧位置/文件.md' 'content/新分组/'
# 改完预览，确认后 commit + push
```

**必须用 `git mv`**（不要在资源管理器直接拖动后裸 commit，虽然 git 通常也能识别重命名，但 git mv 更稳）。

### 3.3 修改站点配置

编辑 `quartz.config.yaml`，常用字段：

```yaml
configuration:
  pageTitle: Note              # 浏览器标签页标题
  baseUrl: neptune003.github.io/Note   # ⚠️ 换域名/仓库名才改，否则 RSS/sitemap 全错
  theme:
    colors: { lightMode: { secondary: "#284b63" } }   # 主题色（链接/按钮）
    typography: { header: ..., body: ... }             # 字体
plugins: [...]                 # 插件开关，改完可能需要 npx quartz plugin install --from-config
```

改完本地预览确认 → push。

### 3.4 改外观/布局

| 想改什么 | 动哪里 |
|---|---|
| 颜色、字体、间距等纯样式 | `quartz.config.yaml` 或 `quartz/styles/custom.scss` |
| 某个区块的结构（页头、侧边栏、目录） | `quartz/components/*.tsx` |
| 增删功能（图谱、搜索、评论…） | `quartz.config.yaml` 的 `plugins` 列表 |

---

## 4. 部署流水线（怎么从 push 变成上线）

文件：`.github/workflows/deploy.yml`

```
push 到 main
  → build 作业（ubuntu-latest）：
      checkout(fetch-depth:0) → setup-node@24 → 缓存 ~/.npm
      → 缓存 .quartz/plugins → npm ci → npx quartz plugin install
      → npx quartz build → 上传 public/ 为 Pages 制品
  → deploy 作业：actions/deploy-pages@v4 → 发布到 https://neptune003.github.io/Note/
```

**GitHub 侧的既有设置（一般不用动）**：

- Pages 已开启，Source = **GitHub Actions**（2026-09-30 通过 API `POST /repos/NEPTUNE003/Note/pages {"build_type":"workflow"}` 开启）
- 若部署作业报 environment 保护规则错误 → Settings → Environments 删除 `github-pages` 后重跑
- 凭证：git push 用的是 **Windows 凭证管理器**里存的 GitHub 凭证（`cmdkey /list` 可见 `git:https://github.com`，用户 NEPTUNE003）。本文件不记录任何 token/密码。

---

## 5. 本地预览

```bash
cd E:\Fileee\Workkkk\GithubQuartz\Note
npx quartz build --serve        # 首次构建 + 起服务，看到 Serving at http://localhost:8080
```

- 打开 http://localhost:8080 ，改笔记会**热更新**（自动刷新）
- **停服务**：终端 Ctrl+C 或直接关窗口
- ⚠️ localhost 是临时的：关掉终端就"拒绝连接"——这不是故障，重新跑上面命令即可
- ⚠️ 后台常驻启动（关终端也不停）：
  `cmd /c "start /min cmd /c npx quartz build --serve"`（在项目目录执行）
- 纯重建不预览：`npx quartz build`（产物在 `public/`）

---

## 6. 升级 Quartz 框架（上游有更新时）

```bash
git fetch upstream                       # upstream → jackyzha0/quartz（已配好）
git merge upstream/v5                    # 合并上游更新
npm install                              # 依赖可能变化
npx quartz plugin install --from-config  # 插件可能变化
npx quartz build --serve                 # 本地验证
git push                                 # 发布（CI 会再验证一遍）
```

冲突高发区：`quartz.config.yaml`（我们改过 baseUrl 等）。解决原则：**保留我们的自定义值，采纳上游的新结构**。

---

## 7. 踩坑记录（历史故障 + 解法，再遇到直接对照）

### 7.1 CI 报 `sh: 1: quartz: Permission denied`（exit 127）

**原因**：Windows 上 git 不保留可执行位，`quartz/bootstrap-cli.mjs` 被记成 644，Linux CI 上无法执行。
**解法**（已修复一次，commit `14386e2`；若重新克隆/复制文件后复发）：

```bash
git update-index --chmod=+x quartz/bootstrap-cli.mjs quartz/bootstrap-worker.mjs
git commit -m "fix: restore executable bit on quartz CLI entrypoints"
git push
```

**预防**：在 Windows 向本仓库复制任何带 shebang（`#!/...`）的 `.mjs` 文件后，检查 `git ls-files -s <file>` 是否为 `100755`。

### 7.2 部署作业失败但 build 成功

**原因**：仓库未开启 Pages，或 Source 不是 GitHub Actions。
**解法**：Settings → Pages → Source 选 "GitHub Actions"（或用凭证管理器里的凭证调 API 开启，见 §4）。

### 7.3 访问 http://localhost:8080 显示"拒绝连接"

**原因**：serve 进程没在跑（它是临时的）。
**解法**：重新执行 §5 命令。不是网站坏了，线上站点不受影响。

### 7.4 网站根路径 404（但子页面正常）

**原因**：`content/index.md` 缺失。
**解法**：补回 `content/index.md`（首页）。它同时承担"目录页"职责，里面的链接是手写的。

### 7.5 构建警告 `isn't yet tracked by git, dates will be inaccurate`

无害。新文件还没被 git 跟踪时，created/modified 日期取不准。commit 后消失。

### 7.6 PowerShell 里中文文件名显示乱码

纯显示问题（控制台编码），**文件本身完好**，网站上也正常。若需确认，用
`git -c core.quotepath=false ls-files` 查看真实文件名。

### 7.7 历史残留（2026-09-30 已清理，供考古）

- 旧项目 `E:\Fileee\Github_TechNotes\Tech_Notes` 早已删除（本地无残留、回收站无、GitHub 上 Tech_Notes 仓库 404）
- 已清理：PowerShell 历史里 60 条 quartz/Tech_Notes 记录（备份在
  `%APPDATA%\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt.bak`）、
  npx 缓存 2 个 quartz 包、npm 整体缓存
- 现项目是从零重建的，与旧项目无 git 关联

### 7.8 构建时出现 `Could not load plugin "@local/random-knowledge" to detect category. Skipping.`

**预期警告，不是故障**（每次 build 都会出现一次，本地和 Actions 都一样）。"随机知识点"按钮是本仓库自装组件，不是真 npm 包，Quartz 探测不到它的类别只好跳过——组件本身靠 `quartz.ts` 里的 `componentRegistry.register` 注册、靠 `quartz.config.yaml` 的 `source: "@local/random-knowledge"` 条目进 layout，两处都在才会显示。以后若按钮消失，先查这两处是否被改动；`source` 必须是 `@scope/name` 格式（裸名会被 `parsePluginSource` 直接报错中断构建）。

---

## 8. 注意事项（红线）

1. **仓库是完全公开的**——笔记内容勿放隐私（账号、密码、未公开项目细节）。
2. **不要跑 `npx quartz create`**——会用模板覆盖 `quartz.config.yaml`（丢自定义配置）。
3. **不要删** `.github/workflows/deploy.yml`、`content/index.md`、`quartz/bootstrap-cli.mjs` 的可执行位。
4. `baseUrl` 只有在换仓库名/域名时才改，改动必须与实际地址完全一致（不含 `https://`）。
5. `node_modules/`、`public/`、`.quartz/` 是生成物，不要提交（已被 .gitignore 排除，`git add -A` 时无需过滤）。
6. 改了 `quartz/`（框架源码）后务必本地 `npx quartz build --serve` 验证再 push——CI 只做构建不做视觉检查。
7. 升级前先建一个检查点 commit，便于回退：`git commit -am "checkpoint: pre-upgrade"`。

---

## 9. 常用命令合集

```bash
# —— 日常 ——
npx quartz build --serve                  # 本地预览（最常用）
git add . && git commit -m "..." && git push   # 发布
git pull                                  # 多设备同步（先拉再写）

# —— 构建诊断 ——
npx quartz build                          # 只构建
npm ci                                    # 从 lockfile 重装依赖（干净环境）
npx quartz plugin install --from-config   # 按配置重装插件
npm ls                                    # 查依赖树

# —— Git ——
git log --oneline -10                     # 近期改动
git status                                # 当前状态
git remote -v                             # origin=自己的仓库, upstream=quartz 上游
git ls-files -s quartz/bootstrap-cli.mjs  # 应为 100755（见 §7.1）
git update-index --chmod=+x <file>        # 修复可执行位

# —— 线上状态 ——
# Actions 运行记录: https://github.com/NEPTUNE003/Note/actions
# 站点: https://neptune003.github.io/Note/
```

---

## 10. 维护记录（append-only）

| 日期 | 操作 | 关键 commit |
|---|---|---|
| 2026-09-30 | 清理旧 Quartz 残留（历史/缓存） | — |
| 2026-09-30 | 从零重建：Quartz 5 + Note 仓库 + 内容迁移 + 首页 | `3d313d2` |
| 2026-09-30 | 开启 Pages(build_type=workflow)；修 CI 可执行位 | `14386e2` |
| 2026-09-30 | 笔记按 C++ / FreeRTOS / 嵌入式 分组 | `1dde1c4` |
| 2026-10-01 | 图片移入 `嵌入式/images/`；`custom.scss` 加图片块级排版规则 | `07c1e0e` |
| 2026-10-01 | 笔记改名：`环境配置` → `ESP32环境配置（vscode）`（含首页链接更新） | `3dc526e` |
| 2026-10-01 | `通信协议.md` 删引言，加协议索引表（页内锚点跳转） | `e513f80` |
| 2026-10-01 | 右侧栏随机知识点按钮（新组件 `RandomKnowledge`，`content/知识点/` 随机跳转，reader-mode 随侧栏淡出） | `9bd7764` |
| 2026-10-01 | 修随机按钮跳转：`spaNavigate` 改传 URL 对象（字符串 base 会让 SPA 链接重写报错并回退整页刷新） | `84f8b1d` |

> 后续每次有结构性操作，在此表追加一行。
