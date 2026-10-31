// 构建后自检：node scripts/audit.mjs（npm run build 会自动执行）
import fs from 'node:fs';
import path from 'node:path';
import { search } from '../public/js/search-core.js';

const DIST = path.resolve('dist');
const SITE = 'https://jichangyouxuan.blog';
const problems = [];
const warns = [];
const fail = (m) => problems.push(m);
const warn = (m) => warns.push(m);

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const files = walk(DIST);
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const urlOf = (f) => '/' + path.relative(DIST, f).replace(/index\.html$/, '').replace(/\\/g, '/');

const pages = htmlFiles.map((f) => {
  const html = fs.readFileSync(f, 'utf8');
  const m = (re) => (html.match(re) || [])[1];
  return {
    f, url: urlOf(f), html,
    title: m(/<title>([^<]*)<\/title>/),
    desc: m(/<meta name="description" content="([^"]*)"/),
    canonical: m(/<link rel="canonical" href="([^"]*)"/),
    robots: m(/<meta name="robots" content="([^"]*)"/),
    h1s: [...html.matchAll(/<h1[ >][\s\S]*?<\/h1>/g)].map((x) => x[0].replace(/<[^>]+>/g, '').trim()),
  };
});

// 1. 基础 SEO
const seen = { title: new Map(), desc: new Map(), h1: new Map() };
for (const p of pages) {
  const noindex = /noindex/.test(p.robots || '');
  if (!p.title) fail(`${p.url} 缺少 title`);
  if (!p.desc) fail(`${p.url} 缺少 description`);
  if (!p.canonical) fail(`${p.url} 缺少 canonical`);
  if (p.h1s.length !== 1 && p.url !== '/404.html') fail(`${p.url} H1 数量 = ${p.h1s.length}`);
  if (p.url !== '/404.html' && p.canonical !== SITE + p.url) fail(`${p.url} canonical 不一致：${p.canonical}`);
  if (noindex && !['/search/', '/404.html'].includes(p.url) && !/^\/guides\/category\//.test(p.url)) fail(`${p.url} 出现意外 noindex`);
  if (noindex && /^\/guides\/category\//.test(p.url) && !/本专区目前只有 1 篇文章/.test(p.html)) fail(`${p.url} 分类页 noindex 但文章数不止 1 篇`);
  if (p.title && p.title.length > 70) warn(`${p.url} title 偏长（${p.title.length}）`);
  if (p.desc && (p.desc.length < 40 || p.desc.length > 200)) warn(`${p.url} description 长度 ${p.desc.length}`);
  if (!noindex) {
    for (const [k, v] of [['title', p.title], ['desc', p.desc], ['h1', p.h1s[0]]]) {
      if (!v) continue;
      if (seen[k].has(v)) fail(`重复 ${k}：${p.url} 与 ${seen[k].get(v)}`);
      else seen[k].set(v, p.url);
    }
  }
}

// 2. 内部链接
const exists = (u) => {
  const clean = u.split('#')[0].split('?')[0];
  if (!clean) return true;
  const p = path.join(DIST, clean);
  if (fs.existsSync(p) && fs.statSync(p).isFile()) return true;
  return fs.existsSync(path.join(p, 'index.html'));
};
let linkCount = 0;
for (const p of pages) {
  for (const m of p.html.matchAll(/<a [^>]*href="([^"]+)"/g)) {
    const h = m[1];
    if (/^(https?:|mailto:|tel:)/.test(h)) continue;
    linkCount++;
    if (!h.startsWith('/') && !h.startsWith('#')) fail(`${p.url} 相对链接 ${h}`);
    else if (h.startsWith('/') && !exists(h)) fail(`${p.url} 死链：${h}`);
    else if (h.includes('#') && h.split('#')[0]) {
      const target = pages.find((x) => x.url === h.split('#')[0]);
      const id = h.split('#')[1];
      if (target && id && !target.html.includes(`id="${id}"`)) fail(`${p.url} 锚点不存在：${h}`);
    }
  }
}

// 3. 品牌与推广链接
const airports = JSON.parse(fs.readFileSync('src/data/airports.json', 'utf8'));
const dir = pages.find((p) => p.url === '/airports/').html;
if (airports.length !== 34) fail(`品牌数量 ${airports.length} ≠ 34`);
if (new Set(airports.map((a) => a.name)).size !== 34) fail('品牌名称存在重复');
for (const a of airports) {
  if (!dir.includes(`href="${a.url}"`)) fail(`目录缺少完整推广链接：${a.name}`);
  const tag = dir.match(new RegExp(`<a [^>]*href="${a.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`));
  if (tag && !/rel="sponsored nofollow noopener"/.test(tag[0])) fail(`推广链接缺少 rel：${a.name}`);
  if (tag && !/target="_blank"/.test(tag[0])) fail(`推广链接缺少 target：${a.name}`);
}
const attach = process.env.AFFILIATE_SOURCE;
if (attach && fs.existsSync(attach)) {
  const src = fs.readFileSync(attach, 'utf8').split(/\r?\n/).map((l) => l.trim()).filter((l) => /^https?:\/\/\S+#\/\?code=\S+$/.test(l));
  const srcSet = new Set(src);
  if (src.length !== airports.length) fail(`原始资料条数 ${src.length} ≠ ${airports.length}`);
  airports.forEach((a) => { if (!srcSet.has(a.url)) fail(`与原始资料不一致：${a.name}`); });
  console.log(`✓ 已与原始资料逐条比对 ${src.length} 条推广链接`);
}

// 3b. 34 个品牌详细页：存在、有注册入口、有套餐表、实测写「待更新中」、汉字量足够，目录卡片不展示「推广入口」域名行
{
  const han = (t) => (t.match(/[一-鿿]/g) || []).length;
  for (const a of airports) {
    const pg = pages.find((x) => x.url === `/airports/${a.slug}/`);
    if (!pg) { fail(`缺少详细页：${a.name}`); continue; }
    if (!pg.html.includes(`href="${a.url}"`)) fail(`详细页缺少注册入口：${a.name}`);
    if (!pg.html.includes('待更新中')) fail(`详细页缺少「待更新中」：${a.name}`);
    if (!/<table[^>]*>[\s\S]*每 GB[\s\S]*<\/table>/.test(pg.html)) fail(`详细页缺少套餐表：${a.name}`);
    const text = pg.html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, '');
    if (han(text) < 900) fail(`详细页内容偏少（${han(text)} 字）：${a.name}`);
  }
  if (/<dt>推广入口<\/dt>/.test(dir)) fail('目录卡片仍显示「推广入口」');
  const cp = fs.readFileSync('src/data/coupons.ts', 'utf8');
  for (const a of airports) {
    const m = cp.match(new RegExp(`(?:^|\\n)\\s*"?${a.slug}"?: \\{ code: "([^"]+)"`));
    if (!m) { fail(`缺少优惠码登记：${a.name}`); continue; }
    const pg = pages.find((x) => x.url === `/airports/${a.slug}/`);
    if (pg && !pg.html.includes(m[1])) fail(`详细页未显示优惠码 ${m[1]}：${a.name}`);
  }
  console.log('✓ 34 个品牌详细页检查通过');
}
// 外部链接 rel
for (const p of pages) {
  for (const m of p.html.matchAll(/<a [^>]*href="(https?:\/\/[^"]+)"[^>]*>/g)) {
    if (m[1].includes('jichangyouxuan.blog')) continue;
    if (/aff|code=/.test(m[1]) && !/sponsored/.test(m[0])) fail(`${p.url} 外链缺少 sponsored：${m[1]}`);
  }
}
// 飞V / firefly / 大佬云 / 无忧
const names = airports.map((a) => a.name);
for (const n of ['飞V', 'firefly', '大佬云', '无忧']) if (names.filter((x) => x === n).length !== 1) fail(`品牌「${n}」应恰好出现 1 次`);
if (names.includes('大哥云')) fail('不应收录大哥云');

// 4. 首页第一名
const home = pages.find((p) => p.url === '/').html;
const top1 = home.indexOf('id="top1-title"');
if (top1 < 0 || !/id="top1-title">灵动云/.test(home)) fail('首页第一名不是灵动云');
const order = ['灵动云', '暮光加速', '微风网络', '飞猫云', '大佬云'].map((n) => home.indexOf(`>${n}`, home.indexOf('id="top5"')));
if (order.some((x, i) => x < 0 || (i && x < order[i - 1]))) fail('首页 TOP5 顺序不正确');
if (!home.includes('机场优选 2026：') || !home.includes('机场推荐与选购，')) fail('首页 H1 文案不符');

// 5. 文章
const gdir = path.join('src/content/guides');
const hanOf = (s) => (s.match(/[一-鿿]/g) || []).length;
const gfiles = fs.readdirSync(gdir).filter((f) => f.endsWith('.md'));
if (gfiles.length < 8) fail(`文章数量 ${gfiles.length} < 8`);
for (const f of gfiles) {
  const raw = fs.readFileSync(path.join(gdir, f), 'utf8');
  const body = raw.split(/^---$/m).slice(2).join('---');
  const n = hanOf(body);
  const links = (body.match(/\]\(\/[^)]*\)/g) || []).length;
  console.log(`  文章 ${f.replace('.md', '')}: 汉字 ${n}，站内链接 ${links}`);
  if (n < 1000 || n > 2600) fail(`${f} 汉字数 ${n} 不在 1000–2600`);
  if (links < 2) fail(`${f} 站内链接不足 2 条`);
  if (!pages.find((p) => p.url === `/guides/${f.replace('.md', '')}/`)) fail(`${f} 未生成页面`);
}

// 6. sitemap / robots
const sm = fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8');
const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
for (const l of locs) {
  const u = l.replace(SITE, '');
  const pg = pages.find((p) => p.url === u);
  if (!pg) fail(`sitemap 指向不存在的页面：${l}`);
  else if (/noindex/.test(pg.robots || '')) fail(`sitemap 含 noindex 页面：${l}`);
}
if (/\/search\/|404/.test(sm)) fail('sitemap 不应包含 /search/ 或 404');
if (!/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/.test(sm)) fail('sitemap 缺少 lastmod');
const robots = fs.readFileSync(path.join(DIST, 'robots.txt'), 'utf8');
if (!robots.includes(`Sitemap: ${SITE}/sitemap.xml`)) fail('robots.txt 缺少 Sitemap');
if (/Disallow:\s*\/\s*$/m.test(robots)) fail('robots.txt 屏蔽了全站');
const indexable = pages.filter((p) => !/noindex/.test(p.robots || '') && p.url !== '/sitemap/');
for (const p of indexable) if (!locs.includes(SITE + p.url)) fail(`可索引页面不在 sitemap：${p.url}`);
const key = files.find((f) => /[0-9a-f]{32}\.txt$/.test(f));
if (!key) fail('缺少 IndexNow key 文件');

// 7. 内容占位
for (const p of pages) {
  if (/(TODO|lorem ipsum|待补充|敬请期待)/i.test(p.html)) fail(`${p.url} 含占位文字`);
  if (/<img [^>]*(?!alt=)/.test(p.html) && /<img(?![^>]*alt=)/.test(p.html)) fail(`${p.url} 图片缺少 alt`);
}

// 8. 搜索
const docs = JSON.parse(fs.readFileSync(path.join(DIST, 'search-index.json'), 'utf8'));
const expect = {
  灵动云: (d) => d.k === 'brand' && d.t.includes('灵动云'),
  暮光加速: (d) => d.k === 'brand' && d.t.includes('暮光加速'),
  机场优选: (d) => d.k === 'page' || d.k === 'guide',
  机场推荐: (d) => true,
  便宜机场: (d) => d.k === 'guide',
  年付: (d) => d.k === 'guide',
  IEPL: (d) => d.k === 'guide',
  Clash: (d) => d.k === 'guide',
  小火箭: (d) => d.k === 'guide',
  飞V: (d) => d.k === 'brand' && d.t.includes('飞V'),
  firefly: (d) => d.k === 'brand' && d.t.includes('firefly'),
};
for (const [q, ok] of Object.entries(expect)) {
  const r = search(docs, q);
  if (!r.length || !r.some(ok)) fail(`搜索「${q}」没有得到预期结果`);
  else console.log(`  搜索「${q}」→ ${r.length} 条，首条：${r[0].t}`);
}
const rv = search(docs, '飞V').filter((d) => d.k === 'brand').map((d) => d.t);
const rw = search(docs, 'firefly').filter((d) => d.k === 'brand').map((d) => d.t);
if (rv.some((t) => t.includes('firefly')) || rw.some((t) => t.includes('飞V'))) fail('飞V 与 firefly 的品牌结果被混合');
if (rv.length !== 1 || rw.length !== 1) fail(`飞V/firefly 品牌结果数量异常：${rv} | ${rw}`);

// 9. 404
if (!fs.existsSync(path.join(DIST, '404.html'))) fail('缺少 404.html');

console.log(`\n页面 ${pages.length} 个，内部链接 ${linkCount} 条，sitemap URL ${locs.length} 个`);
warns.forEach((w) => console.log('⚠', w));
if (problems.length) { console.log('\n✗ 发现问题：'); problems.forEach((p) => console.log(' -', p)); process.exit(1); }
console.log('✓ 自检全部通过');
