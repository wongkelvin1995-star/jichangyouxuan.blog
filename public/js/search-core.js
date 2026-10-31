// 中文全文搜索核心：浏览器与 Node 通用。
// docs: [{ k:'brand'|'guide'|'page', t:标题, u:链接, s:摘要, a:别名, b:正文 }]

export const norm = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/[！-～]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/\s+/g, ' ')
    .trim();

export function tokens(q) {
  return norm(q).split(' ').filter(Boolean);
}

export function search(docs, q) {
  const ts = tokens(q);
  if (!ts.length) return [];
  const out = [];
  for (const d of docs) {
    const f = { t: norm(d.t), a: norm(d.a), s: norm(d.s), b: norm(d.b) };
    let score = 0;
    let ok = true;
    for (const t of ts) {
      let hit = 0;
      if (f.t.includes(t)) hit += f.t === t ? 140 : 60;
      if (f.a && f.a.split('|').some((x) => x === t)) hit += 120;
      else if (f.a.includes(t)) hit += 70;
      if (f.s.includes(t)) hit += 25;
      if (f.b.includes(t)) hit += 6 + Math.min(10, f.b.split(t).length - 1);
      if (!hit) { ok = false; break; }
      score += hit;
    }
    if (ok) {
      if (d.k === 'brand') score += 15;
      out.push({ d, score });
    }
  }
  return out.sort((x, y) => y.score - x.score || (x.d.o ?? 0) - (y.d.o ?? 0)).map((x) => x.d);
}

export function snippet(d, q, len = 90) {
  const ts = tokens(q);
  const body = String(d.b || d.s || '');
  const nb = norm(body);
  let idx = -1;
  for (const t of ts) { idx = nb.indexOf(t); if (idx > -1) break; }
  if (idx < 0) return String(d.s || '').slice(0, len * 2);
  // norm 会压缩空白，位置近似即可
  const start = Math.max(0, idx - 24);
  return (start > 0 ? '…' : '') + body.slice(start, start + len * 2) + '…';
}
