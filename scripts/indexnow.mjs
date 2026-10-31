// IndexNow 提交：只提交相对上次有变化（新增/修改/删除）的 URL。
// 用法：npm run build && npm run indexnow [-- --dry] [-- --all]
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const HOST = 'jichangyouxuan.blog';
const BASE = `https://${HOST}`;
const DIST = path.resolve('dist');
const STATE = path.resolve('.indexnow-state.json');
const dry = process.argv.includes('--dry');
const all = process.argv.includes('--all');

const keyFile = fs.readdirSync(DIST).find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) { console.error('dist 中没有 IndexNow key 文件'); process.exit(1); }
const key = keyFile.replace('.txt', '');

const sm = fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8');
const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const hashOf = (u) => {
  const rel = u.replace(BASE, '');
  const f = path.join(DIST, rel, rel.endsWith('/') ? 'index.html' : '');
  return crypto.createHash('sha1').update(fs.readFileSync(f)).digest('hex');
};
const now = Object.fromEntries(urls.map((u) => [u, hashOf(u)]));
const prev = fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, 'utf8')) : {};

const changed = urls.filter((u) => all || prev[u] !== now[u]);
const removed = Object.keys(prev).filter((u) => !(u in now));
const list = [...changed, ...removed];
console.log(`新增/修改 ${changed.length}，删除 ${removed.length}`);
list.forEach((u) => console.log(' -', u));
if (!list.length) { console.log('没有需要提交的 URL。'); process.exit(0); }
if (dry) process.exit(0);

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key, keyLocation: `${BASE}/${keyFile}`, urlList: list }),
});
console.log('IndexNow 响应：', res.status, res.statusText);
if (res.status === 200 || res.status === 202) {
  fs.writeFileSync(STATE, JSON.stringify(now, null, 2));
  console.log('已记录状态到 .indexnow-state.json');
} else {
  console.error('提交失败，未更新状态。请确认站点已部署且 key 文件可访问。');
  process.exit(1);
}
