# SEO 上线前检查（最近构建 2026-10-31）

`npm run build` 会自动运行 `scripts/audit.mjs`，下列项目均已通过：

| 检查项 | 结果 |
| --- | --- |
| 页面数 / 内部链接 | 67 个页面（34 个品牌详细页、9 篇文章、7 个分类专区、排行榜、优惠码总表、更新记录等），约 4550 条内部链接，0 死链，锚点均存在 |
| 每页唯一 title / description / H1（可索引页面） | 无重复；每页恰好 1 个 H1 |
| canonical | 每页与自身 URL 一致，统一 https 非 www、结尾 `/` |
| 意外 noindex | 无。**仅 `/search/` 与 404 是有意 noindex**（避免搜索参数页占用索引） |
| sitemap.xml | 64 个可索引 URL，lastmod 为内容真实日期；不含 /search/、404 |
| robots.txt | 允许所有爬虫（含 Bingbot），含 Sitemap 行 |
| 34 个品牌与推广链接 | 数量 34，与原始资料逐条比对一致；rel=`sponsored nofollow noopener`，target=`_blank` |
| 首页第一名 | 灵动云；TOP5 顺序固定 |
| 9 篇文章 | 汉字数均在 1000–1500，每篇 ≥2 条站内链接，全文在静态 HTML 中 |
| 中文搜索 | 灵动云、暮光加速、机场优选、机场推荐、便宜机场、年付、IEPL、Clash、小火箭、飞V、飞为 均有正确结果；飞V 与 飞为的品牌结果互不混合 |
| 移动端 | 375/390px 与桌面 1280px 无横向溢出；正文字号 ≥16px |
| 结构化数据 | Organization、WebSite(SearchAction)、BreadcrumbList、Article（文章）、ItemList（首页/目录）、FAQPage（/faq/） |
| 动画 | 全部尊重 `prefers-reduced-motion` |

## 实际发现并已处理的问题

- 4 篇文章初稿汉字数不足 1000，已补充实用内容；
- 首页吉祥物气泡与吉祥物重叠、手机端页面左右边距丢失，已修复；
- 苹果图标初次生成为空白，已重新生成。

## 已知限制 / 需你在上线后处理

1. **www→非 www、HTTP→HTTPS 的 301 需要在托管平台配置**（静态文件无法实现），见 README 与 `deploy/`。
2. **没有已核验的套餐价格**：价格页只有计算器；这是诚实选择，也意味着 `/prices/` 内容较"工具型"。核验后补充数据会明显增强该页价值。
3. **独立品牌页只有灵动云**；其余 33 家仅在目录中，因为缺少可核对资料。
4. **没有联系方式**：建议填写 `contactEmail`，有利于信任度与纠错。
5. 首页与文章 1 都包含「机场优选 2026」：首页定位品牌/泛词，文章 1 定位"如何选择"的长尾意图（见 CONTENT-PLAN.md）。
6. 搜索结果页为 noindex；站内搜索依赖 JS，无 JS 时提供目录/文章直达链接。
7. 本次未进行线上 Lighthouse / Bing URL Inspection 实测（需要部署后进行）。

## 2026-10-31 增补

- 新增 `/rankings/`（5 个 ItemList 结构化数据，规则写在页面上）、`/coupons/`（覆盖「<品牌>优惠码」长尾词）、`/updates/`、`/guides/category/<slug>/`（7 个分类专区，CollectionPage 结构化数据），均已加入 sitemap 与站内搜索索引。
- 首页改为武道金色能量版式，H1 文案与 TOP5 顺序未变；动效仅在首页，使用 CSS / SVG，无额外 JS 库，`prefers-reduced-motion` 下关闭。内页无动画。
- OG 图重绘为原创角色版本（1200×630，约 120KB），favicon / apple-touch-icon 同步更新。

## 2026-10-31 深夜全面排查（武道热血版上线后）

自动检查（`scripts/audit.mjs` + Playwright 46 个页面×两种宽度 + 文本相似度脚本）：

| 项目 | 结果 |
| --- | --- |
| 页面 / 内链 / sitemap | 67 页、4565 条内链、0 死链；sitemap 58 条（只含 ≥2 篇文章的分类页） |
| title / description / H1 / canonical | 全部唯一；title 均 ≤60 字符；每页 1 个 H1；canonical 与 URL 一致 |
| noindex | `/search/`、404、以及只有 1 篇文章的 6 个分类专区（满 2 篇自动开放并进入 sitemap） |
| 结构化数据 | 所有 JSON-LD 可解析：Organization / WebSite / Breadcrumb / ItemList / FAQPage / Article / CollectionPage |
| 手机端（390px） | 23 类页面无横向溢出、无 JS 错误、导航可展开、搜索 / 价格筛选可用。修复：排行榜与优惠码表格里按钮的隐藏文字导致页面可横向滚动（`.btn{position:relative}` + `html{overflow-x:clip}`） |
| 同质化 | 34 个详细页两两 8 字 shingle Jaccard 中位数 0.24、最高 0.43，模板共有内容占每页 19–31%；9 篇文章两两最高 0.13。未见整页重复 |
| 占位文字 | 无（「敬请期待」改写为「将在之后更新」） |

人工判断与待办见 BING-LAUNCH-CHECKLIST.md。
