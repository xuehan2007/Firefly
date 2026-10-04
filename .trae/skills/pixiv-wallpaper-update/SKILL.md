---
name: pixiv-wallpaper-update
description: Update Firefly homepage wallpapers from a Pixiv artist — download originals, sort desktop/mobile, build 3840/1600 masters, sync backgroundWallpaper.json. Use when replacing or adding Pixiv wallpapers.
---

# Pixiv 画师壁纸更新流水线

为 Firefly 博客首页从指定 Pixiv 画师拉取壁纸：下载原图 → 按横竖分类 → 生成母版 → 更新清单 → 构建 → 验证 → 提交。

## 项目事实（不要重新摸索）

- 桌面母版目录 `src/assets/wallpapers/`，文件名 `ba-wallpaper-N.jpg`；手机母版目录 `src/assets/wallpapers/mobile/`，同名编号。
- 清单 `src/data/backgroundWallpaper.json` 的 `src.desktop` / `src.mobile`，路径相对 `src/`，形如 `assets/wallpapers/ba-wallpaper-51.jpg`。
- 母版规格：**桌面宽 3840、手机宽 1600，等比缩放不裁切，JPEG q92 + chromaSubsampling 4:4:4 + mozjpeg**。
- 分档由 Astro 构建时自动生成：桌面 1280/1600/1920/2560/3840，手机 750/1080/1290/1440，AVIF + WebP。
- 引用链：`src/components/layout/WallpaperSection.astro` → `ImageWrapper.astro`（`import.meta.glob("../../assets/**")`）；`src/pages/dashboard.astro` 用 glob 动态取桌面图，增删无需改代码。
- LQIP 占位色在 `src/constants/lqips.json`；内容指纹缓存在 `src/constants/.lqip-cache.json`（随仓库提交）。`scripts/generate-lqips.ts` 按 sha256 内容指纹失效，同名替换图片后直接重跑脚本即可自动重算，无需手动删条目。
- pximg 下载必须带请求头 `Referer: https://www.pixiv.net/`，否则 403。
- 线上 `https://eee123.dpdns.org`（Cloudflare Pages，push master 自动部署）。

## 强制门禁

1. **先登录**：Pixiv 元数据接口要登录态。用浏览器打开 `https://www.pixiv.net/`，让用户本人完成登录，不要代输密码。
2. **先暂存、给预览、等确认**：原图下载到 `src/assets/wallpapers/_inbox/<画师名>/{desktop,mobile}`，生成带编号拼图给用户看。用户明确确认（替换/追加/剔除编号）后才允许动正式文件。
3. **删除必须有明确编号**：用户说"删掉一些""清理"时，先出候选清单和编号，用户回复具体编号后才执行；删除前复述最终清单。禁止自行批量删除。
4. **版权提醒**：画师主页若无公开转载授权声明，交付时提醒用户署名或取得授权。R-18（接口字段 `xRestrict != 0`）与非全年龄作品默认排除。

## 流程

### 1. 定位画师与抓取元数据

在已登录 Pixiv 的浏览器内执行。接口、字段与踩坑见 [references/pixiv-api.md](references/pixiv-api.md)。

- 只有画师名：打开 `https://www.pixiv.net/search_user.php?nick=<URL编码的名字>` 取 uid；有主页链接直接用。
- 作品列表：`/ajax/user/{uid}/profile/all` 拿全部 illust id。
- 逐件详情：`/ajax/illust/{id}` 取标题、`width/height`、`pageCount`、`xRestrict`、原图 URL；多 P 再取 `/ajax/illust/{id}/pages`。
- 按作品标签筛选目标题材（如蔚蓝档案：`ブルーアーカイブ` / `Blue Archive` / `蔚蓝档案`）。
- 注意浏览器 evaluate 环境里 `Array.map` 可能返回 undefined，脚本一律用 `for` 循环；每次导航后等待 1–2 秒。

### 2. 分类与排除

- `width > height` → 桌面；`height > width` → 手机。
- 桌面原图宽度应 ≥ 3840，手机原图高度建议 ≥ 3000，否则 4K/高分屏会糊。
- 多 P 作品逐页判断；排除游戏截图、A4 比例漫画页、低分辨率页、明显非壁纸内容，即使同属一个作品。

### 3. 下载原图到暂存目录

PowerShell（单张/批量循环均可）：

```powershell
$headers = @{
  "Referer" = "https://www.pixiv.net/"
  "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/138.0.0.0 Safari/537.36"
}
Invoke-WebRequest -Uri "https://i.pximg.net/img-original/img/....jpg" -Headers $headers -OutFile "src/assets/wallpapers/_inbox/<name>/desktop/x01.jpg"
```

下载后用脚本生成带编号预览拼图交用户确认：

```bash
node .trae/skills/pixiv-wallpaper-update/scripts/contact-sheet.mjs "src/assets/wallpapers/_inbox/<name>/desktop" "_inbox/<name>/_preview-desktop.jpg" 4 520
node .trae/skills/pixiv-wallpaper-update/scripts/contact-sheet.mjs "src/assets/wallpapers/_inbox/<name>/mobile" "_inbox/<name>/_preview-mobile.jpg" 5 300
```

同时给出每张的编号、尺寸、作品链接表格和排除项说明，等用户回复部署方式（替换 / 追加 / 剔除编号）。

注：拼图脚本渲染文字标签时在 Windows 沙箱可能报 fontconfig cache 写入错误并返回退出码 1，但 JPG 已正常写出，确认文件存在即可，忽略该报错。

### 4. 生成母版

在项目根目录执行（sharp 从项目依赖解析）：

```bash
# 桌面：宽 3840，输出 ba-wallpaper-51.jpg 起
node .trae/skills/pixiv-wallpaper-update/scripts/make-masters.mjs \
  "src/assets/wallpapers/_inbox/<name>/desktop" "<临时输出目录>" 3840 ba-wallpaper- 51
# 手机：宽 1600，输出 ba-wallpaper-1.jpg 起
node .trae/skills/pixiv-wallpaper-update/scripts/make-masters.mjs \
  "src/assets/wallpapers/_inbox/<name>/mobile" "<临时输出目录>" 1600 ba-wallpaper- 1
```

追加时桌面起始号 = 现有最大编号 + 1；替换手机池时从 1 开始。生成后检查尺寸与体积再落位（Move-Item），避免直接污染正式目录。

### 5. 更新清单与其他引用

- 按用户确认的编号集合重写 `src/data/backgroundWallpaper.json` 的 desktop/mobile 数组（条目与文件做双向校验：无缺失、无未登记文件）。
- `dashboard.astro` 无需改动。
- 同名替换图片（如整个手机池换内容）后，直接重跑即可，脚本按内容指纹自动重算变化项：

```bash
node node_modules/tsx/dist/cli.mjs scripts/generate-lqips.ts
```

- 删除 `_inbox` 暂存目录，避免被 glob/LQIP 扫描。

### 6. 构建

优先 `pnpm build`。若后台 shell 报 `the global target of the pnpm shim points back at the shim`，绕过 pnpm 直接调用本地依赖：

```bash
node node_modules/tsx/dist/cli.mjs scripts/generate-github-card-data.ts
node node_modules/tsx/dist/cli.mjs scripts/generate-lqips.ts
node node_modules/tsx/dist/cli.mjs scripts/generate-vndb-covers.ts
node node_modules/astro/bin/astro.mjs build
node node_modules/tsx/dist/cli.mjs scripts/prune-pio-assets.ts
node node_modules/tsx/dist/cli.mjs scripts/subset-fonts.ts
node node_modules/tsx/dist/cli.mjs scripts/minify-inline-scripts.ts
# pagefind 需要本地 .bin 在 PATH
$env:PATH = "$PWD/node_modules/.bin;$env:PATH"; node node_modules/tsx/dist/cli.mjs scripts/run-pagefind.ts
```

已知正常现象：`prune-pio-assets.ts` 会删除桌面壁纸的母版 JPG 产物（线上只服务 AVIF/WebP），不是误删。构建日志中文章封面 404 等与壁纸无关的既有错误不要混为本次改动。

### 7. 本地验证

`astro preview` 依赖 Cloudflare KV 绑定会 500；静态验证用：

```bash
cd dist/client && python -m http.server 4322
```

浏览器检查：

- 视口 1920×1080：`#banner-images-container img` 可见图 currentSrc 为 1920w AVIF，srcset 含 1280–3840；新编号全部出现在容器 HTML；已删编号不出现在 ≥1600w 档。
- 视口 390×844（DPR 3）：可见竖版 currentSrc 为 750–1440w 档，比例约 2.17:1（全面屏）或 1.78:1。
- 注意桌面与手机文件同名（如 `ba-wallpaper-7`），判断"删除是否残留"时必须按 srcset 宽度区分槽位，不能只看文件名。

### 8. 提交、推送与线上核验

- Conventional Commits，如 `feat: 更新首页壁纸为 Pixiv 画师 X 的作品`，正文列清增删数量、母版规格、画师主页。
- 只暂存壁纸相关文件；构建顺带刷新的 `src/constants/github-card-data.json` 等无关改动不要混入。
- PowerShell 不支持 bash heredoc，多行提交信息用 `@' ... '@` here-string。
- 推送 GitHub 直连可能被重置，经本机代理（Clash Verge 默认 7897）：
  `git -c http.proxy=http://127.0.0.1:7897 -c https.proxy=http://127.0.0.1:7897 push origin master`（仅本次生效）。
- 线上核验（push 后约 2–4 分钟）：抓 `https://eee123.dpdns.org/` 首页 HTML，确认引用新编号且资源 HEAD 返回 200。**Cloudflare（Linux）构建的 AVIF 哈希后缀与本地 Windows 构建可能不同**（前缀一致），不要用本地完整哈希当探针；应从线上首页 HTML 提取实际 URL，或只匹配哈希前缀。
