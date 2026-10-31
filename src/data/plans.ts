/**
 * 套餐数据来自 profiles.json（站长另一博客在 2026-10-20 整理的 34 家机场资料）。
 * 默认标注为「历史参考」（status: reference）；当某家 profile 写有 verifiedBy（例如站长提供的官网套餐页截图）时，该家全部套餐标为 verified（已核对）。字段说明见 DATA-VERIFICATION.md。
 */
import profiles from './profiles.json';

export type Period = 'monthly' | 'quarterly' | 'half-year' | 'yearly' | 'one-time';
export type PlanStatus = 'verified' | 'reference';

export interface Plan {
  status: PlanStatus;
  airportSlug: string;
  planName: string;
  priceCny: number;
  period: Period;
  /** 该计费周期内可用的总流量（GB）：月付=每月，年付=每月流量×12，一次性包=总量 */
  trafficGbPerPeriod: number;
  /** 每月可用流量（一次性包为 null） */
  gbPerMonth: number | null;
  note: string;
  /** 资料整理日期 YYYY-MM-DD */
  verifiedOn: string;
  /** official=整理时读取过服务商官网；third-party=按公开资料整理 */
  sourceKind: 'official' | 'third-party';
}

export interface Source { label: string; url: string }
export interface Profile {
  status: string;
  sourceType: string;
  collectedAt: string;
  verifiedAt: string | null;
  /** 填写后该品牌套餐视为已核对（如：站长提供的官网套餐页截图） */
  verifiedBy?: string;
  officialSite: string;
  intro: string;
  regions: string[];
  lineTypes: string[];
  protocols: string[];
  clients: string[];
  aiCompat: string;
  streamingCompat: string;
  suitableFor: string[];
  notSuitableFor: string[];
  limits: string[];
  coupon: string;
  sources: Source[];
  plans: { name: string; period: Period; priceCny: number; gbPerMonth: number | null; totalGb: number; note: string }[];
}

export const profileOf = (slug: string): Profile => (profiles as unknown as Record<string, Profile>)[slug];

export const plans: Plan[] = Object.entries(profiles as unknown as Record<string, Profile>).flatMap(([slug, p]) =>
  p.plans.map((x) => ({
    status: (p.verifiedBy ? 'verified' : 'reference') as PlanStatus,
    airportSlug: slug,
    planName: x.name,
    priceCny: x.priceCny,
    period: x.period,
    trafficGbPerPeriod: x.totalGb,
    gbPerMonth: x.gbPerMonth,
    note: x.note,
    verifiedOn: p.verifiedAt ?? p.collectedAt,
    sourceKind: p.sourceType === 'official' ? ('official' as const) : ('third-party' as const),
  })),
);

export const plansOf = (slug: string) => plans.filter((p) => p.airportSlug === slug);

export const periodLabel: Record<Period, string> = {
  monthly: '月付',
  quarterly: '季付',
  'half-year': '半年付',
  yearly: '年付',
  'one-time': '一次性流量包',
};

export const periodMonths: Record<Period, number | null> = {
  monthly: 1,
  quarterly: 3,
  'half-year': 6,
  yearly: 12,
  'one-time': null,
};

/** 每 GB 参考成本 = 周期价格 ÷ 该周期内总流量 */
export const costPerGb = (p: Plan) => p.priceCny / p.trafficGbPerPeriod;
/** 月均费用：一次性流量包没有周期，返回 null */
export const perMonth = (p: Plan) => (periodMonths[p.period] ? p.priceCny / periodMonths[p.period]! : null);
/** 定制/独享类档位：价格与普通档位不可直接比较 */
export const isCustom = (p: Plan) => /定制|独享|独立|专属/.test(p.planName + p.note);

export const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, ''));

/** 起步价：最便宜的月付套餐（排除定制档）；没有月付时取最便宜的任意套餐 */
export function startPlan(slug: string): Plan | undefined {
  const ps = plansOf(slug).filter((p) => !isCustom(p));
  const m = ps.filter((p) => p.period === 'monthly').sort((a, b) => a.priceCny - b.priceCny)[0];
  return m ?? ps.sort((a, b) => a.priceCny - b.priceCny)[0];
}
/** 最低每 GB 成本：在同一周期内比较的月付（排除定制档） */
export function bestMonthlyGb(slug: string): Plan | undefined {
  return plansOf(slug).filter((p) => p.period === 'monthly' && !isCustom(p)).sort((a, b) => costPerGb(a) - costPerGb(b))[0];
}
/** 摘要：给目录卡片使用，如「¥20/月起 · 100GB · BGP（常规套餐）」 */
export function summaryLine(slug: string): string {
  const s = startPlan(slug);
  const pr = profileOf(slug);
  if (!s) return '暂无套餐资料';
  const unit = s.period === 'monthly' ? '/月起' : s.period === 'one-time' ? '起（一次性）' : `/${periodLabel[s.period]}起`;
  const gb = s.gbPerMonth ? `${s.gbPerMonth}GB/月` : `${s.trafficGbPerPeriod}GB`;
  const lines = pr.lineTypes.slice(0, 2).join('、');
  return `¥${fmt(s.priceCny)}${unit} · ${gb}${lines ? ' · ' + lines : ''}`;
}

/** 全站套餐统计：页面文案一律从这里读，避免写死数字过期 */
export const planStats = (() => {
  const total = plans.length;
  const verified = plans.filter((p) => p.status === 'verified').length;
  const verifiedBrands = [...new Set(plans.filter((p) => p.status === 'verified').map((p) => p.airportSlug))];
  return { total, verified, reference: total - verified, verifiedBrands };
})();
