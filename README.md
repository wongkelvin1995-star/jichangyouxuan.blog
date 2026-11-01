# 机场优选 2026（jichangyouxuan.blog）

Astro 5 + TypeScript + Markdown 内容集合，纯静态输出（`dist/`），无运行时服务器。风格：**武道金色能量 · 白天橙蓝热血版**（七龙珠式热血氛围的原创演绎：亮橙×深蓝、蓝天白云荒野岩山、漫画集中线与爆炸框、火焰气场、少年漫描边标题字、飞身出拳的原创角色「小武」；首页纯 CSS 动效，内页零动画）。在 `src/data/site.ts` 把 `style` 改为 `sticker` / `jelly` / `crayon` / `planet` / `budo` 可切换历史风格；版权说明见下方「视觉与版权」。

## 本地运行

```bash
npm install
npm run dev        # 开发预览 http://localhost:4321
npm run build      # 生产构建，并自动执行 scripts/audit.mjs 自检
npm run preview    # 预览 dist
```

需要 Node 18.20+（推荐 22）。构建后 `dist/` 即可直接部署到任何静态托管。

## 目录结构

| 路径 | 作用 |
| --- | --- |
| `src/data/airports.json` | **34 家品牌与推广链接的唯一数据源**（链接逐字保留） |
| `src/data/plans.ts` | 由 profiles.json 派生的套餐、每 GB 成本等计算（全部为历史参考） |
| `src/data/rankings.ts` | 排行榜规则与计算（/rankings/，纯价格规则，非测速） |
| `src/data/coupons.ts` | 34 家优惠码登记表 |
| `src/data/categories.ts` | 文章分类专区（/guides/category/<slug>/）的 slug、名称与简介 |
| `src/data/updates.ts` | 更新记录（/updates/），只写真实变更 |
| `src/data/art.ts` + `src/components/Art.astro` | 图鉴 / 轮播卡片的渐变封面与首字图 |
| `src/data/faq.ts` / `checklist.ts` | FAQ 与购买检查清单 |
| `src/data/site.ts` | 站点常量、导航、更新日期、可选联系邮箱 |
| `src/content/guides/*.md` | 9 篇原创文章（frontmatter 控制标题、描述、日期） |
| `src/pages/` | 全部页面；`sitemap.xml.ts`、`search-index.json.ts` 为构建期生成 |
| `public/js/search*.js` | 中文站内搜索（浏览器本地） |
| `scripts/audit.mjs` | 构建后自检（死链、重复标题、品牌链接、sitemap、搜索等） |
| `scripts/indexnow.mjs` | IndexNow 提交脚本 |
| `deploy/` | Nginx / Vercel / Netlify 重定向示例 |

## 常用维护操作

- **新增/修改品牌**：编辑 `airports.json`；注意 `url` 必须保持完整。首页 TOP5 顺序在 `src/data/airports.ts` 的 `TOP5_SLUGS` 固定。
- **核验套餐价格**：在 `profiles.json` 对应套餐上改 `status` 并写日期，见 DATA-VERIFICATION.md；排行榜、价格页、详细页会自动跟随。
- **修改优惠码**：只改 `coupons.ts`；图鉴卡片、详细页、优惠码总表、首页同步更新，并在 `updates.ts` 记一笔。
- **新增文章分类**：在 `categories.ts` 增加一项，`name` 与文章 frontmatter 的 `category` 一致，分类页与 sitemap 自动生成。
- **发布/更新文章**：在 `src/content/guides/` 新增或修改 md；更新时同步修改 `updatedDate`，sitemap 的 lastmod 会跟随。
- **sitemap 日期（lastmod）**：`/sitemap.xml` 由 `src/pages/sitemap.xml.ts` 在每次构建时自动生成，不用手动编辑。文章跟随 `updatedDate`，品牌页跟随资料日期，其余静态页跟随 `site.ts` 里的 `PAGE_UPDATED`；改了哪一页的正文，就把那一页改成当天日期（只改样式不算）。`site.ts` 的 `updated` 只用于隐私、推广披露两页显示的日期。
- **联系邮箱**：在 `site.ts` 填写 `contactEmail`，关于/隐私页会自动显示。
- **Bing 验证 meta**：构建时设置环境变量 `PUBLIC_BING_VERIFY=你的验证码`；或把 Bing 提供的 `BingSiteAuth.xml` 放进 `public/`。

## 部署

1. 构建：`npm run build`，上传/发布 `dist/`。
2. 推荐 Cloudflare Pages / Netlify / Vercel：构建命令 `npm run build`，输出目录 `dist`。
3. **必须在托管平台完成**（静态文件做不到）：
   - 全站 HTTPS；
   - `www.jichangyouxuan.blog` → `https://jichangyouxuan.blog` 301；
   - `/index.html` → `/` 301（`public/_redirects` 已含常用规则；Netlify/Vercel/Nginx 示例见 `deploy/`）；
   - 未知路径返回真实 HTTP 404 并使用 `404.html`（以上平台默认支持）。
4. 部署后访问 `/robots.txt`、`/sitemap.xml`、`/<IndexNow key>.txt` 确认可访问。

## IndexNow

key 文件在 `public/2260ceac199153261137ab350fe00d2b.txt`。部署后运行：

```bash
npm run indexnow            # 只提交相对上次有变化的 URL（状态记录在 .indexnow-state.json）
npm run indexnow -- --dry   # 只预览
npm run indexnow -- --all   # 首次上线可全量提交
```

脚本比较每个页面 HTML 的哈希，只提交新增/变化的 URL，已删除的 URL 也会提交通知。请把 `.indexnow-state.json` 一并保存（不要提交到公开仓库也可）。

## 数据文件速查

| 文件 | 用途 |
| --- | --- |
| `src/data/airports.json` | 34 家品牌名称与推广入口（不得改写） |
| `src/data/profiles.json` | 每家的套餐、线路、客户端、适合人群、限制（详细页的内容来源） |
| `src/data/coupons.ts` | 优惠码登记表，有来源才填 |
| `src/data/plans.ts` | 由 profiles.json 派生的套餐、每 GB 成本等计算 |

## 视觉与版权

- 「武道金色能量」风格只借用**不受版权保护的风格元素**（亮橙×深蓝配色、漫画集中线、爆炸框、火焰气场、荒野岩山场景、热血字体），不使用任何既有动漫作品的角色、标志、服装纹样（如橙色道服加字样）、带星星的橙色球、龙或具体角色的发型轮廓与脸。吉祥物「小武」（蓝发逆风、红头带、藏青道服配金腰带、飞身出拳、手凝能量球）、首页头图、图鉴封面、LOGO 与 OG 图均为本站原创 SVG / CSS 绘制，源文件在 `src/components/Sprite.astro`、`public/favicon.svg` 与 `src/pages/index.astro`。
- 站内不出现任何动漫作品名、角色名或官方图片；栏目名（热血推荐、入门冒险、机场图鉴、线路实战、经典招式、战力分析、篇章解析、更新记录）只是风格化标题，H1 与 title 仍以机场关键词为主。
- 首页动效全部为 CSS / SVG（粒子、速度线、能量波、角色滑入、火焰边框），无第三方动画库；系统开启「减少动态效果」时自动关闭。文章与详细页不含动画。

## 右下角悬浮小武（纯装饰）

- 组件 `src/components/MascotFloat.astro`：只显示吉祥物头像，无音乐、无脚本、不可点击（`pointer-events:none`）。
- 2026-10-31 站长要求删除音乐播放器（Radio.astro / playlist.ts 已移除），仅保留形象。鼠标轨迹见 `public/js/orbit.js`（仅 pointer:fine，尊重 prefers-reduced-motion）。

## 全站推广框（优选灵动云 · 穿云）

组件 `src/components/PromoBanner.astro`，由 `Base.astro` 在所有页面右上角固定显示（随滚动跟随）；桌面默认展开，手机默认收起为「优选灵动云 穿云 ¥99/年」小胶囊，点开展开；关闭后在当前标签页内保持收起。文案中的套餐数字来自 `profiles.json`，宣传点（IPLC、原生 IP 解锁、节点数）为服务商宣称，页面已标注。火焰边框为 CSS 动画，`prefers-reduced-motion` 下关闭。

## 吉祥物图片（2026-10-31 站长强制置换）

- 首页首屏、页头 LOGO、推广框、电台按钮、文章 / 详细页 CTA 的吉祥物已由原创 SVG「小武」改为站长提供的图片：`public/img/mascot.webp`（900px，首屏）、`mascot-480.webp`（卡片）、`mascot-face.webp`（头像裁切）。组件 `src/components/Mascot.astro`。
- 该图片为站长指定并提供，站长声明已取得该图片的使用权（2026-10-31）。原创 SVG 小武仍保留在 `Sprite.astro`（`m-budo`），如需切回，把 `Mascot.astro` 改回 `<svg><use href="#mascot"/></svg>` 即可。
