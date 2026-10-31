import { getCollection } from 'astro:content';
import { SITE, abs, fmtDate } from '../data/site';
import { airports, rankOf } from '../data/airports';
import { categories } from '../data/categories';
import { profileOf } from '../data/plans';
import { updates } from '../data/updates';
import { PAGE_UPDATED } from '../data/site';

/** 仅包含规范、可索引的 URL；/search/、/404、/sitemap/ 不收录。lastmod 按各页内容来源的真实日期生成（品牌资料日期 / 文章 updatedDate / 手动维护的页面日期），纯视觉改版不会刷新。 */
export async function GET() {
  const guides = await getCollection('guides');
  const latestGuide = guides.reduce((m, g) => (g.data.updatedDate > m ? g.data.updatedDate : m), new Date(0));
  const stat = (path: string, lastmod: string, priority: string, freq = 'monthly') => ({ path, lastmod, priority, freq });
  const max = (...ds: string[]) => ds.reduce((m, d) => (d > m ? d : m), '2026-01-01');
  /** 品牌页：该品牌资料的核对/整理日期，与优惠码登记日期取较晚者（优惠码是页面真实内容） */
  const brandDate = (slug: string) => { const p = profileOf(slug); return max(p.verifiedAt ?? p.collectedAt, PAGE_UPDATED.couponsRegistered); };
  const brandsLatest = max(...airports.map((a) => brandDate(a.slug)));
  const latestUpdate = updates[0]?.date ?? SITE.updated;
  const catDate = (name: string) => fmtDate(guides.filter((g) => g.data.category === name).reduce((m, g) => (g.data.updatedDate > m ? g.data.updatedDate : m), new Date(0)));
  const urls = [
    stat('/', max(fmtDate(latestGuide), brandsLatest, PAGE_UPDATED['/']), '1.0', 'weekly'),
    stat('/airports/', max(brandsLatest, PAGE_UPDATED['/airports/']), '0.9', 'weekly'),
    ...airports.map((a) => stat(`/airports/${a.slug}/`, brandDate(a.slug), rankOf(a) ? '0.9' : '0.7', 'weekly')),
    stat('/prices/', max(brandsLatest, PAGE_UPDATED['/prices/']), '0.9', 'weekly'),
    stat('/rankings/', max(brandsLatest, PAGE_UPDATED['/rankings/']), '0.9', 'weekly'),
    stat('/coupons/', max(PAGE_UPDATED.couponsRegistered, PAGE_UPDATED['/coupons/']), '0.8', 'weekly'),
    stat('/budget-guide/', PAGE_UPDATED['/budget-guide/'], '0.8'),
    stat('/selection-guide/', PAGE_UPDATED['/selection-guide/'], '0.8'),
    stat('/guides/', fmtDate(latestGuide), '0.8', 'weekly'),
    ...guides.sort((a, b) => a.data.order - b.data.order).map((g) => stat(`/guides/${g.id}/`, fmtDate(g.data.updatedDate), '0.7')),
    ...categories.filter((c) => guides.filter((g) => g.data.category === c.name).length >= 2).map((c) => stat(`/guides/category/${c.slug}/`, catDate(c.name), '0.6')),
    stat('/updates/', latestUpdate, '0.5', 'weekly'),
    stat('/methodology/', PAGE_UPDATED['/methodology/'], '0.6'),
    stat('/faq/', PAGE_UPDATED['/faq/'], '0.6'),
    stat('/about/', PAGE_UPDATED['/about/'], '0.4', 'yearly'),
    stat('/affiliate-disclosure/', PAGE_UPDATED['/affiliate-disclosure/'], '0.4', 'yearly'),
    stat('/privacy/', PAGE_UPDATED['/privacy/'], '0.3', 'yearly'),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url>\n    <loc>${abs(u.path)}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n  </url>`)
    .join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
