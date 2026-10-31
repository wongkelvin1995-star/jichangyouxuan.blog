import { search, snippet, tokens } from './search-core.js';

const $ = (id) => document.getElementById(id);
const input = $('q'), box = $('results'), status = $('status');
let docs = null;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function mark(text, q) {
  let html = esc(text);
  for (const t of tokens(q)) {
    const re = new RegExp(esc(t).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    html = html.replace(re, (m) => '<mark>' + m + '</mark>');
  }
  return html;
}
const groupName = { brand: '品牌', guide: '文章', page: '页面' };

function render(q) {
  if (!docs) return;
  const list = search(docs, q);
  if (!tokens(q).length) { box.innerHTML = ''; status.textContent = ''; return; }
  status.textContent = list.length ? `找到 ${list.length} 条结果` : '';
  if (!list.length) {
    box.innerHTML = '<div class="empty" style="margin-top:18px"><p><strong>没有找到「' + esc(q) + '」的相关结果</strong></p><p class="muted small">试试更短的词，例如「年付」「线路」「灵动云」；或浏览<a href="/airports/">机场目录</a>、<a href="/guides/">全部文章</a>。</p></div>';
    return;
  }
  let html = '';
  for (const k of ['brand', 'guide', 'page']) {
    const items = list.filter((d) => d.k === k);
    if (!items.length) continue;
    html += `<h2 class="res-group">${groupName[k]}（${items.length}）</h2><div class="result-list">`;
    for (const d of items) {
      html += `<a class="result-item" href="${esc(d.u)}"><h3>${mark(d.t, q)}</h3><p>${mark(snippet(d, q), q)}</p></a>`;
    }
    html += '</div>';
  }
  box.innerHTML = html;
}

async function init() {
  const qs = new URLSearchParams(location.search).get('q') || '';
  input.value = qs;
  try {
    const r = await fetch('/search-index.json');
    docs = await r.json();
  } catch (e) {
    status.textContent = '搜索索引加载失败，请刷新页面或直接浏览目录。';
    return;
  }
  render(qs);
  input.addEventListener('input', () => {
    const v = input.value;
    const u = new URL(location.href);
    if (v.trim()) u.searchParams.set('q', v); else u.searchParams.delete('q');
    history.replaceState(null, '', u);
    render(v);
  });
}
init();
