/**
 * 排行榜：全部按明确、可复算的价格规则生成，数据来自 profiles.json（2026-10-20 历史参考，不含优惠码）。
 * 不是测速排名，也与编辑精选 TOP 5 无关。规则写在每个榜单的 rule 字段，页面原样展示。
 */
import { airports, type Airport } from './airports';
import { plansOf, costPerGb, perMonth, isCustom, type Plan } from './plans';

export interface RankRow { airport: Airport; value: number; plan: Plan; extra?: string }
export interface Ranking { id: string; title: string; rule: string; unit: string; lowerBetter: boolean; rows: RankRow[]; fmt: (v: number) => string }

const monthlyRegular = (slug: string) => plansOf(slug).filter((p) => p.period === 'monthly' && !isCustom(p) && p.gbPerMonth);
const yearlyRegular = (slug: string) => plansOf(slug).filter((p) => p.period === 'yearly' && !isCustom(p) && p.trafficGbPerPeriod);

function best(slugs: string[], pick: (slug: string) => RankRow | null, lowerBetter = true) {
  return slugs
    .map(pick)
    .filter((r): r is RankRow => !!r)
    .sort((a, b) => (lowerBetter ? a.value - b.value : b.value - a.value));
}
const slugs = airports.map((a) => a.slug);
const byId = (slug: string) => airports.find((a) => a.slug === slug)!;

export const rankings: Ranking[] = [
  {
    id: 'yearly-100-per-gb',
    title: '百元内年付每 GB 成本最低',
    rule: '只看年付价不超过 ¥100 的常规年付套餐（排除定制 / 独享档），计算「年价 ÷ 全年流量」，每家品牌取最低的一档，按每 GB 成本从低到高排序；成本相同按年价低者在前。全部按原价计算，不含优惠码；「优惠码」列里只有登记了折扣率的品牌才显示用码后的价格。',
    unit: '¥/GB', lowerBetter: true, fmt: (v) => `¥${v.toFixed(3)}`,
    rows: best(slugs, (s) => {
      const y = yearlyRegular(s).filter((p) => p.priceCny <= 100).sort((x, y) => costPerGb(x) - costPerGb(y) || x.priceCny - y.priceCny);
      return y[0] ? { airport: byId(s), value: costPerGb(y[0]), plan: y[0], extra: `¥${y[0].priceCny}/年 · ${y[0].trafficGbPerPeriod}GB/年 · 月均 ¥${(y[0].priceCny / 12).toFixed(2)}` } : null;
    }),
  },
  {
    id: 'entry-yearly',
    title: '年付入门价最低',
    rule: '取每家品牌「常规年付套餐」中价格最低的一档（排除定制 / 独享档），按年付价格从低到高排序；价格相同按全年总流量多者在前。年付需一次付清，请结合退款条款判断。',
    unit: '¥/年', lowerBetter: true, fmt: (v) => `¥${v}`,
    rows: best(slugs, (s) => {
      const y = yearlyRegular(s).sort((x, y) => x.priceCny - y.priceCny || (y.trafficGbPerPeriod ?? 0) - (x.trafficGbPerPeriod ?? 0));
      return y[0] ? { airport: byId(s), value: y[0].priceCny, plan: y[0], extra: `${y[0].trafficGbPerPeriod}GB/年 · ${y[0].gbPerMonth ?? Math.round((y[0].trafficGbPerPeriod ?? 0) / 12)}GB/月` } : null;
    }),
  },
  {
    id: 'monthly-per-gb',
    title: '月付每 GB 成本最低',
    rule: '对每家品牌的常规月付套餐计算「月价 ÷ 每月流量」，取最低值，按每 GB 成本从低到高排序。流量越大的档位通常越占优，请同时看入门价。',
    unit: '¥/GB', lowerBetter: true, fmt: (v) => `¥${v.toFixed(2)}`,
    rows: best(slugs, (s) => {
      const m = monthlyRegular(s).sort((x, y) => costPerGb(x) - costPerGb(y));
      return m[0] ? { airport: byId(s), value: costPerGb(m[0]), plan: m[0], extra: `${m[0].planName} ¥${m[0].priceCny}/${m[0].gbPerMonth}GB` } : null;
    }),
  },
  {
    id: 'yearly-per-month',
    title: '年付月均最低',
    rule: '取每家品牌年付套餐中「年价 ÷ 12」最低的一档（排除定制 / 独享档），按月均价从低到高排序。年付需一次付清，请结合退款条款判断。',
    unit: '¥/月', lowerBetter: true, fmt: (v) => `¥${v.toFixed(2)}`,
    rows: best(slugs, (s) => {
      const y = plansOf(s).filter((p) => p.period === 'yearly' && !isCustom(p)).sort((a, b) => perMonth(a)! - perMonth(b)!);
      return y[0] ? { airport: byId(s), value: perMonth(y[0])!, plan: y[0], extra: `${y[0].planName} ¥${y[0].priceCny}/年，${y[0].trafficGbPerPeriod}GB/年` } : null;
    }),
  },
  {
    id: 'plan-count',
    title: '套餐档位最多',
    rule: '统计每家品牌整理到的套餐档位数量（含各周期与流量包），按数量从多到少排序。档位多意味着选择细，但不代表更划算。',
    unit: '档', lowerBetter: false, fmt: (v) => `${v} 档`,
    rows: best(slugs, (s) => {
      const ps = plansOf(s);
      return ps.length ? { airport: byId(s), value: ps.length, plan: ps[0], extra: `${new Set(ps.map((p) => p.period)).size} 种周期` } : null;
    }, false),
  },
  {
    id: 'pack-per-gb',
    title: '不限时流量包每 GB 最低',
    rule: '仅统计提供一次性（不限时）流量包的品牌，取「包价 ÷ 包内流量」最低的一档，从低到高排序。流量包买的是灵活，不与月付直接比较。',
    unit: '¥/GB', lowerBetter: true, fmt: (v) => `¥${v.toFixed(2)}`,
    rows: best(slugs, (s) => {
      const k = plansOf(s).filter((p) => p.period === 'one-time').sort((a, b) => costPerGb(a) - costPerGb(b));
      return k[0] ? { airport: byId(s), value: costPerGb(k[0]), plan: k[0], extra: `${k[0].planName} ¥${k[0].priceCny}/${k[0].trafficGbPerPeriod}GB` } : null;
    }),
  },
];
export const rankingById = (id: string) => rankings.find((r) => r.id === id)!;
