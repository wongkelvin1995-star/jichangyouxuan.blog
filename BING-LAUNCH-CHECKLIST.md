# Bing 上线检查清单（需要你本人操作）

## 上线前
- [ ] 部署 `dist/` 到托管平台，绑定 `jichangyouxuan.blog`；
- [ ] 强制 HTTPS；`www` → 非 www 301；`/index.html` → `/` 301（见 README / deploy/）；
- [ ] 浏览器打开 `https://jichangyouxuan.blog/robots.txt`、`/sitemap.xml`、`/2260ceac199153261137ab350fe00d2b.txt`，确认 200；
- [ ] 打开一个不存在的地址，确认返回 404 状态（开发者工具 Network 查看）。

## Bing Webmaster Tools（https://www.bing.com/webmasters）
1. [ ] 用微软账号登录，**添加站点** `https://jichangyouxuan.blog/`；
2. [ ] 验证所有权，三选一：
   - 导入 Google Search Console；
   - 把 Bing 给的 `BingSiteAuth.xml` 放到项目 `public/` 后重新部署；
   - 或构建时设置 `PUBLIC_BING_VERIFY=验证码`（输出 `msvalidate.01` meta）；
3. [ ] **提交 Sitemap**：`https://jichangyouxuan.blog/sitemap.xml`；
4. [ ] **IndexNow**：部署后在项目目录运行 `npm run indexnow -- --all`（首次全量），之后只用 `npm run indexnow`；
5. [ ] **URL 检查 / 提交 URL**：先提交首页、`/airports/lingdongyun/`、`/airports/`、`/prices/` `/rankings/`、`/coupons/` 与 9 篇文章里最重要的 3–4 篇；
6. [ ] 检查「站点扫描 / SEO 报告」是否有错误。

## 上线后 1–4 周
- [ ] 在 Bing 搜索 `site:jichangyouxuan.blog` 观察收录数量（预期逐步增长到约 60 页（sitemap 当前 58 条））；
- [ ] 每周在 Webmaster Tools 查看抓取错误、已编入索引页面、查询词；
- [ ] 若 1–2 周仍未收录：检查是否有外部链接、内容是否被判重复、sitemap 是否被读取；
- [ ] 每次更新内容后：修改 `updatedDate`/`SITE.updated` → 构建 → 部署 → `npm run indexnow`；
- [ ] 自然增加外部入口：社交媒体账号主页、你已有博客中**自然相关**的引用（不要站群互链）。

## 关于"短时间排到首页"的现实说明
收录通常几天到几周；"灵动云"等**品牌词**较容易获得排名，"机场推荐""梯子推荐"等**大词**竞争极强，且该领域受搜索引擎严格审查。长期靠：核验后的真实价格数据、你自己的真实试用记录、持续更新。本站无法保证具体排名。
